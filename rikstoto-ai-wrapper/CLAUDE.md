# Rikstoto AI Wrapper - Project Context

## Project Overview
This is an AI model testing platform for Norsk Rikstoto to evaluate different Hugging Face text generation models. The platform allows testing various AI models with enriched V75 race data JSON input and customizable system prompts.

## Technical Stack
- **Backend**: FastAPI (Python) with Hugging Face Inference API
- **Frontend**: React with TypeScript and Material-UI
- **Models**: Cloud-based via Hugging Face API (no local model loading)

## Key Features
- Multiple text generation model support
- JSON data input with syntax highlighting (Monaco Editor)
- System prompt with `{{json}}` variable substitution
- Adjustable generation parameters (temperature, top_p, top_k, max_length)
- Real-time markdown-rendered output
- Local deployment ready for Rikstoto environment

## Important Configuration

### Ports
- Backend API: `http://localhost:8000`
- Frontend UI: `http://localhost:3001` (changed from 3000 due to conflict)

### Environment Variables
- `HUGGINGFACE_TOKEN`: Required for accessing certain models
- Model cache: Uses system temp directory to avoid permission issues

### Known Issues & Solutions
1. **CORS Configuration**: Backend allows requests from `http://localhost:3001`
2. **PyTorch Memory Issues**: Solved by using Hugging Face API instead of local models
3. **Model Loading**: Models may need to warm up on first request (10-20 seconds)

## Available Models
1. **GPT-2** - General purpose text generation (117M params)
2. **DistilGPT-2** - Smaller, faster GPT-2 (82M params)
3. **DialoGPT Small** - Conversational AI model (117M params)

## Running the Application

### Backend
```bash
cd backend
python3 -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend
```bash
cd frontend
npm start  # Runs on PORT=3001
```

## API Endpoints
- `GET /models` - List available models
- `POST /generate` - Generate text with selected model
- `GET /health` - Health check
- `GET /docs` - Interactive API documentation

## Docker Support
Docker configuration is available for production deployment with docker-compose.yml

## Security Notes
- Hugging Face token is stored in `.env` file
- CORS is configured for local development
- For production, update CORS origins and secure token storage

## Future Enhancements
- Add more model options
- Implement model comparison features
- Add response caching
- Support for different model types (not just text generation)
- Integration with Rikstoto's infrastructure

## V75 Data Structure
The application now uses an enriched JSON structure for V75 race data with:
- Complete race results with all horses (1-12) and their finishing positions
- `marked: "true/false"` to indicate user's betting selections
- Detailed horse information including:
  - Name, driver, trainer
  - Odds, morning line odds, odds movement
  - Betting data (percentage bet, amount bet)
  - Form, recent results with times
  - Win/place percentages, earnings
  - Age, gender, equipment details
- Pool information and payout details
- Support for tracking which horses finished outside top 4 positions

## Deployment
- **GitHub Repository**: https://github.com/oschlofredrik/rikstoto-ai-wrapper
- **Render Integration**: Auto-deploys on push to main branch
- **Environment**: Requires HUGGINGFACE_TOKEN in environment variables

## Troubleshooting

### "Failed to fetch models" error
- Check CORS configuration matches frontend URL
- Verify backend is running on port 8000

### "Permission denied" for cache
- Application now uses temp directory automatically
- No manual permission changes needed

### Model loading fails
- Ensure Hugging Face token is valid
- Check internet connection for model downloads
- Try with smaller models first (distilgpt2)