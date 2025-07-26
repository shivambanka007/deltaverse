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

# Function to check command version
check_version() {
    local command=$1
    local min_version=$2
    if ! command -v $command &> /dev/null; then
        print_status "$RED" "❌ $command is not installed"
        return 1
    else
        print_status "$GREEN" "✅ $command is installed: $($command --version)"
        return 0
    fi
}

# Function to check file exists
check_file() {
    local file=$1
    if [ -f "$file" ]; then
        print_status "$GREEN" "✅ $file exists"
        return 0
    else
        print_status "$RED" "❌ $file is missing"
        return 1
    fi
}

print_status "$YELLOW" "🔍 Running pre-flight checks..."

# Check required tools
echo "Checking required tools..."
check_version "python3" "3.8"
check_version "node" "14"
check_version "npm" "6"
check_version "docker" "20"
check_version "pip" "20"

# Check required files
echo -e "\nChecking required files..."
check_file "requirements.txt"
check_file "package.json"
check_file "Dockerfile"
check_file "bitbucket-pipelines.yml"
check_file ".env.template"

# Check required directories
echo -e "\nChecking required directories..."
directories=("deltaverse-api" "deltaverse-ui" "fi-mcp-dev-master" "tests")
for dir in "${directories[@]}"; do
    if [ -d "$dir" ]; then
        print_status "$GREEN" "✅ $dir directory exists"
    else
        print_status "$RED" "❌ $dir directory is missing"
        exit 1
    fi
done

# Check environment variables
echo -e "\nChecking environment variables..."
required_vars=(
    "GCP_PROJECT_ID"
    "CLOUD_RUN_REGION"
    "FIREBASE_PROJECT_ID"
)

for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        print_status "$RED" "❌ $var is not set"
    else
        print_status "$GREEN" "✅ $var is set"
    fi
done

# Check Python dependencies
echo -e "\nChecking Python dependencies..."
if ! pip freeze > /dev/null; then
    print_status "$RED" "❌ Python virtual environment is not activated"
    exit 1
fi

# Check Node dependencies
echo -e "\nChecking Node dependencies..."
if [ -d "node_modules" ]; then
    print_status "$GREEN" "✅ Node modules are installed"
else
    print_status "$RED" "❌ Node modules are missing"
fi

print_status "$YELLOW" "Pre-flight checks completed!"
