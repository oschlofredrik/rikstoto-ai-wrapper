#!/usr/bin/env python3
"""
Test script to verify your Hugging Face token
"""

import requests
import sys

def test_token(token):
    """Test if a Hugging Face token is valid"""
    
    print(f"Testing token: {token[:10]}...")
    
    # Test 1: Check authentication
    print("\n1. Testing authentication...")
    response = requests.get(
        "https://huggingface.co/api/whoami",
        headers={"Authorization": f"Bearer {token}"}
    )
    
    if response.status_code == 200:
        user_data = response.json()
        print(f"   ✅ Token is valid!")
        print(f"   User: {user_data.get('name', 'Unknown')}")
        print(f"   Email: {user_data.get('email', 'Not shown')}")
    else:
        print(f"   ❌ Token is invalid!")
        print(f"   Error: {response.text}")
        return False
    
    # Test 2: Try to use Inference API
    print("\n2. Testing Inference API access...")
    response = requests.post(
        "https://api-inference.huggingface.co/models/gpt2",
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        },
        json={"inputs": "Hello, world!"}
    )
    
    if response.status_code == 200:
        print(f"   ✅ Inference API works!")
        result = response.json()
        print(f"   Response: {str(result)[:100]}...")
    elif response.status_code == 503:
        print(f"   ⏳ Model is loading (this is normal)")
        print(f"   Try again in 10-20 seconds")
    else:
        print(f"   ❌ Inference API failed: {response.status_code}")
        print(f"   Error: {response.text[:200]}")
    
    return True

if __name__ == "__main__":
    token = input("Paste your Hugging Face token here: ").strip()
    
    if not token.startswith("hf_"):
        print("⚠️  Warning: Token should start with 'hf_'")
    
    if test_token(token):
        print("\n✅ Token is working! Update your .env file with:")
        print(f"HUGGINGFACE_TOKEN={token}")
    else:
        print("\n❌ Token is not working. Please:")
        print("1. Go to https://huggingface.co/settings/tokens")
        print("2. Create a new token")
        print("3. Make sure 'Make calls to the serverless Inference API' is checked")
        print("4. Copy the entire token")