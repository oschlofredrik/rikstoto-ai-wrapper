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
        "system_prompt": "Du er en ekspert på Rikstoto og hesteveddeløp. Analyser følgende bongdata og gi en detaljert forklaring på norsk:\n{{json}}\n\nForklar bongen, odds, og potensielle gevinster på en pedagogisk måte.",
        "temperature": 0.7,  # Balanced for analysis with creativity (OpenAI recommendation)
        "max_length": 1000,  # Increased for comprehensive analysis
        "top_p": 1.0  # Use default, let temperature control randomness
    },
    "gpt-4o-mini": {
        "system_prompt": "Analyser denne Rikstoto-bongen kort og konsist:\n{{json}}\n\nGi en rask oppsummering av: 1) Type spill, 2) Valgte hester, 3) Mulig gevinst",
        "temperature": 0.5,  # Lower for consistent, cost-effective responses
        "max_length": 400,  # Keep short for efficiency
        "top_p": 1.0  # Default works well for simpler models
    },
    "o3-mini": {
        "system_prompt": "Utfør en logisk analyse av følgende bongdata med fokus på sannsynligheter og forventet verdi:\n{{json}}\n\nBruk reasoning til å vurdere: 1) Sjanse for gevinst, 2) Expected value, 3) Risikovurdering",
        "temperature": 0.3,  # Low for STEM/reasoning tasks (o3-mini specialty)
        "max_length": 800,  # Increased for detailed reasoning chains
        "top_p": 0.95,  # Slightly constrained for focused reasoning
        "reasoning_effort": "medium"  # o3-mini specific: low/medium/high
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
        client = AzureOpenAI(
            api_key=os.getenv("AZURE_OPENAI_API_KEY"),
            api_version=os.getenv("AZURE_OPENAI_API_VERSION", "2024-08-01-preview"),
            azure_endpoint=os.getenv("AZURE_OPENAI_ENDPOINT")
        )
        
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
            "max_tokens": params.get("max_tokens", 500)
        }
        
        # Add o3-mini specific parameters
        if model_name == "o3-mini" and "reasoning_effort" in params:
            api_params["reasoning_effort"] = params.get("reasoning_effort", "medium")
        
        response = client.chat.completions.create(**api_params)
        
        return response.choices[0].message.content
    except Exception as e:
        return {"error": f"Azure OpenAI error: {str(e)}", "loading": False}

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
        return {"error": f"Mistral error: {str(e)}", "loading": False}

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
        return {"error": f"Claude error: {str(e)}", "loading": False}

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
        return {"error": f"Gemini error: {str(e)}", "loading": False}

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
                json_str = json.dumps(json_obj, indent=2)
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
        
        params = {
            "max_length": request.max_length,
            "max_tokens": request.max_length,  # For Azure OpenAI
            "temperature": request.temperature,
            "top_p": request.top_p,
            "top_k": request.top_k
        }
        
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
        
        response_data = {
            "generated_text": result,
            "model_used": request.model_name,
            "prompt_length": len(prompt),
            "parameters": params,
            "api_mode": True,
            "from_cache": False
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
        
        # Add o3-mini specific reasoning_effort parameter
        if model_config.name == "o3-mini" and "reasoning_effort" in defaults:
            params["reasoning_effort"] = defaults.get("reasoning_effort", "medium")
        
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
        json_str = json.dumps(json_obj, indent=2)
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
    
    return {"models_tested": results, "token_used": api_token[:10] + "..."}

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