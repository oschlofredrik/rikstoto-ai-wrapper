# Rikstoto AI Model Testing Platform

A web application for testing different Hugging Face text generation models with JSON data input and customizable prompts. Built for Norsk Rikstoto to evaluate AI models for internal projects.

## Features

- Test multiple Hugging Face text generation models
- JSON input editor with syntax highlighting (Monaco Editor)
- Markdown support for system prompts with JSON data reference using `{{json}}`
- Adjustable generation parameters (temperature, top_p, top_k, max_length)
- Real-time output display with markdown rendering
- Clean, professional UI built with Material-UI
- Local caching of models for faster subsequent runs

## Tech Stack

- **Backend**: FastAPI (Python 3.9+)
- **Frontend**: React with TypeScript
- **UI Components**: Material-UI v7
- **Code Editor**: Monaco Editor
- **AI Models**: Hugging Face Inference API (Cloud-based)

## Quick Start

### Prerequisites
- Python 3.9 or higher
- Node.js 18 or higher
- Hugging Face account (for token)

### Backend Setup

1. Navigate to backend directory:
```bash
cd rikstoto-ai-wrapper/backend
```

2. Install dependencies:
```bash
python3 -m pip install -r requirements.txt
```

3. Configure environment:
Create or update `.env` file with your Hugging Face token:
```env
HUGGINGFACE_TOKEN=your_token_here
ENVIRONMENT=development
```

4. Start the FastAPI server:
```bash
python3 -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd rikstoto-ai-wrapper/frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The application will be available at http://localhost:3001

## Usage

1. Select a model from the dropdown
2. Enter JSON data in the JSON editor
3. Write your prompt in the markdown editor (use `{{json}}` to reference the JSON data)
4. Adjust generation parameters as needed
5. Click "Generate Text" to see the output

## Available Models

All models run via Hugging Face Inference API (no local downloads):
- **GPT-2** - General purpose text generation - Most reliable
- **DistilGPT-2** - Smaller, faster GPT-2 - Best for quick testing
- **DialoGPT Small** - Conversational AI model - Good for dialogue
- **GPT-Neo 125M** - Open-source GPT alternative
- **FLAN-T5 Small** - Instruction-following model

## Deployment

For production deployment in your local Rikstoto environment:

1. Build the frontend:
```bash
cd frontend
npm run build
```

2. Configure the backend for production:
- Update CORS settings in `backend/main.py`
- Set appropriate environment variables
- Consider using a production ASGI server like Gunicorn

3. Deploy using Docker (optional):
```bash
docker-compose up -d
```

## API Documentation

Once the backend is running, visit http://localhost:8000/docs for interactive API documentation.

## Troubleshooting

### Common Issues

1. **"Failed to fetch models" error**
   - Ensure backend is running on port 8000
   - Check that frontend is configured for port 3001
   - CORS is properly configured

2. **"Permission denied" cache error**
   - The app automatically uses system temp directory
   - No manual intervention needed

3. **Model returns "Model is loading" error**
   - This happens when a model needs to warm up on Hugging Face servers
   - Wait 10-20 seconds and try again
   - The model will stay warm for subsequent requests

4. **Port 3000 already in use**
   - Frontend is configured to use port 3001
   - Update `package.json` if you need a different port

## Environment Variables

Create a `.env` file in the backend directory:

```env
HUGGINGFACE_TOKEN=hf_your_token_here
ENVIRONMENT=development
```

Note: Some models require authentication via Hugging Face token

## License

Internal use only - Norsk Rikstoto