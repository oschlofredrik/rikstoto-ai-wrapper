# Hugging Face Inference Endpoints Setup Guide

## Quick Start (5 minutes)

### 1. Create Your Endpoint

1. Go to: https://huggingface.co/inference-endpoints
2. Click **"New endpoint"**
3. Configure:
   - **Model**: `openai-community/gpt2` (or choose another)
   - **Name**: `rikstoto-gpt2` 
   - **Cloud**: AWS
   - **Region**: Choose closest (eu-west-1 for Europe)
   - **Instance**: `CPU · Small · 1 vCPU · 2GB` ($0.06/hour)
   - **Task**: Text Generation
   - **Security**: Protected (requires auth)
4. Click **"Create Endpoint"**

### 2. Get Your Endpoint URL

Wait 2-5 minutes for status: **Running**

Then copy your endpoint URL, it looks like:
```
https://xxxxxx.us-east-1.aws.endpoints.huggingface.cloud
```

### 3. Update Configuration

Edit `/backend/.env`:
```bash
INFERENCE_ENDPOINT_URL=https://your-endpoint.aws.endpoints.huggingface.cloud
```

### 4. Test Your Endpoint

```bash
cd backend
python3 test_endpoint.py
```

## Pricing

### Instance Types & Costs

| Type | vCPUs | RAM | Cost/Hour | Good For |
|------|-------|-----|-----------|----------|
| CPU Small | 1 | 2GB | $0.06 | Testing, light use |
| CPU Medium | 2 | 4GB | $0.12 | Small production |
| CPU Large | 4 | 8GB | $0.24 | Medium traffic |
| GPU Small | 1 | 14GB | $0.60 | Fast inference |

### Cost Examples
- **Testing**: $0.06/hour = $1.44/day = $43/month
- **Production**: $0.24/hour = $5.76/day = $173/month
- **Pay only when running** - Pause when not needed!

## Managing Your Endpoint

### Dashboard
https://huggingface.co/inference-endpoints

### Pause/Resume
- **Pause**: Stop billing when not using
- **Resume**: Takes 2-3 minutes to restart

### Scaling
- Can change instance type anytime
- Auto-scaling available for production

## Multiple Models Strategy

### Option 1: One Endpoint Per Model
- Create separate endpoints for each model
- More expensive but isolated

### Option 2: Model Router (Recommended)
- Use one endpoint with a larger model
- Switch models via API parameters

### Option 3: Serverless Fallback
- Use Endpoints for primary model
- Fall back to free API for others

## API Usage

### Basic Request
```python
import requests

url = "https://your-endpoint.aws.endpoints.huggingface.cloud"
headers = {
    "Authorization": "Bearer YOUR_HF_TOKEN",
    "Content-Type": "application/json"
}
payload = {
    "inputs": "Hello, my name is",
    "parameters": {
        "max_new_tokens": 50,
        "temperature": 0.8
    }
}

response = requests.post(url, headers=headers, json=payload)
print(response.json())
```

### With Our Application
The backend automatically uses `INFERENCE_ENDPOINT_URL` if set.

## Monitoring

### Metrics Dashboard
- View in Inference Endpoints dashboard
- Shows requests, latency, errors

### Logs
- Available in endpoint details
- Useful for debugging

## Best Practices

1. **Start Small**: Begin with CPU Small instance
2. **Monitor Usage**: Check metrics regularly  
3. **Pause When Idle**: Don't pay for unused time
4. **Set Alerts**: Configure billing alerts
5. **Use Caching**: Cache common responses

## Troubleshooting

### Endpoint Won't Start
- Check model compatibility
- Verify region availability
- Try different instance type

### 503 Service Unavailable
- Endpoint is starting up (wait 2-3 min)
- Instance too small for model

### 401 Unauthorized
- Check token permissions
- Verify token in .env file

### High Latency
- Upgrade instance type
- Choose region closer to users
- Enable auto-scaling

## Cleanup

To avoid charges:
1. Go to https://huggingface.co/inference-endpoints
2. Click on your endpoint
3. Click "Settings" → "Delete endpoint"
4. Or just "Pause" to keep configuration

---

## Support

- Hugging Face Support: https://huggingface.co/support
- Documentation: https://huggingface.co/docs/inference-endpoints
- Pricing Calculator: https://huggingface.co/pricing

Last Updated: August 2025