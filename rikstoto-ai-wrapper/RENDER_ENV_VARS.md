# Render Environment Variables

Add these environment variables to your Render deployment:

## Azure OpenAI Configuration
```
AZURE_OPENAI_API_KEY=[Your Azure OpenAI API Key from .env file]
AZURE_OPENAI_ENDPOINT=https://nrpropenai.openai.azure.com/
AZURE_OPENAI_API_VERSION=2025-01-01-preview
AZURE_OPENAI_GPT4O_DEPLOYMENT=gpt-4o
AZURE_OPENAI_GPT4O_MINI_DEPLOYMENT=gpt-4o
AZURE_OPENAI_O3_MINI_DEPLOYMENT=gpt-4o
```

## LangSmith Configuration (for AI tracing)
```
LANGSMITH_TRACING=true
LANGSMITH_ENDPOINT=https://api.smith.langchain.com
LANGSMITH_API_KEY=[Your LangSmith API Key from .env file]
LANGSMITH_PROJECT=rikstoto-ai-wrapper
```

## Environment
```
ENVIRONMENT=production
```

## How to Add in Render

1. Go to your Render dashboard
2. Select your web service
3. Navigate to "Environment" tab
4. Click "Add Environment Variable"
5. Add each variable above with its corresponding value
6. Click "Save Changes"
7. The service will automatically redeploy with the new variables

## Verification

After deployment, check the logs for:
- "✅ LangSmith tracing enabled" - confirms LangSmith is active
- No Azure OpenAI errors when generating AI analysis

## LangSmith Dashboard

View your AI traces at: https://smith.langchain.com/
- Project: rikstoto-ai-wrapper
- Look for traces under "azure_openai_generate"