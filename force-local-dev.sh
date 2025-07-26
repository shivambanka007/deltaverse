#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Setting up DeltaVerse Local Development Environment${NC}"

# Create .env.development.local with localhost URLs
echo -e "${BLUE}Creating .env.development.local with localhost URLs...${NC}"
cat > ./deltaverse-ui/.env.development.local << EOL
# Local Development Environment Variables for DeltaVerse Frontend
# LOCALHOST configuration - this will override all other .env files

# API URLs - LOCALHOST
REACT_APP_API_URL=http://localhost:8002
REACT_APP_FI_MCP_URL=http://localhost:8080
REACT_APP_API_VERSION=v1
REACT_APP_ENVIRONMENT=development

# Debug settings
REACT_APP_DEBUG=true
NODE_ENV=development

# Keep Firebase configuration from .env.local
EOL

# Copy Firebase config from .env.local
echo -e "${BLUE}Copying Firebase config from .env.local...${NC}"
grep "REACT_APP_FIREBASE" ./deltaverse-ui/.env.local >> ./deltaverse-ui/.env.development.local

# Kill any existing processes on our ports
echo -e "${BLUE}Cleaning up existing processes...${NC}"
lsof -ti:8002 | xargs kill -9 2>/dev/null || true
lsof -ti:8080 | xargs kill -9 2>/dev/null || true
lsof -ti:3000 | xargs kill -9 2>/dev/null || true

# Start Fi-MCP Server
echo -e "${GREEN}Starting Fi-MCP Server on port 8080...${NC}"
cd fi-mcp-dev-master
FI_MCP_PORT=8080 go run . &
FI_MCP_PID=$!
cd ..

# Wait for Fi-MCP server to start
echo -e "${BLUE}Waiting for Fi-MCP server to start...${NC}"
sleep 3

# Start Backend API
echo -e "${GREEN}Starting Backend API on port 8002...${NC}"
cd deltaverse-api
source venv/bin/activate
ENVIRONMENT=development PORT=8002 FI_MCP_URL=http://localhost:8080 python3 -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8002 &
BACKEND_PID=$!
cd ..

# Wait for backend to start
echo -e "${BLUE}Waiting for backend server to start...${NC}"
sleep 3

# Start Frontend with development environment
echo -e "${GREEN}Starting Frontend on port 3000...${NC}"
cd deltaverse-ui
BROWSER=none npm start &
FRONTEND_PID=$!
cd ..

# Function to cleanup processes
cleanup() {
    echo -e "${YELLOW}\nShutting down services...${NC}"
    kill $FI_MCP_PID 2>/dev/null
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    exit 0
}

# Trap SIGINT (Ctrl+C) and call cleanup
trap cleanup SIGINT

echo -e "${GREEN}All services started!${NC}"
echo -e "Frontend: http://localhost:3000"
echo -e "Backend API: http://localhost:8002"
echo -e "Fi-MCP Server: http://localhost:8080"
echo -e "\n${YELLOW}Press Ctrl+C to stop all services${NC}"

# Wait for all background processes
wait
