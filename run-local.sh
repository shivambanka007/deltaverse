#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}Starting Local Development Environment${NC}"

# Kill any existing processes on our ports
echo "Cleaning up existing processes..."
lsof -ti:8002 | xargs kill -9 2>/dev/null || true
lsof -ti:8080 | xargs kill -9 2>/dev/null || true
lsof -ti:3000 | xargs kill -9 2>/dev/null || true

# Start Fi-MCP Server
echo -e "${GREEN}Starting Fi-MCP Server on port 8080...${NC}"
cd fi-mcp-dev-master
FI_MCP_PORT=8080 go run . &
FI_MCP_PID=$!
cd ..

# Start Backend API
echo -e "${GREEN}Starting Backend API on port 8002...${NC}"
cd deltaverse-api
ENVIRONMENT=development PORT=8002 FI_MCP_URL=http://localhost:8080 python3 -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8002 &
BACKEND_PID=$!
cd ..

# Start Frontend
echo -e "${GREEN}Starting Frontend on port 3000...${NC}"
cd deltaverse-ui
REACT_APP_API_URL=http://localhost:8002 REACT_APP_FI_MCP_URL=http://localhost:8080 npm start &
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
