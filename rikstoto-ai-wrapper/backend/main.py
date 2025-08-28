"""
Rikstoto AI Model Testing Platform - Backend API

This module provides a FastAPI backend for testing various Hugging Face text generation models.
It supports JSON data input, customizable prompts, and adjustable generation parameters.

Author: Rikstoto Development Team
Version: 1.0.0
License: MIT
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import json
import os
from dotenv import load_dotenv
import requests
from openai import AzureOpenAI
import anthropic
import google.generativeai as genai
import hashlib
from datetime import datetime, timedelta
import uuid
import asyncio
import time
from concurrent.futures import ThreadPoolExecutor, as_completed

# Load environment variables from .env file
load_dotenv()

# LangSmith imports (optional - only if available)
try:
    from langsmith import traceable
    from langsmith.wrappers import wrap_openai
    import langsmith
    LANGSMITH_AVAILABLE = os.getenv('LANGSMITH_TRACING', 'false').lower() == 'true'
    if LANGSMITH_AVAILABLE:
        print(f"✅ LangSmith tracing enabled")
        print(f"   Project: {os.getenv('LANGSMITH_PROJECT', 'Not set')}")
        print(f"   Endpoint: {os.getenv('LANGSMITH_ENDPOINT', 'Not set')}")
        print(f"   API Key: {'Set' if os.getenv('LANGSMITH_API_KEY') else 'Not set'}")
        print(f"   Environment: {os.getenv('ENVIRONMENT', 'Not set')}")
    else:
        print(f"⚠️ LangSmith tracing disabled (LANGSMITH_TRACING={os.getenv('LANGSMITH_TRACING', 'not set')})")
except ImportError:
    LANGSMITH_AVAILABLE = False
    print("⚠️ LangSmith not installed - tracing disabled")
    print("⚠️ LangSmith not available - tracing disabled")
    # Create dummy decorator if LangSmith not available
    def traceable(**kwargs):
        def decorator(func):
            return func
        return decorator

# In-memory cache for JSON data and AI responses
json_cache = {}  # Format: {session_id: {"json": data, "timestamp": datetime}}
response_cache = {}  # Format: {cache_key: {"response": data, "timestamp": datetime}}
CACHE_TTL_MINUTES = 30  # Cache TTL

# Initialize FastAPI application
app = FastAPI(
    title="Rikstoto AI Model Wrapper - API Version",
    description="API for testing Hugging Face text generation models with JSON data input",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Add longer timeout for production environment (Render has 30s default)
if os.getenv("RENDER"):
    print("🚀 Running on Render - extended timeouts enabled for O3 models")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class GenerationRequest(BaseModel):
    """Request model for text generation endpoint.
    
    Attributes:
        model_name: Hugging Face model identifier
        system_prompt: The prompt template (can include {{json}} placeholder)
        json_data: Optional JSON string to be inserted into the prompt
        session_id: Optional session ID to use cached JSON data
        use_cache: Whether to check response cache (default: True)
        max_length: Maximum number of tokens to generate (default: 500)
        temperature: Controls randomness in generation (0.0-1.0, default: 0.7)
        top_p: Nucleus sampling parameter (0.0-1.0, default: 0.9)
        top_k: Top-k sampling parameter (default: 50)
    """
    model_name: str
    system_prompt: str
    json_data: Optional[str] = None
    session_id: Optional[str] = None
    use_cache: Optional[bool] = True
    max_length: Optional[int] = 500
    temperature: Optional[float] = 0.7
    top_p: Optional[float] = 0.9
    top_k: Optional[int] = 50

class ModelInfo(BaseModel):
    """Information about an available AI model.
    
    Attributes:
        name: Model identifier for Hugging Face API
        display_name: User-friendly name for UI display
        description: Brief description of model capabilities
    """
    name: str
    display_name: str
    description: str

# Default prompts for each model (optimized for their strengths based on 2024/2025 research)
MODEL_DEFAULTS = {
    "gpt-4o": {
        "system_prompt": """Du er Rikstoto Innsikt, en AI-basert analyseassistent spesialisert på norsk hesteveddeløp og totalisatorspill.

**OPPGAVE**: Analyser følgende Stalltips-resultat og gi en pedagogisk forklaring på norsk (200-350 ord). NB: Dette er Stalltips (ferdig kupong til 198 kr), IKKE systemspill:

{{json}}

**TILGJENGELIGE DATA**: Du vil motta detaljert JSON med følgende felt:
- `product`: Spilltype (V75/V65/V5/DD/LD)
- `markings`: Dine valgte hester per løp
- `raceResults`: Komplette resultater med hester, posisjoner, odds, form
- `result.correctRaces`: Antall rette løp
- `payout.totalWon`: Total gevinst i NOK
- `betDetails.totalCost`: Innsats
- `betDetails.systemPlay`: Om det er systemspill
- Odds, form, driver/trainer info, oddsMovement for hver hest

**INSTRUKSJONER**:

1. **Struktur** (skriv som sammenhengende tekst i paragrafer):
   - Første paragraf: Oppsummering av spilltype, resultat og hovedanalyse av odds/utfall
   - Andre og tredje paragraf: 3-4 konkrete observasjoner om hva som skjedde og hvorfor
   - Siste setning: Påminnelse om ansvarlig spilling

2. **Tone og stil**:
   - Språk: Norsk bokmål, klar og enkel
   - Tone: Nøktern, informativ, vennlig men profesjonell
   - Perspektiv: Forklarende, aldri rådgivende
   - Unngå gamblingfremmende språk som "burde", "bør satse", "neste gang"
   - Skriv flytende tekst uten punktlister eller bullet points
   - Snakk direkte til kunden. Bruk "du".

3. **Viktige regler**:
   - Forklar HVORFOR utfallet ble som det ble, ikke bare hva som skjedde
   - ALLTID inkluder påminnelse om ansvarlig spilling
   - ALDRI gi spillråd eller tips for fremtidige spill
   - ALDRI antyd at spilling er en inntektskilde
   - Ved gevinst: Gratulér kort og saklig, fokuser på odds og sannsynlighet
   - Ved tap: Vær empatisk men nøktern, unngå fraser som oppfordrer til revansje

4. **Formatering**:
   - Sammenhengende tekst i 3-4 korte paragrafer
   - Ingen punktlister eller nummerering
   - Ingen emoji
   - Norsk tallformatering (space som tusenskiller, komma for desimaler)

5. **Terminologi og datafelt**:
   - product = spilltype (V75/V65/V5/V4/DD/LD)
   - markings = dine valgte hester per løp
   - raceResults = løpsresultater med plassering
   - totalWon = total gevinst
   - totalCost = innsats
   - correctRaces = antall rette løp
   - odds = sannsynlighet uttrykt som utbetalingsrate
   - systemPlay = false for Stalltips (fast kupong), true for systemspill
   - bankers = hester som må vinne

Husk: Du skal utdanne og informere, ikke oppfordre til mer spilling. Fokuser på faktabasert analyse og fremme ansvarlig spilleatferd.""",
        "temperature": 0.7,  # Balanced for analysis with creativity (OpenAI recommendation)
        "max_length": 1000,  # Adjusted for 200-350 word target
        "top_p": 1.0  # Use default, let temperature control randomness
    },
    "gpt-4o-mini": {
        "system_prompt": """Du er Rikstoto Innsikt, en AI-basert analyseassistent spesialisert på norsk hesteveddeløp og totalisatorspill.

**OPPGAVE**: Analyser følgende Stalltips-resultat og gi en pedagogisk forklaring på norsk (200-350 ord). NB: Dette er Stalltips (ferdig kupong til 198 kr), IKKE systemspill:

{{json}}

**TILGJENGELIGE DATA**: Du vil motta detaljert JSON med følgende felt:
- `product`: Spilltype (V75/V65/V5/DD/LD)
- `markings`: Dine valgte hester per løp
- `raceResults`: Komplette resultater med hester, posisjoner, odds, form
- `result.correctRaces`: Antall rette løp
- `payout.totalWon`: Total gevinst i NOK
- `betDetails.totalCost`: Innsats
- `betDetails.systemPlay`: Om det er systemspill
- Odds, form, driver/trainer info, oddsMovement for hver hest

