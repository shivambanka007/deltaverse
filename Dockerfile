# DeltaVerse AI-Powered API Dockerfile
# Deploys the root-level main.py with AI integration

FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Install additional AI dependencies
RUN pip install --no-cache-dir \
    mcp \
    google-cloud-aiplatform \
    vertexai \
    google-auth \
    google-cloud-firestore

# Copy application files
COPY main.py .
COPY ai_chat_service.py .
COPY firebase_config.py .
COPY *.json ./

# Create non-root user for security
RUN useradd --create-home --shell /bin/bash app \
    && chown -R app:app /app
USER app

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/ || exit 1

# Run the application
CMD ["python", "main.py"]
