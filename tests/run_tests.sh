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

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    print_status "$YELLOW" "Creating virtual environment..."
    python -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install test requirements
print_status "$YELLOW" "Installing test requirements..."
pip install -r requirements-test.txt

# Function to run tests with proper formatting
run_test_suite() {
    local test_type=$1
    local test_path=$2
    local extra_args=$3

    print_status "$YELLOW" "Running ${test_type} tests..."
    
    pytest ${test_path} \
        --verbose \
        --capture=no \
        --strict-markers \
        -ra \
        --tb=short \
        --cov=deltaverse-api \
        --cov=fi-mcp-dev-master \
        --cov-report=html \
        --cov-report=term \
        ${extra_args}
    
    local exit_code=$?
    
    if [ $exit_code -eq 0 ]; then
        print_status "$GREEN" "✅ ${test_type} tests passed!"
    else
        print_status "$RED" "❌ ${test_type} tests failed!"
        return $exit_code
    fi
}

# Parse command line arguments
TEST_TYPE=""
PARALLEL=""

while [[ $# -gt 0 ]]; do
    case $1 in
        --unit)
            TEST_TYPE="unit"
            shift
            ;;
        --integration)
            TEST_TYPE="integration"
            shift
            ;;
        --e2e)
            TEST_TYPE="e2e"
            shift
            ;;
        --all)
            TEST_TYPE="all"
            shift
            ;;
        --parallel)
            PARALLEL="-n auto"
            shift
            ;;
        *)
            print_status "$RED" "Unknown argument: $1"
            exit 1
            ;;
    esac
done

# Set default test type if not specified
if [ -z "$TEST_TYPE" ]; then
    TEST_TYPE="all"
fi

# Run tests based on type
case $TEST_TYPE in
    "unit")
        run_test_suite "Unit" "unit/" "$PARALLEL"
        ;;
    "integration")
        run_test_suite "Integration" "integration/" "$PARALLEL"
        ;;
    "e2e")
        run_test_suite "End-to-End" "e2e/" ""  # Don't run E2E in parallel
        ;;
    "all")
        print_status "$YELLOW" "Running all tests..."
        run_test_suite "Unit" "unit/" "$PARALLEL" && \
        run_test_suite "Integration" "integration/" "$PARALLEL" && \
        run_test_suite "End-to-End" "e2e/" ""
        ;;
esac

# Generate coverage report
print_status "$YELLOW" "Generating coverage report..."
coverage html

print_status "$GREEN" "✅ All tests completed!"
print_status "$YELLOW" "Coverage report available at: htmlcov/index.html"