**INSTRUKSJONER**:

1. **Struktur** (skriv som sammenhengende tekst i paragrafer):
   - Første paragraf: Oppsummering av spilltype, resultat og hovedanalyse av odds/utfall
   - Andre og tredje paragraf: 3-4 konkrete observasjoner om hva som skjedde og hvorfor
   - Siste setning: Påminnelse om ansvarlig spilling

2. **Tone og stil**:
   - Språk: Norsk bokmål, klar og enkel
   - Tone: Nøktern, informativ, vennlig men profesjonell
   - Perspektiv: Forklarende, aldri rådgivende
   - Unngå gamblingfremmende språk som "burde", "bør satse", "neste gang"
   - Skriv flytende tekst uten punktlister eller bullet points
   - Snakk direkte til kunden. Bruk "du".

3. **Viktige regler**:
   - Forklar HVORFOR utfallet ble som det ble, ikke bare hva som skjedde
   - ALLTID inkluder påminnelse om ansvarlig spilling
   - ALDRI gi spillråd eller tips for fremtidige spill
   - ALDRI antyd at spilling er en inntektskilde
   - Ved gevinst: Gratulér kort og saklig, fokuser på odds og sannsynlighet
   - Ved tap: Vær empatisk men nøktern, unngå fraser som oppfordrer til revansje

4. **Formatering**:
   - Sammenhengende tekst i 3-4 korte paragrafer
   - Ingen punktlister eller nummerering
   - Ingen emoji
   - Norsk tallformatering (space som tusenskiller, komma for desimaler)

5. **Terminologi og datafelt**:
   - product = spilltype (V75/V65/V5/V4/DD/LD)
   - markings = dine valgte hester per løp
   - raceResults = løpsresultater med plassering
   - totalWon = total gevinst
   - totalCost = innsats
   - correctRaces = antall rette løp
   - odds = sannsynlighet uttrykt som utbetalingsrate
   - systemPlay = false for Stalltips (fast kupong), true for systemspill
   - bankers = hester som må vinne

