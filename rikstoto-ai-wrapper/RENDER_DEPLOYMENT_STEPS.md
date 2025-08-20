# Render Deployment - Neste Steg

## GitHub Repository
✅ Koden er pushet til: https://github.com/oschlofredrik/rikstoto-ai-wrapper

## Deploy til Render (to metoder)

### Metode 1: Via Render Dashboard (Anbefalt)

1. **Gå til Render Dashboard**
   - Åpne https://dashboard.render.com
   - Logg inn eller opprett konto

2. **Deploy fra GitHub**
   - Klikk "New +" → "Blueprint"
   - Koble GitHub-kontoen hvis ikke allerede koblet
   - Velg repository: `oschlofredrik/rikstoto-ai-wrapper`
   - Render vil automatisk oppdage `render.yaml` filen

3. **Konfigurer Environment Variables**
   Legg til følgende i Render Dashboard for backend-servicen:

   ```bash
   # Azure OpenAI (påkrevd for GPT-modeller)
   AZURE_OPENAI_API_KEY=<din-nøkkel>
   AZURE_OPENAI_ENDPOINT=https://<din-resource>.openai.azure.com/
   
   # Mistral (valgfri)
   AZURE_MISTRAL_ENDPOINT=<endpoint>
   AZURE_MISTRAL_API_KEY=<nøkkel>
   
   # Claude (valgfri - velg én)
   ANTHROPIC_API_KEY=<nøkkel>
   # ELLER
   AZURE_DATABRICKS_CLAUDE_ENDPOINT=<endpoint>
   AZURE_DATABRICKS_API_KEY=<nøkkel>
   
   # Gemini (valgfri - velg én)
   GOOGLE_API_KEY=<nøkkel>
   # ELLER
   AZURE_APIM_GEMINI_ENDPOINT=<endpoint>
   AZURE_APIM_GEMINI_KEY=<nøkkel>
   ```

4. **Deploy**
   - Klikk "Apply" for å starte deployment

### Metode 2: Via Render CLI

1. **Logg inn til Render CLI**
   ```bash
   render login
   ```
   Følg instruksjonene i nettleseren med koden som vises

2. **Deploy Blueprint**
   ```bash
   cd "/Users/fredrikevjenekli/Rikstoto Innsikt/rikstoto-ai-wrapper"
   render blueprint deploy
   ```

3. **Sett Environment Variables**
   ```bash
   # For backend service
   render services env set rikstoto-ai-backend \
     AZURE_OPENAI_API_KEY=<din-nøkkel> \
     AZURE_OPENAI_ENDPOINT=<din-endpoint>
   ```

## Verifiser Deployment

Når deployment er ferdig:

1. **Backend Health Check**
   ```
   https://rikstoto-ai-backend.onrender.com/health
   ```

2. **API Dokumentasjon**
   ```
   https://rikstoto-ai-backend.onrender.com/docs
   ```

3. **Frontend**
   ```
   https://rikstoto-ai-frontend.onrender.com
   ```

## Feilsøking

### Hvis deployment feiler:
1. Sjekk Render logs i Dashboard
2. Verifiser at environment variables er satt
3. Sjekk at Python versjon er 3.11 (satt i render.yaml)

### Hvis modeller ikke fungerer:
1. Start med kun Azure OpenAI konfigurert
2. Test at GPT-4o fungerer
3. Legg til andre modeller én om gangen

## Lokal Testing Først

Før deployment, test lokalt:
```bash
# Backend
cd backend
python3 -m uvicorn main:app --reload

# Frontend (i ny terminal)
cd frontend
npm start
```

Test på http://localhost:3001

## Support

- Render dokumentasjon: https://docs.render.com
- Repository: https://github.com/oschlofredrik/rikstoto-ai-wrapper
- Render Dashboard: https://dashboard.render.com