#!/bin/bash

# Fi-MCP Server Startup Script
# Ensures Fi-MCP server is running for DeltaVerse integration

echo "🚀 Starting Fi-MCP Server for DeltaVerse..."

# Check if server is already running
if curl -s -f http://localhost:8080/static/login.html > /dev/null 2>&1; then
    echo "✅ Fi-MCP server is already running on port 8080"
    exit 0
fi

# Kill any existing processes
echo "🔄 Stopping any existing Fi-MCP processes..."
pkill -f "go run main.go" 2>/dev/null || true
pkill -f "fi-mcp-lite" 2>/dev/null || true

# Wait a moment for processes to stop
sleep 2

# Navigate to Fi-MCP directory
cd "$(dirname "$0")/fi-mcp-dev-master" || {
    echo "❌ Error: fi-mcp-dev-master directory not found"
    exit 1
}

# Start the server
echo "🚀 Starting Fi-MCP server..."
nohup go run main.go > ../fi-mcp.log 2>&1 &

# Wait for server to start
echo "⏳ Waiting for server to start..."
for i in {1..10}; do
    if curl -s -f http://localhost:8080/static/login.html > /dev/null 2>&1; then
        echo "✅ Fi-MCP server started successfully on port 8080"
        echo "📋 Available endpoints:"
        echo "   - Static files: http://localhost:8080/static/"
        echo "   - Mock login: http://localhost:8080/mockWebPage"
        echo "   - MCP stream: http://localhost:8080/stream"
        exit 0
    fi
    sleep 1
done

echo "❌ Failed to start Fi-MCP server"
echo "📋 Check logs: tail -f fi-mcp.log"
exit 1
