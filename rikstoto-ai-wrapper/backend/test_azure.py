#!/usr/bin/env python3
"""Test Azure OpenAI connection"""

import os
from dotenv import load_dotenv
from openai import AzureOpenAI

# Load environment variables
load_dotenv()

# Azure OpenAI configuration
api_key = os.getenv("AZURE_OPENAI_API_KEY")
endpoint = os.getenv("AZURE_OPENAI_ENDPOINT")
api_version = os.getenv("AZURE_OPENAI_API_VERSION", "2024-08-01-preview")

print(f"Testing Azure OpenAI connection...")
print(f"Endpoint: {endpoint}")
print(f"API Version: {api_version}")
print(f"API Key: {api_key[:20]}..." if api_key else "No API key found")

try:
    # Initialize Azure OpenAI client
    client = AzureOpenAI(
        api_key=api_key,
        api_version=api_version,
        azure_endpoint=endpoint
    )
    
    # Test with GPT-4o-mini deployment
    deployment_name = os.getenv("AZURE_OPENAI_GPT4O_MINI_DEPLOYMENT", "gpt-4o-mini")
    print(f"\nTesting deployment: {deployment_name}")
    
    response = client.chat.completions.create(
        model=deployment_name,
        messages=[
            {"role": "system", "content": "You are a helpful assistant."},
            {"role": "user", "content": "Say 'Azure OpenAI is working!' if you can respond."}
        ],
        max_tokens=50,
        temperature=0.7
    )
    
    print(f"✅ Success! Response: {response.choices[0].message.content}")
    
except Exception as e:
    print(f"❌ Error: {str(e)}")
    print("\nTroubleshooting tips:")
    print("1. Check if the deployment name matches your Azure deployment")
    print("2. Verify the API key is correct")
    print("3. Ensure the endpoint URL is correct (should end with /)")
    print("4. Check if the API version is supported")