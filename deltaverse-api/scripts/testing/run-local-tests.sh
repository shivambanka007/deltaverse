#!/bin/bash

# Exit on error
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Function to print colored output
print_status() {
    local color=$1
    local message=$2
    echo -e "${color}${message}${NC}"
}

# Function to check if command exists
check_command() {
    if ! command -v $1 &> /dev/null; then
        print_status "$RED" "❌ Error: $1 is required but not installed."
        exit 1
    fi
}

# Get the project root directory
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../../" && pwd)"

# Check required commands
check_command "python3"
check_command "npm"
check_command "docker"

# Create and activate virtual environment
print_status "$YELLOW" "🔧 Setting up Python virtual environment..."
python3 -m venv "$PROJECT_ROOT/.venv"
source "$PROJECT_ROOT/.venv/bin/activate"

# Install test requirements
print_status "$YELLOW" "📦 Installing test requirements..."
pip install -r "$PROJECT_ROOT/tests/requirements-test.txt"

# Start local services for testing
print_status "$YELLOW" "🚀 Starting local services..."

# Start Fi-MCP server
print_status "$YELLOW" "Starting Fi-MCP server..."
cd "$PROJECT_ROOT/fi-mcp-dev-master"
docker build -t fi-mcp-local .
docker run -d --name fi-mcp-test -p 8080:8080 fi-mcp-local
cd "$PROJECT_ROOT"

# Start backend API
print_status "$YELLOW" "Starting backend API..."
cd "$PROJECT_ROOT/deltaverse-api"
docker build -t api-local .
docker run -d --name api-test -p 8002:8002 \
    -e FI_MCP_URL=http://localhost:8080 \
    -e TESTING=true \
    api-local
cd "$PROJECT_ROOT"

# Start frontend
print_status "$YELLOW" "Starting frontend..."
cd "$PROJECT_ROOT/deltaverse-ui"
npm install
REACT_APP_API_URL=http://localhost:8002 npm start &
cd "$PROJECT_ROOT"

# Wait for services to be ready
print_status "$YELLOW" "⏳ Waiting for services to be ready..."
sleep 10

# Run tests in order
print_status "$YELLOW" "🧪 Running unit tests..."
cd "$PROJECT_ROOT/tests"
./run_tests.sh --unit

print_status "$YELLOW" "🧪 Running integration tests..."
./run_tests.sh --integration

print_status "$YELLOW" "🧪 Running E2E tests..."
./run_tests.sh --e2e
cd "$PROJECT_ROOT"

# Generate combined coverage report
print_status "$YELLOW" "📊 Generating coverage report..."
coverage combine
coverage html
coverage report

# Clean up
print_status "$YELLOW" "🧹 Cleaning up..."
docker stop fi-mcp-test api-test
docker rm fi-mcp-test api-test
pkill -f "react-scripts start"

print_status "$GREEN" "✅ All tests completed!"
print_status "$YELLOW" "Coverage report available at: htmlcov/index.html"

# Print test summary
print_status "$YELLOW" "📝 Test Summary:"
echo "Unit Tests: $(grep "tests passed" "$PROJECT_ROOT/tests/unit/test_results.txt" | tail -n 1)"
echo "Integration Tests: $(grep "tests passed" "$PROJECT_ROOT/tests/integration/test_results.txt" | tail -n 1)"
echo "E2E Tests: $(grep "tests passed" "$PROJECT_ROOT/tests/e2e/test_results.txt" | tail -n 1)"

# Check for any failed tests
if grep -q "FAILED" "$PROJECT_ROOT/tests/*/test_results.txt"; then
    print_status "$RED" "❌ Some tests failed! Check the logs above for details."
    exit 1
else
    print_status "$GREEN" "✅ All tests passed successfully!"
fi
