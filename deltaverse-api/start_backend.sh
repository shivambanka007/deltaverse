#!/bin/bash

# Kill any existing process on port 8002
lsof -ti:8002 | xargs kill -9 2>/dev/null || true

# Set environment variables
export PYTHONPATH=/Users/166984/deltaverse/deltaverse-api
export FI_MCP_URL=http://localhost:8080
export ENVIRONMENT=development
export DEBUG=true
export PORT=8002

# Activate virtual environment
source venv/bin/activate

# Start the server with debug logging
python3 -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8002 --log-level debug
