# Multi-stage Dockerfile optimized for Google Cloud Run with BuildKit support
# Stage 1: Builder - Install dependencies using pip
FROM python:3.11-slim as builder

# Set environment variables for Python
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

# Set work directory
WORKDIR /app

# Copy requirements file FIRST for better layer caching
COPY requirements.txt ./

# Install system dependencies required for building Python packages including audio support
RUN apt-get update && apt-get install -y \
    build-essential \
    portaudio19-dev \
    libasound2-dev \
    libportaudio2 \
    libportaudiocpp0 \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

# Create virtual environment
RUN python -m venv /app/venv
ENV PATH="/app/venv/bin:$PATH"

# Install Python dependencies (this layer will cache if requirements.txt unchanged)
RUN pip install --upgrade pip && pip install -r requirements.txt

# Stage 2: Final - Create production image
FROM python:3.11-slim as final

# Set environment variables
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PATH="/app/venv/bin:$PATH"

# Install minimal runtime dependencies including audio libraries
RUN apt-get update && apt-get install -y \
    libportaudio2 \
    libportaudiocpp0 \
    libasound2 \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

# Create non-root user for security
RUN groupadd -r appuser && useradd -r -g appuser appuser

# Set work directory
WORKDIR /app

# Copy virtual environment from builder stage
COPY --from=builder /app/venv /app/venv

# Copy application code
COPY app/ ./app/

# Create directory structure that matches the error paths
RUN mkdir -p /app/app

# Copy Firebase service account file to EXACT paths mentioned in the error
COPY app/opportune-scope-466406-p6-firebase-adminsdk-fbsvc-584369e1bd.json /app/app/opportune-scope-466406-p6-firebase-adminsdk-fbsvc-584369e1bd.json
COPY app/opportune-scope-466406-p6-firebase-adminsdk-fbsvc-584369e1bd.json /app/app/firebase-service-account.json

# Change ownership to non-root user
RUN chown -R appuser:appuser /app
USER appuser

# # Health check with increased timeouts
# HEALTHCHECK --interval=60s --timeout=60s --start-period=30s --retries=5 \
#     CMD python -c "import requests, os; requests.get(f'http://localhost:{os.getenv(\"PORT\", \"8080\")}/health')" || exit 1

# Command to run the application directly
CMD ["python3", "app/main.py"]
