#!/usr/bin/env python3
"""
Test script for Hugging Face Inference Endpoints
"""

import requests
import os
from dotenv import load_dotenv
import time

load_dotenv()

def test_inference_endpoint():
    """Test your Inference Endpoint"""
    
    endpoint_url = os.getenv("INFERENCE_ENDPOINT_URL")
    token = os.getenv("HUGGINGFACE_TOKEN")
    
    if not endpoint_url:
        print("❌ No INFERENCE_ENDPOINT_URL found in .env")
        print("Please add your endpoint URL to the .env file")
        print("Example: INFERENCE_ENDPOINT_URL=https://xxxxx.aws.endpoints.huggingface.cloud")
        return False
    
    if not token:
        print("❌ No HUGGINGFACE_TOKEN found in .env")
        return False
    
    print(f"🔍 Testing endpoint: {endpoint_url[:50]}...")
    print(f"🔑 Using token: {token[:10]}...")
    
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    # Test 1: Simple generation
    print("\n1️⃣ Testing simple text generation...")
    payload = {
        "inputs": "The weather today is",
        "parameters": {
            "max_new_tokens": 20,
            "temperature": 0.7
        }
    }
    
    try:
        response = requests.post(endpoint_url, headers=headers, json=payload, timeout=30)
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Success! Generated text:")
            if isinstance(result, list):
                print(f"   {result[0].get('generated_text', result[0])}")
            else:
                print(f"   {result}")
        elif response.status_code == 503:
            print("⏳ Endpoint is starting up. Please wait 2-3 minutes and try again.")
            print(f"   Message: {response.text[:200]}")
        else:
            print(f"❌ Error {response.status_code}: {response.text[:200]}")
            
    except requests.exceptions.Timeout:
        print("⏱️ Request timed out (30s). The model might be loading.")
    except Exception as e:
        print(f"❌ Error: {e}")
    
    # Test 2: Multiple requests (performance test)
    print("\n2️⃣ Testing performance (3 requests)...")
    times = []
    for i in range(3):
        start = time.time()
        try:
            response = requests.post(endpoint_url, headers=headers, json=payload, timeout=30)
            elapsed = time.time() - start
            times.append(elapsed)
            print(f"   Request {i+1}: {elapsed:.2f}s - Status: {response.status_code}")
        except:
            print(f"   Request {i+1}: Failed")
    
    if times:
        print(f"   Average response time: {sum(times)/len(times):.2f}s")
    
    print("\n✅ Endpoint test complete!")
    print("\nNext steps:")
    print("1. If working, your app should now use this endpoint automatically")
    print("2. Try generating text at http://localhost:3001")
    print("3. Monitor usage at https://huggingface.co/inference-endpoints")
    
    return True

if __name__ == "__main__":
    print("🚀 Hugging Face Inference Endpoints Tester\n")
    test_inference_endpoint()