# Rikstoto AI Wrapper - Deployment Guide

## Render Deployment

### 1. Forberedelser

1. **Opprett Render-konto**: Gå til [render.com](https://render.com) og opprett en konto
2. **Koble til GitHub**: Koble Render-kontoen til GitHub-repositoryet

### 2. Deploy med render.yaml

Prosjektet inneholder en `render.yaml` fil som automatisk konfigurerer:
- Backend API service
- Frontend web service
- Alle nødvendige environment variabler

**Deploy-steg:**
1. Push koden til GitHub
2. I Render Dashboard, velg "New" → "Blueprint"
3. Koble til repositoryet
4. Render vil automatisk oppdage `render.yaml`

### 3. Konfigurer Environment Variabler

I Render Dashboard for hver service, legg til følgende secrets:

#### Backend Service (rikstoto-ai-backend)

**Azure OpenAI (for GPT-4o, GPT-4o-mini, o3-mini):**
```
AZURE_OPENAI_API_KEY=<din-api-nøkkel>
AZURE_OPENAI_ENDPOINT=https://<din-resource>.openai.azure.com/
```

**Mistral Large:**
```
AZURE_MISTRAL_ENDPOINT=<din-endpoint>
AZURE_MISTRAL_API_KEY=<din-api-nøkkel>
```

**Claude 3.5 Sonnet:**
```
# Via Azure Databricks:
AZURE_DATABRICKS_CLAUDE_ENDPOINT=<din-endpoint>
AZURE_DATABRICKS_API_KEY=<din-api-nøkkel>

# ELLER direkte Anthropic:
ANTHROPIC_API_KEY=<din-api-nøkkel>
```

**Gemini 1.5 Flash:**
```
# Via Azure API Management:
AZURE_APIM_GEMINI_ENDPOINT=<din-endpoint>
AZURE_APIM_GEMINI_KEY=<din-subscription-key>

# ELLER direkte Google:
GOOGLE_API_KEY=<din-api-nøkkel>
```

### 4. Verifiser Deployment

1. **Backend Health Check**: 
   - Gå til: `https://rikstoto-ai-backend.onrender.com/health`
   - Sjekk at alle modeller er konfigurert

2. **API Dokumentasjon**:
   - Gå til: `https://rikstoto-ai-backend.onrender.com/docs`

3. **Frontend**:
   - Gå til: `https://rikstoto-ai-frontend.onrender.com`

## Lokal Testing

### Backend
```bash
cd backend
pip install -r requirements.txt
cp .env.example .env  # Rediger med dine API-nøkler
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm start  # Kjører på port 3001
```

## Modell-konfigurasjon i Azure

### 1. Azure OpenAI
1. Opprett Azure OpenAI resource i Azure Portal
2. Deploy modellene: gpt-4o, gpt-4o-mini, o3-mini
3. Noter endpoint og API-nøkkel

### 2. Mistral Large (Azure AI Model-as-a-Service)
1. Gå til Azure AI Foundry
2. Velg "Model Catalog" → "Mistral Large"
3. Deploy som serverless API
4. Noter endpoint og API-nøkkel

### 3. Claude 3.5 Sonnet
**Option A: Via Azure Databricks**
1. Opprett Databricks workspace
2. Deploy Claude via Model Serving
3. Noter serving endpoint URL og token

**Option B: Direkte Anthropic**
1. Opprett konto på anthropic.com
2. Generer API-nøkkel

### 4. Gemini 1.5 Flash
**Option A: Via Azure API Management**
1. Opprett APIM instance
2. Legg til Google Gemini API som backend
3. Konfigurer subscription key

**Option B: Direkte Google**
1. Gå til Google AI Studio
2. Generer API-nøkkel

## Overvåking

### Render Dashboard
- CPU og minne-bruk
- Request logs
- Error tracking
- Auto-scaling metrics

### Health Endpoints
- `/health` - Basis helsesjekk
- `/models` - Liste over tilgjengelige modeller
- `/test-models` - Test modell-tilgjengelighet

## Sikkerhet

1. **API-nøkler**: Aldri commit API-nøkler til Git
2. **CORS**: Oppdater CORS origins for produksjon
3. **Rate Limiting**: Vurder å legge til rate limiting
4. **HTTPS**: Render gir automatisk SSL/TLS

## Feilsøking

### "Model not configured"
- Sjekk at environment variablene er satt i Render
- Verifiser at API-nøklene er gyldige

### "CORS error"
- Oppdater CORS_ORIGINS i backend environment
- Sjekk at frontend bruker riktig API URL

### "Model loading"
- Første request til en modell kan ta 10-20 sekunder
- Vurder å implementere model warm-up

## Kostnader

### Render
- **Free tier**: 750 timer/måned (nok for testing)
- **Starter**: $7/måned per service for 24/7 drift

### AI Modeller
- **Azure OpenAI**: Pay-per-token
- **Mistral**: Pay-per-request via Azure
- **Claude**: Pay-per-token
- **Gemini**: Gratis kvote, deretter pay-per-request

## Support

For problemer eller spørsmål:
1. Sjekk Render logs
2. Test med `/health` og `/test-models` endpoints
3. Verifiser environment variabler
4. Kontakt Rikstoto DevOps team