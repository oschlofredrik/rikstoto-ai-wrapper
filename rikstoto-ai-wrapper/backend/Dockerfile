# Python backend for Rikstoto AI Wrapper
FROM python:3.11-slim

WORKDIR /app

# Copy requirements first for better caching
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY . ./

# Set environment variable for port
ENV PORT=8000

# Expose port (Render will override this)
EXPOSE ${PORT}

# Start backend - use PORT environment variable
CMD uvicorn main:app --host 0.0.0.0 --port ${PORT}
