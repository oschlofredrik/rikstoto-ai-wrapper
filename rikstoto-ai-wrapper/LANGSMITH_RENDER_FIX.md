# Fix LangSmith on Render

You need to add these environment variables in Render dashboard:

## Required LangSmith Variables

```
LANGSMITH_TRACING=true
LANGSMITH_ENDPOINT=https://api.smith.langchain.com
LANGSMITH_PROJECT=rikstoto-ai-wrapper
```

You already have:
- `LANGSMITH_API_KEY` ✅

## How to Add in Render

1. Go to your Render dashboard
2. Select your web service
3. Navigate to "Environment" tab
4. Add each missing variable:
   - Click "Add Environment Variable"
   - Add `LANGSMITH_TRACING` with value `true`
   - Add `LANGSMITH_ENDPOINT` with value `https://api.smith.langchain.com`
   - Add `LANGSMITH_PROJECT` with value `rikstoto-ai-wrapper`
5. Click "Save Changes"

The service will redeploy and LangSmith tracing will start working on Render.

## Why It's Not Working

LangSmith needs all four variables:
- `LANGSMITH_API_KEY` - for authentication (you have this ✅)
- `LANGSMITH_TRACING` - to enable tracing (missing ❌)
- `LANGSMITH_ENDPOINT` - where to send traces (missing ❌)
- `LANGSMITH_PROJECT` - which project to log to (missing ❌)

Without `LANGSMITH_TRACING=true`, the tracing is disabled even if the API key is present.