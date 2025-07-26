#!/bin/bash

# Test Voice Deployment Script
# This script helps test the new interactive AI voice system

echo "🎤 Testing Interactive AI Voice System Deployment"
echo "=================================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the deltaverse root directory"
    exit 1
fi

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check dependencies
echo "📋 Checking dependencies..."

if ! command_exists node; then
    echo "❌ Node.js is not installed"
    exit 1
fi

if ! command_exists python3; then
    echo "❌ Python 3 is not installed"
    exit 1
fi

echo "✅ Dependencies check passed"

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd deltaverse-ui
npm install
if [ $? -ne 0 ]; then
    echo "❌ Failed to install frontend dependencies"
    exit 1
fi
cd ..

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd deltaverse-api
pip3 install -r requirements.txt
if [ $? -ne 0 ]; then
    echo "❌ Failed to install backend dependencies"
    echo "💡 You may need to install system dependencies for speech recognition:"
    echo "   macOS: brew install portaudio"
    echo "   Ubuntu: sudo apt-get install python3-pyaudio"
    exit 1
fi
cd ..

# Build frontend
echo "🏗️  Building frontend..."
cd deltaverse-ui
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Failed to build frontend"
    exit 1
fi
cd ..

# Test backend voice endpoints
echo "🧪 Testing backend voice endpoints..."
cd deltaverse-api

# Start backend in background for testing
python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

# Wait for backend to start
sleep 5

# Test voice health endpoint
echo "🔍 Testing voice health endpoint..."
curl -s http://localhost:8000/voice/health | python3 -m json.tool
if [ $? -ne 0 ]; then
    echo "❌ Voice health endpoint test failed"
    kill $BACKEND_PID
    exit 1
fi

# Test voice status endpoint
echo "🔍 Testing voice status endpoint..."
curl -s http://localhost:8000/voice/status | python3 -m json.tool
if [ $? -ne 0 ]; then
    echo "❌ Voice status endpoint test failed"
    kill $BACKEND_PID
    exit 1
fi

# Stop backend
kill $BACKEND_PID
cd ..

echo "✅ All tests passed!"
echo ""
echo "🚀 Deployment Instructions:"
echo "=========================="
echo ""
echo "1. Frontend (React + Redux):"
echo "   cd deltaverse-ui"
echo "   npm start"
echo "   Open: http://localhost:3000/voice-test"
echo ""
echo "2. Backend (FastAPI):"
echo "   cd deltaverse-api"
echo "   python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"
echo "   API Docs: http://localhost:8000/docs"
echo ""
echo "3. Voice Features:"
echo "   - Interactive AI Control Panel"
echo "   - Real-time WebSocket communication"
echo "   - User-friendly start/stop controls"
echo "   - Confidence threshold settings"
echo "   - Editable transcripts"
echo "   - Session analytics"
echo ""
echo "4. Production Deployment:"
echo "   - Frontend: Firebase Hosting"
echo "   - Backend: Google Cloud Run"
echo "   - WebSocket: Supported on Cloud Run"
echo ""
echo "🎯 Key Features Implemented:"
echo "============================"
echo "✅ User-interactive AI controls"
echo "✅ Start/Stop/Pause/Resume functionality"
echo "✅ Real-time confidence display"
echo "✅ Editable transcript interface"
echo "✅ User preference management"
echo "✅ WebSocket real-time communication"
echo "✅ Emergency stop functionality"
echo "✅ Session analytics and timing"
echo "✅ Mobile-responsive design"
echo "✅ Redux state management"
echo ""
echo "🔧 Troubleshooting:"
echo "=================="
echo "- If microphone access fails, check browser permissions"
echo "- For WebSocket issues, verify CORS settings"
echo "- Speech recognition requires internet connection"
echo "- Check browser console for detailed error messages"
echo ""
echo "Happy testing! 🎉"
