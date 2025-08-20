# Multi-stage build for combined frontend and backend
# Stage 1: Build frontend
FROM node:18-alpine as frontend-builder

WORKDIR /app/frontend
COPY rikstoto-ai-wrapper/frontend/package*.json ./
RUN npm ci
COPY rikstoto-ai-wrapper/frontend/ ./
RUN npm run build

# Stage 2: Python backend with frontend
FROM python:3.11-slim

WORKDIR /app

# Install Python dependencies
COPY rikstoto-ai-wrapper/backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY rikstoto-ai-wrapper/backend/ ./backend/

# Copy built frontend from stage 1
COPY --from=frontend-builder /app/frontend/build ./frontend/build

# Set working directory to backend
WORKDIR /app/backend

# Port from Render
ENV PORT=8000
EXPOSE ${PORT}

# Start the combined service
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}"]