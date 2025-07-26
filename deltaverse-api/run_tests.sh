#!/bin/bash

# Test runner script for DeltaVerse API
# Suppresses external library warnings for clean output

echo "🧪 Running DeltaVerse API Tests..."
echo "=================================="

# Activate virtual environment if it exists
if [ -d "venv" ]; then
    echo "📦 Activating virtual environment..."
    source venv/bin/activate
fi

# Set comprehensive environment variables to suppress warnings
export PYTHONWARNINGS="ignore"
export TESTING=true

# Run tests with maximum warning suppression
echo "🚀 Executing tests..."
python -W ignore -m pytest app/tests/ -v --tb=short --disable-warnings

# Check exit code
if [ $? -eq 0 ]; then
    echo ""
    echo "✅ All tests passed successfully!"
else
    echo ""
    echo "❌ Some tests failed. Check the output above."
    exit 1
fi