Husk: Du skal utdanne og informere, ikke oppfordre til mer spilling. Fokuser på faktabasert analyse og fremme ansvarlig spilleatferd.""",
        "temperature": 0.5,  # Lower for consistent, cost-effective responses
        "max_length": 1000,  # Adjusted for 200-350 word target
        "top_p": 1.0  # Default works well for simpler models
    },
    "o3-mini": {
        "system_prompt": "Analyser følgende V75-resultat:\n{{json}}\n\nGi en kort analyse (maks 3-4 setninger) som fokuserer på:\n- Hva som gikk bra med spillet\n- Eventuelle bomvalg eller uflaks\n- Ett konkret tips for neste gang",
        "temperature": 0.4,  # Lower for more focused, consistent responses
        "max_length": 200,  # Limit to force conciseness
        "top_p": 0.8  # Slightly constrained for consistency
        # Note: O3 models handle reasoning internally, no special params needed
    },
    "mistral-large": {
        "system_prompt": "Analyser veddeløpsdata strukturert:\n{{json}}\n\nPresentér: • Spilltype og struktur\n• Hestevalg med begrunnelse\n• Økonomisk analyse\n• Anbefaling",
        "temperature": 0.7,  # Mistral recommends 0.7 for general tasks
        "max_length": 700,  # Good balance for comprehensive responses
        "top_p": 0.95  # Mistral default for nucleus sampling
    },
    "claude-3-5-sonnet": {
        "system_prompt": "Som en ansvarlig spilleekspert, analyser denne bongen med fokus på både muligheter og ansvarlig spilling:\n{{json}}\n\nInkluder: Teknisk analyse, sjansevurdering, og påminnelse om ansvarlige spillevaner.",
        "temperature": 0.7,  # Claude default, balances creativity and coherence
        "max_length": 1200,  # Increased - Claude supports up to 8192 tokens
        "top_p": 1.0  # Claude recommendation: adjust temperature OR top_p, not both
    },
    "gemini-1-5-flash": {
        "system_prompt": "Rask analyse av bongdata:\n{{json}}\n\nLever en effektiv oversikt med: hovedpunkter, odds-vurdering, og konklusjon. Vær kortfattet men informativ.",
        "temperature": 1.0,  # Gemini default (range 0.0-2.0, 1.0 is balanced)
        "max_length": 500,  # Moderate length for fast responses
        "top_p": 0.94  # Gemini 1.5 default value
    }
}

# AI-modeller for testing i mikroløsningen
AVAILABLE_MODELS = [
    ModelInfo(
        name="gpt-4o",
        display_name="GPT-4o (Azure OpenAI)",
        description="Beste baseline for forklaring, norsk språk og strukturert output"
    ),
    ModelInfo(
        name="gpt-4o-mini",
        display_name="GPT-4o-mini (Azure OpenAI)",
        description="Raskere og rimeligere variant for skala-testing"
    ),
    ModelInfo(
        name="o3-mini",
        display_name="o3-mini (Azure OpenAI)",
        description="Optimalisert for reasoning på komplekse bongscenarier"
    ),
    ModelInfo(
        name="mistral-large",
        display_name="Mistral Large (Azure AI)",
        description="Åpen modell i enterprise-drakt - billigere og fleksibel"
    ),
    ModelInfo(
        name="claude-3-5-sonnet",
        display_name="Claude 3.5 Sonnet (Azure Databricks)",
        description="Sterk på forklaringer og ansvarlig språk"
    ),
    ModelInfo(
        name="gemini-1-5-flash",
        display_name="Gemini 1.5 Flash (Azure API Management)",
        description="Rask, billig og med lange kontekster"
    )
]

@traceable(
    name="azure_openai_generate",
    run_type="llm",
    metadata={"provider": "azure_openai", "project": "rikstoto"}
)
def call_azure_openai(model_name: str, prompt: str, params: Dict[str, Any]) -> Any:
    """Call Azure OpenAI API to generate text.
    
    Args:
        model_name: The model to use (gpt-4o, gpt-4o-mini, o3-mini)
        prompt: The input text prompt
        params: Generation parameters (temperature, top_p, max_tokens)
        
    Returns:
        Generated text string or error dictionary
    """
    try:
        # O3 models need longer timeout due to reasoning process
        timeout_seconds = 120 if "o3" in model_name else 60
        
        client = AzureOpenAI(
            api_key=os.getenv("AZURE_OPENAI_API_KEY"),
            api_version=os.getenv("AZURE_OPENAI_API_VERSION", "2025-01-01-preview"),
            azure_endpoint=os.getenv("AZURE_OPENAI_ENDPOINT"),
            timeout=timeout_seconds  # Add timeout for long-running requests
        )
        
        # Wrap client with LangSmith if available
        if LANGSMITH_AVAILABLE:
            client = wrap_openai(client)
        
        # Map model names to deployment names
        deployment_map = {
            "gpt-4o": os.getenv("AZURE_OPENAI_GPT4O_DEPLOYMENT", "gpt-4o"),
            "gpt-4o-mini": os.getenv("AZURE_OPENAI_GPT4O_MINI_DEPLOYMENT", "gpt-4o-mini"),
            "o3-mini": os.getenv("AZURE_OPENAI_O3_MINI_DEPLOYMENT", "o3-mini")
        }
        
        deployment_name = deployment_map.get(model_name, os.getenv("AZURE_OPENAI_DEPLOYMENT_NAME"))
        
        # Build API call parameters
        api_params = {
            "model": deployment_name,
            "messages": [
                {"role": "system", "content": "Du er en hjelpsom AI-assistent for Norsk Rikstoto."},
                {"role": "user", "content": prompt}
            ],
            "temperature": params.get("temperature", 0.7),
            "top_p": params.get("top_p", 0.9),
            "max_tokens": params.get("max_tokens", params.get("max_length", 500))
        }
        
        # Add o3-mini specific parameters
        # Note: reasoning_effort not supported in current Azure deployment
        # Will be added when API version 2025-04-01-preview is available
        # if model_name == "o3-mini" and "reasoning_effort" in params:
        #     api_params["reasoning_effort"] = params.get("reasoning_effort", "medium")
        
        # Log if using O3 model (which takes longer)
        if "o3" in model_name:
            print(f"⏱️ Using {model_name} - this may take up to 2 minutes due to reasoning process...")
        
        response = client.chat.completions.create(**api_params)
        
        # Log response details for debugging
        result_text = response.choices[0].message.content
        print(f"✅ Azure OpenAI response length: {len(result_text)} chars")
        
        # Check if response seems truncated (ends mid-sentence)
        if result_text and not result_text.rstrip().endswith(('.', '!', '?', '"', '»')):
            print(f"⚠️ Response may be truncated - doesn't end with punctuation")
            print(f"⚠️ Last 50 chars: ...{result_text[-50:]}")
        
        return result_text
    except Exception as e:
        error_msg = str(e)
        # Sanitize error message to avoid exposing sensitive data
        if "401" in error_msg or "authentication" in error_msg.lower():
            return {"error": "Azure OpenAI authentication failed. Please check configuration.", "loading": False}
        elif "404" in error_msg:
            return {"error": "Azure OpenAI deployment not found.", "loading": False}
        else:
            # Only return generic error message in production
            return {"error": "Azure OpenAI request failed.", "loading": False}

def call_mistral_azure(prompt: str, params: Dict[str, Any]) -> Any:
    """Call Mistral Large via Azure AI Model-as-a-Service.
    
    Args:
        prompt: The input text prompt
        params: Generation parameters
        
    Returns:
        Generated text string or error dictionary
    """
    try:
        endpoint = os.getenv("AZURE_MISTRAL_ENDPOINT")
        api_key = os.getenv("AZURE_MISTRAL_API_KEY")
        
        if not endpoint or not api_key:
            return {"error": "Mistral Large not configured in Azure", "loading": False}
        
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {api_key}"
        }
        
        payload = {
            "messages": [
                {"role": "system", "content": "Du er en hjelpsom AI-assistent for Norsk Rikstoto."},
                {"role": "user", "content": prompt}
            ],
            "temperature": params.get("temperature", 0.7),
            "top_p": params.get("top_p", 0.9),
            "max_tokens": params.get("max_tokens", 500)
        }
        
        response = requests.post(
            f"{endpoint}/v1/chat/completions",
            headers=headers,
            json=payload,
            timeout=30
        )
        response.raise_for_status()
        result = response.json()
        
        return result["choices"][0]["message"]["content"]
    except Exception as e:
        # Sanitize error message
        return {"error": "Mistral API request failed.", "loading": False}

def call_claude_databricks(prompt: str, params: Dict[str, Any]) -> Any:
    """Call Claude 3.5 Sonnet via Azure Databricks.
    
    Args:
        prompt: The input text prompt
        params: Generation parameters
        
    Returns:
        Generated text string or error dictionary
    """
    try:
        endpoint = os.getenv("AZURE_DATABRICKS_CLAUDE_ENDPOINT")
        api_key = os.getenv("AZURE_DATABRICKS_API_KEY")
        
        if not endpoint or not api_key:
            # Fallback to direct Anthropic API if available
            anthropic_key = os.getenv("ANTHROPIC_API_KEY")
            if anthropic_key:
                client = anthropic.Anthropic(api_key=anthropic_key)
                response = client.messages.create(
                    model="claude-3-5-sonnet-20241022",
                    max_tokens=params.get("max_tokens", 500),
                    temperature=params.get("temperature", 0.7),
                    messages=[
                        {"role": "user", "content": prompt}
                    ]
                )
                return response.content[0].text
            return {"error": "Claude not configured", "loading": False}
        
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {api_key}"
        }
        
        payload = {
            "messages": [{"role": "user", "content": prompt}],
            "max_tokens": params.get("max_tokens", 500),
            "temperature": params.get("temperature", 0.7)
        }
        
        response = requests.post(
            endpoint,
            headers=headers,
            json=payload,
            timeout=30
        )
        response.raise_for_status()
        result = response.json()
        
        return result["content"][0]["text"]
    except Exception as e:
        # Sanitize error message
        return {"error": "Claude API request failed.", "loading": False}

def call_gemini_azure(prompt: str, params: Dict[str, Any]) -> Any:
    """Call Gemini 1.5 Flash via Azure API Management.
    
    Args:
        prompt: The input text prompt
        params: Generation parameters
        
    Returns:
        Generated text string or error dictionary
    """
    try:
        endpoint = os.getenv("AZURE_APIM_GEMINI_ENDPOINT")
        api_key = os.getenv("AZURE_APIM_GEMINI_KEY")
        
        if not endpoint or not api_key:
            # Fallback to direct Google API if available
            google_key = os.getenv("GOOGLE_API_KEY")
            if google_key:
                genai.configure(api_key=google_key)
                model = genai.GenerativeModel('gemini-1.5-flash')
                response = model.generate_content(
                    prompt,
                    generation_config=genai.GenerationConfig(
                        temperature=params.get("temperature", 0.7),
                        top_p=params.get("top_p", 0.9),
                        max_output_tokens=params.get("max_tokens", 500)
                    )
                )
                return response.text
            return {"error": "Gemini not configured", "loading": False}
        
        headers = {
            "Content-Type": "application/json",
            "Ocp-Apim-Subscription-Key": api_key
        }
        
        payload = {
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {
                "temperature": params.get("temperature", 0.7),
                "topP": params.get("top_p", 0.9),
                "maxOutputTokens": params.get("max_tokens", 500)
            }
        }
        
        response = requests.post(
            endpoint,
            headers=headers,
            json=payload,
            timeout=30
        )
        response.raise_for_status()
        result = response.json()
        
        return result["candidates"][0]["content"]["parts"][0]["text"]
    except Exception as e:
        # Sanitize error message
        return {"error": "Gemini API request failed.", "loading": False}

def call_huggingface_api(model_name: str, prompt: str, params: Dict[str, Any]) -> Any:
    """Call Hugging Face Inference API to generate text.
    
    Args:
        model_name: The Hugging Face model identifier
        prompt: The input text prompt
        params: Generation parameters (temperature, top_p, top_k, max_length)
        
    Returns:
        Generated text string or error dictionary
        
    Raises:
        HTTPException: If API call fails or times out
    """
    api_token = os.getenv("HUGGINGFACE_TOKEN")
    
    headers = {
        "Authorization": f"Bearer {api_token}",
        "Content-Type": "application/json"
    }
    
    # Check if we have a custom endpoint URL (for Inference Endpoints)
    custom_endpoint = os.getenv("INFERENCE_ENDPOINT_URL")
    
    if custom_endpoint:
        # Use the dedicated Inference Endpoint
        api_urls = [custom_endpoint]
        print(f"Using Inference Endpoint: {custom_endpoint}")
    else:
        # Try the free Inference API (may not work without proper permissions)
        api_urls = [
            f"https://api-inference.huggingface.co/models/{model_name}",
            f"https://api-inference.huggingface.co/pipeline/text-generation/{model_name}"
        ]
    
    # Different payload formats for different model types
    if "bart" in model_name.lower():
        # BART models work best with just inputs, they handle params differently
        payload = {
            "inputs": prompt,
            "parameters": {
                "max_length": min(params.get("max_length", 200), 500),
                "temperature": params.get("temperature", 0.7),
                "do_sample": True
            }
        }
    elif "roberta" in model_name.lower():
        # Question answering format
        payload = {
            "inputs": {
                "question": "What does this mean?",
                "context": prompt
            }
        }
    elif "sentence-transformers" in model_name.lower():
        # Sentence similarity format
        payload = {
            "inputs": {
                "source_sentence": prompt,
                "sentences": ["This is similar.", "This is different."]
            }
        }
    else:
        # Standard format for other models
        payload = {
            "inputs": prompt,
            "parameters": {
                "max_length": min(params.get("max_length", 200), 250),
                "temperature": params.get("temperature", 0.7),
                "top_p": params.get("top_p", 0.9),
                "do_sample": True
            }
        }
    
    # Try the first URL
    for api_url in api_urls:
        try:
            response = requests.post(api_url, headers=headers, json=payload, timeout=30)
            if response.status_code != 404:
                break
        except:
            continue
    
    try:
        
        if response.status_code == 503:
            # Model is loading
            return {"error": "Model is loading, please try again in 10-20 seconds", "loading": True}
        
        if response.status_code == 404:
            # Model not found - try without auth in case it's a public model
            print(f"Model {model_name} returned 404. Response: {response.text}")
            return {"error": f"Model '{model_name}' not found. It may be private or require different access. Try another model.", "loading": False}
        
        if response.status_code == 401:
            return {"error": "Authentication failed. Please check your Hugging Face token.", "loading": False}
        
        response.raise_for_status()
        result = response.json()
        
        # Handle different response formats from different model types
        if isinstance(result, list) and len(result) > 0:
            if isinstance(result[0], dict):
                # Try different keys that models might use
                text = result[0].get("generated_text") or \
                       result[0].get("summary_text") or \
                       result[0].get("answer") or \
                       result[0].get("label") or \
                       str(result[0])
                return text
            return str(result[0])
        elif isinstance(result, dict):
            text = result.get("generated_text") or \
                   result.get("summary_text") or \
                   result.get("answer") or \
                   str(result)
            return text
        
        return str(result)
        
    except requests.exceptions.Timeout:
        raise HTTPException(status_code=504, detail="Request timed out")
    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=500, detail=f"API error: {str(e)}")

@app.get("/api")
async def api_info() -> Dict[str, str]:
    """API endpoint providing API information.
    
    Returns:
        Dictionary with API status message
    """
    return {"message": "Rikstoto AI Model Wrapper API - Using Hugging Face Inference API"}

@app.get("/models", response_model=List[ModelInfo])
async def get_models() -> List[ModelInfo]:
    """Get list of available AI models.
    
    Returns:
        List of ModelInfo objects containing model details
    """
    # Cache model list for 1 hour since it rarely changes
    response = JSONResponse(content=[model.dict() for model in AVAILABLE_MODELS])
    response.headers["Cache-Control"] = "public, max-age=3600"
    return response

@app.get("/model-defaults")
async def get_model_defaults() -> Dict[str, Any]:
    """Get default configurations for all models.
    
    Returns:
        Dictionary with model names as keys and default configs as values
    """
    return {
        "defaults": MODEL_DEFAULTS,
        "models": [model.dict() for model in AVAILABLE_MODELS]
    }

class PrepareJSONRequest(BaseModel):
    """Request model for JSON preparation endpoint."""
    json_data: str
    session_id: Optional[str] = None

class ModelConfig(BaseModel):
    """Configuration for a single model in parallel generation."""
    name: str
    enabled: bool = True
    system_prompt: Optional[str] = None
    temperature: Optional[float] = None
    max_length: Optional[int] = None
    top_p: Optional[float] = None
    top_k: Optional[int] = 50

class ParallelGenerationRequest(BaseModel):
    """Request for parallel generation across multiple models."""
    models: List[ModelConfig]
    json_data: str
    session_id: Optional[str] = None
    use_cache: bool = True

class ModelResult(BaseModel):
    """Result from a single model generation."""
    model_name: str
    display_name: str
    success: bool
    generated_text: Optional[str] = None
    error: Optional[str] = None
    generation_time: float
    from_cache: bool = False
    parameters_used: Dict[str, Any]

@app.post("/prepare-json")
async def prepare_json(request: PrepareJSONRequest) -> Dict[str, Any]:
    """Validate and cache JSON data before AI generation.
    
    This endpoint allows pre-loading and validation of JSON data
    without triggering expensive AI model calls. Perfect for:
    - Pre-validating data on page load
    - Caching frequently used JSON structures
    - Reducing latency when user clicks generate
    
    Args:
        request: Contains JSON string and optional session ID
        
    Returns:
        Validation status, session ID, and prepared data
    """
    try:
        json_obj = json.loads(request.json_data)
        
        # Generate or use provided session ID
        session_id = request.session_id or str(uuid.uuid4())
        
        # Store in cache with timestamp
        json_cache[session_id] = {
            "json": json_obj,
            "timestamp": datetime.now(),
            "hash": hashlib.md5(request.json_data.encode()).hexdigest()
        }
        
        # Clean old cache entries
        cutoff_time = datetime.now() - timedelta(minutes=CACHE_TTL_MINUTES)
        expired_keys = [k for k, v in json_cache.items() 
                       if v["timestamp"] < cutoff_time]
        for key in expired_keys:
            del json_cache[key]
        
        return {
            "status": "ready",
            "valid": True,
            "session_id": session_id,
            "data": json_obj,
            "message": "JSON validated and cached for fast AI generation",
            "cache_ttl_minutes": CACHE_TTL_MINUTES
        }
    except json.JSONDecodeError as e:
        return {
            "status": "error",
            "valid": False,
            "message": f"Invalid JSON: {str(e)}",
            "session_id": None
        }

@app.post("/generate")
async def generate_text(request: GenerationRequest) -> Dict[str, Any]:
    """Generate text using specified model and parameters.
    
    This endpoint accepts a prompt (optionally with JSON data) and generates
    text using the specified Hugging Face model via their Inference API.
    
    Args:
        request: GenerationRequest containing model name, prompt, and parameters
        
    Returns:
        Dictionary containing:
        - generated_text: The generated text
        - model_used: Name of the model used
        - prompt_length: Length of the processed prompt
        - parameters: Generation parameters used
        - api_mode: Boolean indicating API mode (always True)
        
    Raises:
        HTTPException: 
            - 400 if JSON data is invalid
            - 503 if model is loading
            - 504 if request times out
            - 500 for other errors
    """
    try:
        # Check if we should use cached JSON
        json_to_use = request.json_data
        
        if request.session_id and request.session_id in json_cache:
            cached_data = json_cache[request.session_id]
            # Check if cache is still valid
            if datetime.now() - cached_data["timestamp"] < timedelta(minutes=CACHE_TTL_MINUTES):
                json_to_use = json.dumps(cached_data["json"])
        
        # Prepare the prompt with JSON data if provided
        prompt = request.system_prompt
        
        if json_to_use:
            try:
                if isinstance(json_to_use, str):
                    json_obj = json.loads(json_to_use)
                else:
                    json_obj = json_to_use
                # Use compact JSON to save tokens and avoid truncation
                json_str = json.dumps(json_obj, separators=(',', ':'))  # Compact format
                print(f"📦 JSON size: {len(json_str)} chars (compact format)")
                prompt = prompt.replace("{{json}}", json_str)
                prompt = prompt.replace("{json}", json_str)
            except json.JSONDecodeError:
                raise HTTPException(status_code=400, detail="Invalid JSON data")
        
        # Generate cache key for response caching
        cache_key = None
        if request.use_cache:
            cache_key = hashlib.md5(
                f"{request.model_name}:{prompt}:{request.temperature}:{request.max_length}".encode()
            ).hexdigest()
            
            # Check if we have a cached response
            if cache_key in response_cache:
                cached_response = response_cache[cache_key]
                if datetime.now() - cached_response["timestamp"] < timedelta(minutes=CACHE_TTL_MINUTES):
                    return {
                        **cached_response["response"],
                        "from_cache": True,
                        "cache_age_seconds": (datetime.now() - cached_response["timestamp"]).seconds
                    }
        
        # Route to appropriate API based on model name
        model_name = request.model_name
        
        # Get model defaults
        model_defaults = MODEL_DEFAULTS.get(model_name, {})
        
        # Use model-specific defaults if available, otherwise use request parameters
        # For o3-mini, always use model defaults for better responses
        if model_name in MODEL_DEFAULTS:
            params = {
                "max_length": model_defaults.get("max_length", request.max_length),
                "max_tokens": model_defaults.get("max_length", request.max_length),  # For Azure OpenAI
                "temperature": model_defaults.get("temperature", request.temperature),
                "top_p": model_defaults.get("top_p", request.top_p),
                "top_k": request.top_k or 50
            }
        else:
            params = {
                "max_length": request.max_length,
                "max_tokens": request.max_length,  # For Azure OpenAI
                "temperature": request.temperature,
                "top_p": request.top_p,
                "top_k": request.top_k
            }
        
        # Debug: Log what's being sent to verify full JSON is included
        print(f"\n🔍 DEBUG: Sending to {model_name}")
        print(f"📏 Prompt length: {len(prompt)} characters")
        
        # Check if prompt seems complete
        if "{{json}}" in prompt:
            print(f"⚠️ WARNING: JSON placeholder not replaced!")
        
        # Count races in the prompt to verify all data is there
        race_count = prompt.count('"race":')
        print(f"📊 Races found in prompt: {race_count}")
        
        # Check for key fields
        print(f"📊 JSON indicators in prompt:")
        print(f"  - Contains 'percentageBet': {'percentageBet' in prompt}")
        print(f"  - Contains 'amountBet': {'amountBet' in prompt}")
        print(f"  - Contains 'raceResults': {'raceResults' in prompt}")
        print(f"  - Contains 'betResult': {'betResult' in prompt}")
        
        # Log the last part to check for truncation
        if len(prompt) > 200:
            print(f"📄 Last 200 chars of prompt: ...{prompt[-200:]}")
        
        # Route to appropriate API based on model
        if model_name in ["gpt-4o", "gpt-4o-mini", "o3-mini"]:
            result = call_azure_openai(model_name, prompt, params)
        elif model_name == "mistral-large":
            result = call_mistral_azure(prompt, params)
        elif model_name == "claude-3-5-sonnet":
            result = call_claude_databricks(prompt, params)
        elif model_name == "gemini-1-5-flash":
            result = call_gemini_azure(prompt, params)
        else:
            # Fallback to Hugging Face for any other models
            result = call_huggingface_api(model_name, prompt, params)
        
        # Handle error states
        if isinstance(result, dict) and "error" in result:
            if result.get("loading"):
                raise HTTPException(status_code=503, detail=result["error"])
            else:
                raise HTTPException(status_code=400, detail=result["error"])
        
        # Log the result length for debugging
        if isinstance(result, str):
            print(f"📐 Final response length before sending: {len(result)} chars")
            if len(result) > 0:
                print(f"📐 First 50 chars: {result[:50]}...")
                print(f"📐 Last 50 chars: ...{result[-50:]}")
        
        response_data = {
            "generated_text": result,
            "model_used": request.model_name,
            "prompt_length": len(prompt),
            "parameters": params,
            "api_mode": True,
            "from_cache": False,
            "response_length": len(result) if isinstance(result, str) else 0  # Add length to response
        }
        
        # Cache the successful response
        if cache_key and request.use_cache:
            response_cache[cache_key] = {
                "response": response_data,
                "timestamp": datetime.now()
            }
            
            # Clean old cache entries
            cutoff_time = datetime.now() - timedelta(minutes=CACHE_TTL_MINUTES)
            expired_keys = [k for k, v in response_cache.items() 
                           if v["timestamp"] < cutoff_time]
            for key in expired_keys:
                del response_cache[key]
        
        return response_data
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def generate_for_model(model_config: ModelConfig, json_str: str, session_id: Optional[str] = None) -> ModelResult:
    """Generate text for a single model (used in parallel execution)."""
    start_time = time.time()
    model_info = next((m for m in AVAILABLE_MODELS if m.name == model_config.name), None)
    
    if not model_info:
        return ModelResult(
            model_name=model_config.name,
            display_name=model_config.name,
            success=False,
            error=f"Model {model_config.name} not found",
            generation_time=time.time() - start_time,
            parameters_used={}
        )
    
    try:
        # Get defaults and merge with custom config
        defaults = MODEL_DEFAULTS.get(model_config.name, {})
        system_prompt = model_config.system_prompt or defaults.get("system_prompt", "Analyze: {{json}}")
        
        # Prepare prompt
        prompt = system_prompt.replace("{{json}}", json_str).replace("{json}", json_str)
        
        # Prepare parameters
        params = {
            "temperature": model_config.temperature or defaults.get("temperature", 0.7),
            "max_length": model_config.max_length or defaults.get("max_length", 500),
            "max_tokens": model_config.max_length or defaults.get("max_length", 500),
            "top_p": model_config.top_p or defaults.get("top_p", 0.9),
            "top_k": model_config.top_k or 50
        }
        
        # Add o3-mini specific reasoning_effort parameter when supported
        # Note: Commented out until Azure supports it (needs API version 2025-04-01-preview)
        # if model_config.name == "o3-mini" and "reasoning_effort" in defaults:
        #     params["reasoning_effort"] = defaults.get("reasoning_effort", "medium")
        
        # Route to appropriate API
        if model_config.name in ["gpt-4o", "gpt-4o-mini", "o3-mini"]:
            result = call_azure_openai(model_config.name, prompt, params)
        elif model_config.name == "mistral-large":
            result = call_mistral_azure(prompt, params)
        elif model_config.name == "claude-3-5-sonnet":
            result = call_claude_databricks(prompt, params)
        elif model_config.name == "gemini-1-5-flash":
            result = call_gemini_azure(prompt, params)
        else:
            result = {"error": f"Model {model_config.name} not configured"}
        
        # Check for errors
        if isinstance(result, dict) and "error" in result:
            return ModelResult(
                model_name=model_config.name,
                display_name=model_info.display_name,
                success=False,
                error=result["error"],
                generation_time=time.time() - start_time,
                parameters_used=params
            )
        
        return ModelResult(
            model_name=model_config.name,
            display_name=model_info.display_name,
            success=True,
            generated_text=result,
            generation_time=time.time() - start_time,
            from_cache=False,
            parameters_used=params
        )
        
    except Exception as e:
        return ModelResult(
            model_name=model_config.name,
            display_name=model_info.display_name,
            success=False,
            error=str(e),
            generation_time=time.time() - start_time,
            parameters_used={}
        )

@app.post("/generate-all")
async def generate_all(request: ParallelGenerationRequest) -> Dict[str, Any]:
    """Generate text using multiple models in parallel.
    
    This endpoint runs all enabled models simultaneously and returns
    results as they complete.
    
    Args:
        request: Contains model configurations and JSON data
        
    Returns:
        Dictionary with results from all models and timing information
    """
    start_time = time.time()
    
    # Validate JSON
    try:
        json_obj = json.loads(request.json_data)
        # Use compact JSON format to save tokens
        json_str = json.dumps(json_obj, separators=(',', ':'))
        print(f"📦 Parallel generation JSON size: {len(json_str)} chars (compact)")
    except json.JSONDecodeError as e:
        raise HTTPException(status_code=400, detail=f"Invalid JSON: {str(e)}")
    
    # Filter enabled models
    enabled_models = [m for m in request.models if m.enabled]
    
    if not enabled_models:
        raise HTTPException(status_code=400, detail="No models enabled")
    
    # Run models in parallel using ThreadPoolExecutor
    results = []
    with ThreadPoolExecutor(max_workers=len(enabled_models)) as executor:
        future_to_model = {
            executor.submit(generate_for_model, model, json_str, request.session_id): model
            for model in enabled_models
        }
        
        for future in as_completed(future_to_model):
            model = future_to_model[future]
            try:
                result = future.result(timeout=30)
                results.append(result.dict())
            except Exception as e:
                results.append(ModelResult(
                    model_name=model.name,
                    display_name=model.name,
                    success=False,
                    error=f"Timeout or error: {str(e)}",
                    generation_time=30.0,
                    parameters_used={}
                ).dict())
    
    total_time = time.time() - start_time
    
    return {
        "results": results,
        "total_time": total_time,
        "models_run": len(enabled_models),
        "successful": sum(1 for r in results if r["success"]),
        "failed": sum(1 for r in results if not r["success"])
    }

@app.get("/health")
async def health_check() -> Dict[str, Any]:
    """Health check endpoint for monitoring.
    
    Returns:
        Dictionary containing:
        - status: Health status (always "healthy" if accessible)
        - mode: Operation mode ("api" for API-based inference)
        - token_configured: Whether Hugging Face token is configured
        - azure_configured: Whether Azure OpenAI is configured
    """
    api_token = os.getenv("HUGGINGFACE_TOKEN")
    azure_key = os.getenv("AZURE_OPENAI_API_KEY")
    return {
        "status": "healthy",
        "mode": "api",
        "token_configured": bool(api_token),
        "azure_configured": bool(azure_key),
        "models_configured": {
            "azure_openai": bool(azure_key),
            "mistral": bool(os.getenv("AZURE_MISTRAL_API_KEY")),
            "claude": bool(os.getenv("AZURE_DATABRICKS_API_KEY") or os.getenv("ANTHROPIC_API_KEY")),
            "gemini": bool(os.getenv("AZURE_APIM_GEMINI_KEY") or os.getenv("GOOGLE_API_KEY"))
        }
    }

@app.get("/test-models")
async def test_models():
    """Test which models are actually accessible via the Inference API."""
    api_token = os.getenv("HUGGINGFACE_TOKEN")
    if not api_token:
        return {"error": "No Hugging Face token configured"}
    
    results = []
    test_prompt = "Hello, this is a test"
    
    for model in AVAILABLE_MODELS:
        try:
            headers = {
                "Authorization": f"Bearer {api_token}",
                "Content-Type": "application/json"
            }
            api_url = f"https://api-inference.huggingface.co/models/{model.name}"
            payload = {
                "inputs": test_prompt,
                "parameters": {
                    "max_new_tokens": 10,
                    "temperature": 0.7
                }
            }
            
            response = requests.post(api_url, headers=headers, json=payload, timeout=5)
            
            status = "available" if response.status_code == 200 else \
                    "loading" if response.status_code == 503 else \
                    f"error ({response.status_code})"
            
            results.append({
                "model": model.name,
                "status": status,
                "status_code": response.status_code
            })
        except Exception as e:
            results.append({
                "model": model.name,
                "status": f"exception: {str(e)}",
                "status_code": None
            })
    
    return {"models_tested": results, "token_configured": bool(api_token)}

# ============================================================================
# JSON GENERATOR FOR TESTING
# ============================================================================

import random
from typing import Literal

# Norwegian Horse Racing Data Pools - Updated 2024/2025
NORWEGIAN_HORSE_NAMES = [
    # Popular current horses
    "Tangen Haap", "Looking Superb", "Wilda", "Sweetlikecandybar", "Disco Volante",
    "Bolt Brodde", "Clodrique", "Flash Forward", "Victory Lane", "Thunder Strike",
    "Troll Solen", "Myr Faksen", "Grisle Odin G.L.", "Lionel", "Gullrussen",
    "Alm Svarten", "Philip Lyn", "Voje Pumbaa", "Moe Odin", "Sjur Foten",
    "Odd Herakles", "Alm Norfinn", "Valle Grim", "Lykkje Svarten", "Tekno Odin",
    "Finnskog Torden", "Stjerne Faks", "Bånseth", "Rafolo", "Tyrifaksen",
    
    # Classic Norwegian names
    "Northern Star", "Quick Silver", "Midnight Express", "Storm Chaser", "Dark Shadow",
    "Lucky Seven", "Speed Demon", "Final Rush", "Viking Storm", "Ice Queen",
    "Red Lightning", "Blue Diamond", "Green Flash", "Yellow Fever", "Orange Crush",
    "Purple Rain", "Black Beauty", "White Knight", "Golden Arrow", "Silver Bullet",
    
    # International horses racing in Norway
    "Power Drive", "Easy Rider", "Slow Motion", "Last Chance", "First Class",
    "Royal Fortune", "Diamond King", "Emerald Queen", "Ruby Red", "Sapphire Blue",
    "Pearl White", "Crystal Clear", "Alpha Centauri", "Beta Minor", "Gamma Ray",
    "Delta Force", "Epsilon Plus", "Zeta Jones", "Eta Carinae", "Theta Wave",
    
    # Fantasy/creative names
    "Iota Star", "Quantum Leap", "Sonic Boom", "Light Speed", "Warp Drive",
    "Hyper Space", "Stellar Wind", "Cosmic Ray", "Solar Flare", "Speed King",
    "Zulu Warrior", "Powerful Dream", "Night Runner", "Sky Walker", "Moon Shadow",
    "Star Gazer", "Wind Rider", "Fire Storm", "Ice Breaker", "Mountain King",
    "Valley Queen", "River Dance", "Ocean Wave", "Desert Storm", "Arctic Fox",
    
    # Norse mythology themed
    "Nordic Prince", "Viking Queen", "Thor's Hammer", "Odin's Raven", "Freya's Gift",
    "Loki's Trick", "Balder's Light", "Heimdall's Watch", "Frigg's Blessing", "Tyr's Sword",
    "Fenris Wolf", "Midgard Serpent", "Valhalla Glory", "Asgard Prince", "Bifrost Runner",
    "Ragnarok Storm", "Yggdrasil Power", "Mjolnir Force", "Sleipnir Speed", "Gungnir Strike"
]

NORWEGIAN_DRIVERS = [
    # Top current Norwegian drivers 2024/2025
    "Eirik Høitomt", "Magnus Teien Gundersen", "Åsbjørn Tengsareid", "Frode Hamre",
    "Vidar Hop", "Tom Erik Solberg", "Adrian Solberg Akselsen", "Per Oleg Midtfjeld",
    "Ole Johan Østre", "Dag-Sveinung Dalen", "Jan Eilert Kvam", "Lars Anvar Kolle",
    "Geir Nordbotten", "Kristian Malmin", "Gunnar Austevoll", "Erlend Rennesvik",
    
    # Additional active drivers
    "Lars O. Romtveit", "Kai Johansen", "Hans Chr. Holm", "Johan Kringeland",
    "Jomar Blekkan", "Cato Antonsen", "Tobias Kilen", "Geir Mikkelsen",
    "Ove Wassberg", "Thor Borg", "Øystein Austevoll", "Anders Lundstrøm Wolden",
    
    # International drivers racing in Norway
    "Ulf Ohlsson", "Bjørn Goop", "Magnus A Djuse", "Erik Adielsson",
    "Jorma Kontio", "Örjan Kihlström", "Peter Untersteiner", "Carl Johan Jepson"
]

NORWEGIAN_TRAINERS = [
    # Top Norwegian trainers 2024/2025
    "Frode Hamre", "Erlend Rennesvik", "Geir Vegard Gundersen", "Jan Martinsen",
    "Lutfi Kolgjini", "Tom Andersen", "Roger Walmann", "Dag-Sveinung Dalen",
    "Øystein Tjomsland", "Are Hyldmo", "Trond Anderssen", "Cecilie Andersson",
    "Kristine Kvasnes", "Per Ludvig Nilsen", "Lars O. Romtveit", "Gunnar Austevoll",
    
    # Swedish trainers with horses in Norway
    "Stefan Melander", "Daniel Redén", "Robert Bergh", "Joakim Løvgren",
    "Björn Goop", "Timo Nurmos", "Jerry Riordan", "Roger Malmqvist"
]

# Updated Norwegian tracks 2024/2025
NORWEGIAN_TRACKS = [
    "Bjerke",           # Oslo - National arena
    "Klosterskogen",    # Drammen area
    "Jarlsberg",        # Tønsberg
    "Momarken",         # Mysen
    "Forus",            # Stavanger - Oldest still active
    "Bergen Travpark",  # Bergen
    "Biri",             # Gjøvik area
    "Sørlandet",        # Kristiansand
    "Harstad",          # Harstad
    "Bodø",             # Bodø
    "Varig Orkla Arena", # Orkdal
    "Voss",             # Voss
    "Nossum",           # Løten
    "Rissa",            # Rissa
    "Lofoten Travpark", # Lofoten
    "Olsborgmoen",      # Nord-Odal
]

RACE_DISTANCES = [1609, 2100, 2140, 2600, 2609, 3100]
START_METHODS = ["A", "V"]  # A = Auto, V = Volt

class JsonGeneratorRequest(BaseModel):
    product: Literal["V75", "V64", "V5", "DD", "Stalltips"] = "V75"
    scenario: Literal["favorites", "upsets", "mixed", "random", "custom"] = "mixed"
    track: Optional[str] = None
    include_stalltips: bool = True
    include_betting_distribution: bool = True
    seed: Optional[int] = None
    # Result control parameters
    desired_correct: Optional[int] = None
    force_win: Optional[bool] = None
    target_payout: Optional[int] = None
    # Economic parameters
    stake: Optional[int] = None
    rows: Optional[int] = None
    pool_size: Optional[int] = None
    # Advanced marking
    marking_strategy: Optional[Literal["single", "system", "banker"]] = None
    horses_per_race: Optional[List[int]] = None
    bankers: Optional[List[int]] = None

@app.post("/api/generate-json")
async def generate_test_json(request: JsonGeneratorRequest):
    """Generate realistic V75/V64/V5 test JSON data for AI model testing."""
    
    # Set random seed for reproducibility if provided
    if request.seed:
        random.seed(request.seed)
    
    # Determine number of races based on product
    num_races = {
        "V75": 7,
        "V64": 6,
        "V5": 5,
        "DD": 2,
        "Stalltips": 7
    }.get(request.product, 7)
    
    # Select track
    track = request.track or random.choice(NORWEGIAN_TRACKS)
    
    # Generate date (random date in next 30 days)
    from datetime import date, timedelta
    race_date = date.today() + timedelta(days=random.randint(1, 30))
    
    # Generate base structure
    json_data = {
        "product": request.product if request.product != "Stalltips" else "V75",
        "track": track,
        "date": race_date.strftime("%Y-%m-%d"),
        "startTime": f"{random.randint(17, 20)}:{random.choice(['00', '15', '30', '45'])}",
    }
    
    # Add Stalltips info if requested
    if request.include_stalltips or request.product == "Stalltips":
        json_data["stalltipsInfo"] = {
            "type": "Stalltips",
            "generatedBy": "Rikstoto Algorithm v3.2",
            "strategy": random.choice(["Favoritt-fokus", "Balansert mix", "Outsider-jakt", "Sikker strategi"]),
            "confidence": random.choice(["Høy", "Medium", "Moderat"]),
            "description": "Algoritmisk generert kupong basert på siste odds og spillemønster"
        }
    
    # Generate bet details
    # For Rikstoto Innsikt, we're always analyzing Stalltips (fixed 198 kr)
    # Even if product is V75/V64, treat it as Stalltips for this app
    if request.product in ["V75", "V64", "V5", "Stalltips"]:
        # Always generate as Stalltips for Rikstoto Innsikt analysis
        rows = 1  # Stalltips is one shared coupon
        stake_amount = 198  # Fixed price
        is_system = False
        bet_type = "Stalltips"  # Always show as Stalltips
    else:
        # DD and other products can have different logic
        rows = request.rows or 1
        stake_amount = request.stake or 50
        is_system = False
        bet_type = request.product
    
    json_data["betDetails"] = {
        "betId": f"{request.product}-{race_date.strftime('%Y-%m%d')}-{track[:2].upper()}-{random.randint(100000, 999999)}",
        "betType": bet_type,  # Shows "Stalltips" for V75/V64/V5
        "systemPlay": is_system,  # Always false for Stalltips
        "rows": rows,  # Always 1 for Stalltips
        "costPerRow": stake_amount / rows if rows > 0 else 1,
        "totalCost": stake_amount,  # Always 198 kr for Stalltips
        "currency": "NOK",
        "timestamp": datetime.now().isoformat() + "Z"
    }
    
    # Generate pool info
    total_pool = request.pool_size or random.randint(500000, 15000000)
    json_data["poolInfo"] = {
        "totalPool": total_pool,
        "currentPool": total_pool,
        "bettingStatus": "open",
        "jackpot": random.randint(0, 5000000) if random.random() > 0.7 else 0
    }
    
    # Generate races
    races = []
    all_horses = random.sample(NORWEGIAN_HORSE_NAMES, min(len(NORWEGIAN_HORSE_NAMES), num_races * 12))
    horse_index = 0
    
    markings = {}
    bankers = []
    
    for race_num in range(1, num_races + 1):
        num_horses = random.randint(8, 15)
        race_horses = all_horses[horse_index:horse_index + num_horses]
        horse_index += num_horses
        
        # Generate race data
        race = {
            "race": race_num,
            "name": f"{request.product}-{race_num}" if request.product != "Stalltips" else f"V75-{race_num}",
            "distance": random.choice(RACE_DISTANCES),
            "startMethod": random.choice(START_METHODS),
            "totalStarters": num_horses,
            "poolSize": random.randint(100000, 2000000)
        }
        
        # Betting distribution will be added after horse results are generated
        
        # Generate horse results
        results = []
        positions = list(range(1, num_horses + 1))
        random.shuffle(positions)
        
        # Determine marking strategy based on scenario
        if request.scenario == "favorites":
            # Mark top 3-4 horses by odds
            horses_to_mark = random.sample(range(1, min(5, num_horses + 1)), random.randint(2, 4))
        elif request.scenario == "upsets":
            # Mark some outsiders
            horses_to_mark = random.sample(range(max(1, num_horses - 5), num_horses + 1), random.randint(2, 4))
        else:
            # Mixed strategy
            horses_to_mark = random.sample(range(1, num_horses + 1), random.randint(2, 5))
        
        markings[str(race_num)] = sorted(horses_to_mark)
        
        # Add banker for some races
        if random.random() > 0.6 and len(horses_to_mark) == 1:
            bankers.append(race_num)
        
        # Generate realistic betting distribution
        total_pool = race["poolSize"]
        remaining_pool = total_pool
        bet_percentages = []
        
        # Generate decreasing bet percentages based on ranking
        for i in range(num_horses):
            if i == 0:  # Favorite
                pct = random.uniform(25, 45)
            elif i == 1:  # Second choice
                pct = random.uniform(15, 25)
            elif i == 2:  # Third choice
                pct = random.uniform(8, 15)
            elif i < num_horses // 2:  # Mid-field
                pct = random.uniform(3, 8)
            else:  # Outsiders
                pct = random.uniform(0.1, 3)
            bet_percentages.append(pct)
        
        # Normalize percentages to sum to 100
        total_pct = sum(bet_percentages)
        bet_percentages = [p / total_pct * 100 for p in bet_percentages]
        
        for i, horse_num in enumerate(range(1, num_horses + 1)):
            # Calculate realistic odds from betting percentage
            bet_pct = bet_percentages[i]
            odds = round(95 / bet_pct, 1) if bet_pct > 0 else 999.0  # 95% payout after takeout
            
            horse_data = {
                "horse": horse_num,
                "position": positions[i],
                "marked": "true" if horse_num in horses_to_mark else "false",
                "name": race_horses[i] if i < len(race_horses) else f"Hest {horse_num}",
                "driver": random.choice(NORWEGIAN_DRIVERS),
                "odds": min(odds, 999.0),  # Cap at 999
                "percentageBet": round(bet_pct, 1),
                "amountBet": int(total_pool * bet_pct / 100),
                "publicRanking": i + 1
            }
            
            # Add extra details for marked horses
            if horse_num in horses_to_mark:
                horse_data.update({
                    "trainer": random.choice(NORWEGIAN_TRAINERS),
                    "form": f"{random.randint(1,9)}-{random.randint(1,9)}-{random.randint(1,9)}-{random.randint(1,9)}-{random.randint(1,9)}",
                    "winPercentage": random.randint(10, 40),
                    "placePercentage": random.randint(30, 80),
                    "earnings": random.randint(100000, 2000000),
                    "age": random.randint(3, 10),
                    "gender": random.choice(["H", "V", "G"])
                })
            
            results.append(horse_data)
        
        race["results"] = results
        
        # Add betting distribution based on the generated data
        if request.include_betting_distribution:
            # Find top 3 horses by bet percentage
            sorted_horses = sorted(results, key=lambda x: x["percentageBet"], reverse=True)
            race["bettingDistribution"] = {
                "favorite": {"horse": sorted_horses[0]["horse"], "percentage": sorted_horses[0]["percentageBet"]},
                "secondChoice": {"horse": sorted_horses[1]["horse"], "percentage": sorted_horses[1]["percentageBet"]},
                "thirdChoice": {"horse": sorted_horses[2]["horse"], "percentage": sorted_horses[2]["percentageBet"]}
            }
        
        # Determine winner
        if request.scenario == "favorites":
            winner = sorted(results, key=lambda x: x["percentageBet"], reverse=True)[0]["horse"]
        elif request.scenario == "upsets":
            winner = random.choice([h for h in range(num_horses//2, num_horses + 1)])
        else:
            winner = random.randint(1, num_horses)
        
        race["winner"] = winner
        race["winnerName"] = next((h["name"] for h in results if h["horse"] == winner), "Unknown")
        race["winnerOdds"] = next((h["odds"] for h in results if h["horse"] == winner), 10.0)
        race["hit"] = winner in horses_to_mark
        
        races.append(race)
    
    json_data["markings"] = markings
    json_data["bankers"] = bankers
    json_data["raceResults"] = races
    
    # Generate result summary
    # If custom scenario with desired_correct, force that number of correct races
    if request.scenario == "custom" and request.desired_correct is not None:
        correct_races = min(request.desired_correct, num_races)
        # Adjust the races to match desired_correct
        hits_count = 0
        for race in races:
            if hits_count < correct_races:
                race["hit"] = True
                hits_count += 1
            else:
                race["hit"] = False
    else:
        # Ensure correct_races never exceeds the actual number of races
        correct_races = min(sum(1 for r in races if r.get("hit", False)), num_races)
    
    # Calculate prize payouts based on correct races and pool
    total_pool = json_data["poolInfo"]["totalPool"]
    prize_pool = total_pool * 0.65  # 65% goes to prizes
    
    # Generate prize breakdown
    prizes = {}
    if num_races == 7:  # V75
        prizes = {
            "sevenCorrect": {
                "winners": random.randint(1, 5) if correct_races == 7 else 0,
                "amount": round(prize_pool * 0.4 / max(1, random.randint(1, 5))) if correct_races == 7 else 0
            },
            "sixCorrect": {
                "winners": random.randint(5, 50),
                "amount": round(prize_pool * 0.3 / random.randint(5, 50))
            },
            "fiveCorrect": {
                "winners": random.randint(100, 1000),
                "amount": round(prize_pool * 0.3 / random.randint(100, 1000))
            }
        }
    elif num_races == 6:  # V64
        prizes = {
            "sixCorrect": {
                "winners": random.randint(1, 10),
                "amount": round(prize_pool * 0.5 / max(1, random.randint(1, 10)))
            },
            "fiveCorrect": {
                "winners": random.randint(20, 200),
                "amount": round(prize_pool * 0.3 / random.randint(20, 200))
            },
            "fourCorrect": {
                "winners": random.randint(500, 5000),
                "amount": round(prize_pool * 0.2 / random.randint(500, 5000))
            }
        }
    elif num_races == 2:  # DD (Dagens Dobbel)
        prizes = {
            "twoCorrect": {
                "winners": random.randint(10, 100) if correct_races == 2 else 0,
                "amount": round(prize_pool / max(1, random.randint(10, 100))) if correct_races == 2 else 0
            }
        }
    else:  # V5
        prizes = {
            "fiveCorrect": {
                "winners": random.randint(5, 50) if correct_races == 5 else 0,
                "amount": round(prize_pool * 0.5 / max(1, random.randint(5, 50))) if correct_races == 5 else 0
            },
            "fourCorrect": {
                "winners": random.randint(50, 500),
                "amount": round(prize_pool * 0.3 / random.randint(50, 500))
            },
            "threeCorrect": {
                "winners": random.randint(500, 5000),
                "amount": round(prize_pool * 0.2 / random.randint(500, 5000))
            }
        }
    
    # Calculate actual payout for this bet
    # If force_win with target_payout, use that
    if request.force_win and request.target_payout is not None:
        payout = request.target_payout
    else:
        payout = 0
        
        # Calculate regular payout if not forced
        if num_races == 7:  # V75
            if correct_races == 7 and prizes["sevenCorrect"]["amount"]:
                payout = prizes["sevenCorrect"]["amount"] * rows
            elif correct_races == 6:
                payout = prizes["sixCorrect"]["amount"] * rows
            elif correct_races == 5:
                payout = prizes["fiveCorrect"]["amount"] * rows
        elif num_races == 6:  # V64
            if correct_races == 6 and prizes["sixCorrect"]["amount"]:
                payout = prizes["sixCorrect"]["amount"] * rows
            elif correct_races == 5:
                payout = prizes["fiveCorrect"]["amount"] * rows
            elif correct_races == 4:
                payout = prizes["fourCorrect"]["amount"] * rows
        elif num_races == 5:  # V5
            if correct_races == 5 and prizes["fiveCorrect"]["amount"]:
                payout = prizes["fiveCorrect"]["amount"] * rows
            elif correct_races == 4:
                payout = prizes["fourCorrect"]["amount"] * rows
            elif correct_races == 3:
                payout = prizes["threeCorrect"]["amount"] * rows
        elif num_races == 2:  # DD
            if correct_races == 2 and prizes["twoCorrect"]["amount"]:
                payout = prizes["twoCorrect"]["amount"] * rows
    
    json_data["result"] = {
        "status": "generated",
        "correctRaces": correct_races,
        "totalRaces": num_races,
        "prizeLevel": f"{correct_races} av {num_races} rette",
        "payout": payout,
        "roi": round(payout / json_data["betDetails"]["totalCost"] * 100, 2) if payout > 0 else 0
    }
    
    json_data["prizes"] = prizes
    
    # Add statistics
    json_data["statistics"] = {
        "coveragePercentage": round(random.uniform(0.5, 2.5), 2),
        "averageWinnerOdds": round(sum(r["winnerOdds"] for r in races) / len(races), 2),
        "favoriteWins": sum(1 for r in races if r["winner"] <= 3),
        "outsiderWins": sum(1 for r in races if r["winner"] > num_horses - 3),
        "totalBettors": random.randint(10000, 100000),
        "averageBetSize": random.randint(50, 500)
    }
    
    return json_data

# Serve React frontend if build exists
frontend_build_path = os.path.join(os.path.dirname(__file__), "..", "frontend", "build")
if os.path.exists(frontend_build_path):
    # Root path should serve index.html
    @app.get("/")
    async def serve_root():
        """Serve React app at root."""
        response = FileResponse(os.path.join(frontend_build_path, "index.html"))
        response.headers["Cache-Control"] = "public, max-age=600"
        return response
    
    # Mount static files for assets
    app.mount("/static", StaticFiles(directory=os.path.join(frontend_build_path, "static")), name="static")
    
    @app.get("/{full_path:path}")
    async def serve_react_app(full_path: str):
        """Serve React app for all non-API routes."""
        # Skip API routes
        if full_path.startswith("api") or full_path in ["health", "models", "generate", "prepare-json", "test-models", "docs", "redoc", "openapi.json"]:
            raise HTTPException(status_code=404)
        
        file_path = os.path.join(frontend_build_path, full_path)
        if os.path.isfile(file_path):
            response = FileResponse(file_path)
            # Cache static assets for 1 week, HTML for 10 minutes
            if full_path.endswith(('.js', '.css', '.jpg', '.png', '.svg', '.ico', '.woff', '.woff2')):
                response.headers["Cache-Control"] = "public, max-age=604800"
            elif full_path.endswith('.html'):
                response.headers["Cache-Control"] = "public, max-age=600"
            return response
        else:
            # Return index.html for React Router
            response = FileResponse(os.path.join(frontend_build_path, "index.html"))
            response.headers["Cache-Control"] = "public, max-age=600"
            return response

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)