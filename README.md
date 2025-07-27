# DeltaVerse - Agentic AI Code Collaboration

DeltaVerse is a comprehensive financial AI platform that combines agentic AI capabilities with real-time financial data integration. The platform features a React-based frontend, FastAPI backend, and a Go-based MCP (Model Context Protocol) server for financial data simulation.

## 🏗️ Architecture Overview

The project consists of three main applications:

1. **deltaverse-ui** - React frontend with Redux state management
2. **deltaverse-api** - FastAPI Python backend with Firebase integration
3. **fi-mcp-dev-master** - Go-based MCP server for financial data simulation

## 📋 Prerequisites

Before setting up the project locally, ensure you have the following installed:

### Required Software
- **Node.js** (v16.0.0 or higher) - [Download](https://nodejs.org/)
- **npm** (v8.0.0 or higher) - Comes with Node.js
- **Python** (v3.8 or higher) - [Download](https://python.org/)
- **Go** (v1.23 or higher) - [Download](https://go.dev/doc/install)
- **Git** - [Download](https://git-scm.com/)

### Optional Tools
- **Firebase CLI** - For Firebase operations: `npm install -g firebase-tools`
- **Postman** - For API testing (collection included in project)

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone <repository-url>
cd deltaverse
```

### 2. Environment Setup

#### Root Directory Environment
Copy the template and configure:
```bash
cp .env.template .env
```

Edit `.env` with your configuration:
```bash
# Google Cloud & Vertex AI Configuration
VERTEX_AI_PROJECT_ID=your-gcp-project-id
VERTEX_AI_LOCATION=us-central1
GCP_PROJECT_ID=your-gcp-project-id

# Gemini Model Configuration
GEMINI_MODEL_NAME=gemini-1.5-flash
GEMINI_TEMPERATURE=0.7
GEMINI_MAX_TOKENS=1024
GEMINI_TOP_P=0.8
GEMINI_TOP_K=40

# Fi MCP Configuration
FI_MCP_URL=http://localhost:8080
FI_MCP_TIMEOUT=30
FI_MCP_SERVER_URL=http://localhost:8080
REACT_APP_FI_MCP_URL=http://localhost:8080

# Firebase Configuration
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_STORAGE_BUCKET=your-firebase-project-id.appspot.com

# Application Configuration
ENVIRONMENT=development
LOG_LEVEL=INFO
API_PORT=8000
```

#### Backend API Environment
```bash
cd deltaverse-api
cp .env.example .env
```

Edit `deltaverse-api/.env`:
```bash
# Application Settings
APP_NAME=Deltaverse API
APP_VERSION=0.1.0
DEBUG=true
ENVIRONMENT=development

# Firebase Configuration
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_PRIVATE_KEY_ID=your_private_key_id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your_client_id
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token

# Fi MCP Server Configuration
FI_MCP_URL=http://localhost:8080
FI_MCP_TIMEOUT=30
FI_MCP_MAX_RETRIES=3

# Vertex AI Configuration
VERTEX_AI_PROJECT_ID=your-gcp-project-id
VERTEX_AI_LOCATION=us-central1

# Google AI Configuration
GOOGLE_AI_API_KEY=your_google_ai_api_key
GEMINI_PRO_MODEL=gemini-1.5-pro-002
GEMINI_FLASH_MODEL=gemini-1.5-flash-002

# Model Configuration
AI_TEMPERATURE=0.7
AI_MAX_OUTPUT_TOKENS=1024
AI_TOP_P=0.8
AI_TOP_K=40

# Database Configuration
FIRESTORE_PROJECT_ID=your-firebase-project-id

# API Configuration
API_V1_PREFIX=/api/v1
ALLOWED_HOSTS=["http://localhost:3000", "https://your-domain.web.app"]

# Security
SECRET_KEY=your-super-secret-key-here-make-it-long-and-random
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Logging
LOG_LEVEL=INFO
```

#### Frontend Environment
```bash
cd ../deltaverse-ui
cp .env.example .env
```

Edit `deltaverse-ui/.env`:
```bash
# Firebase Configuration
REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-firebase-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=1:your_sender_id:web:your_app_id
REACT_APP_FIREBASE_MEASUREMENT_ID=G-your_measurement_id

# Development Settings
REACT_APP_ENVIRONMENT=development
REACT_APP_DEBUG=true

# API Configuration
REACT_APP_API_BASE_URL=http://localhost:8000
REACT_APP_API_URL=http://localhost:8000

# Chat Configuration
REACT_APP_USE_REAL_API=false
REACT_APP_ENABLE_STREAMING=true

# Feature Flags
REACT_APP_ENABLE_ANALYTICS=true
REACT_APP_ENABLE_EMULATORS=true
```

### 3. Install Dependencies

#### Backend Dependencies
```bash
cd deltaverse-api

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

#### Frontend Dependencies
```bash
cd ../deltaverse-ui
npm install
```

#### Fi-MCP Server Dependencies
```bash
cd ../fi-mcp-dev-master
go mod tidy
```

### 4. Firebase Setup (Required)

1. **Create Firebase Project**:
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project or use existing one
   - Enable Authentication and Firestore Database

2. **Get Firebase Configuration**:
   - Go to Project Settings > General > Your apps
   - Add a web app and copy the config values
   - Update the `REACT_APP_FIREBASE_*` variables in `deltaverse-ui/.env`

3. **Service Account Setup**:
   - Go to Project Settings > Service accounts
   - Generate new private key
   - Extract the values and update `deltaverse-api/.env`

4. **Firestore Rules** (Optional):
   ```bash
   # Deploy Firestore rules
   firebase deploy --only firestore:rules
   ```

### 5. Google Cloud Setup (Optional but Recommended)

1. **Create GCP Project**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create new project or use existing one

2. **Enable APIs**:
   - Vertex AI API
   - Generative AI API
   - Firestore API

3. **Authentication**:
   - Create service account
   - Download JSON key file
   - Set `GOOGLE_APPLICATION_CREDENTIALS` environment variable

## 🏃‍♂️ Running the Application

### Option 1: Using the Automated Script (Recommended)
```bash
# Make script executable
chmod +x start-dev.sh

# Start all services
./start-dev.sh
```

This will start:
- Fi-MCP Server on port 8080
- Backend API on port 8002
- Frontend on port 3000

### Option 2: Manual Setup

#### Terminal 1: Fi-MCP Server
```bash
cd fi-mcp-dev-master
FI_MCP_PORT=8080 go run .
```

#### Terminal 2: Backend API
```bash
cd deltaverse-api
source venv/bin/activate
ENVIRONMENT=development PORT=8002 FI_MCP_URL=http://localhost:8080 python3 -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8002
```

#### Terminal 3: Frontend
```bash
cd deltaverse-ui
REACT_APP_API_URL=http://localhost:8002 REACT_APP_FI_MCP_URL=http://localhost:8080 npm start
```

## 🌐 Access Points

Once all services are running:

- **Frontend Application**: http://localhost:3000
- **Backend API**: http://localhost:8002
- **API Documentation**: http://localhost:8002/docs
- **Fi-MCP Server**: http://localhost:8080

## 🧪 Testing the Setup

### 1. Test Fi-MCP Server
```bash
curl -X POST -H "Content-Type: application/json" \
  -H "Mcp-Session-Id: mcp-session-test" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"fetch_net_worth","arguments":{}}}' \
  http://localhost:8080/mcp/stream
```

### 2. Test Backend API
```bash
curl http://localhost:8002/health
```

### 3. Test Frontend
Open http://localhost:3000 in your browser and verify the application loads.

## 📊 Fi-MCP Test Data

The Fi-MCP server includes dummy data for various user scenarios. Use these phone numbers for testing:

| Phone Number | Scenario Description |
|-------------|---------------------|
| 1111111111  | No assets connected - only savings account |
| 2222222222  | All assets connected - large mutual fund portfolio |
| 3333333333  | All assets connected - small mutual fund portfolio |
| 4444444444  | Multiple banks and UANs with partial transactions |
| 5555555555  | All assets except credit score |
| 7777777777  | Debt-heavy low performer |
| 8888888888  | SIP Samurai - consistent monthly investments |
| 9999999999  | Fixed income fanatic - low-risk investments |

## 🔧 Development Tools

### API Testing
- **Postman Collection**: Import `DeltaVerse_API_Collection.postman_collection.json`
- **Environment Files**: Use `DeltaVerse_Development.postman_environment.json`

### Code Quality
```bash
# Frontend linting
cd deltaverse-ui
npm run lint
npm run format

# Backend testing
cd deltaverse-api
source venv/bin/activate
pytest
```

## 🐳 Docker Support

For containerized deployment:

```bash
# Build and run with Docker Compose
docker-compose -f docker-compose.prod.yml up --build
```

## 📝 Environment Variables Reference

### Critical Environment Variables

#### Firebase (Required)
- `FIREBASE_PROJECT_ID`: Your Firebase project ID
- `FIREBASE_PRIVATE_KEY`: Service account private key
- `FIREBASE_CLIENT_EMAIL`: Service account email

#### Google Cloud (Optional)
- `VERTEX_AI_PROJECT_ID`: GCP project ID for Vertex AI
- `GOOGLE_AI_API_KEY`: Google AI API key for Gemini models

#### Application URLs
- `FI_MCP_URL`: Fi-MCP server URL (default: http://localhost:8080)
- `REACT_APP_API_URL`: Backend API URL (default: http://localhost:8002)

## 🚨 Troubleshooting

### Common Issues

1. **Port Already in Use**:
   ```bash
   # Kill processes on specific ports
   lsof -ti:3000 | xargs kill -9
   lsof -ti:8002 | xargs kill -9
   lsof -ti:8080 | xargs kill -9
   ```

2. **Python Virtual Environment Issues**:
   ```bash
   # Recreate virtual environment
   cd deltaverse-api
   rm -rf venv
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```

3. **Node Modules Issues**:
   ```bash
   # Clean install
   cd deltaverse-ui
   rm -rf node_modules package-lock.json
   npm install
   ```

4. **Go Module Issues**:
   ```bash
   # Clean Go modules
   cd fi-mcp-dev-master
   go clean -modcache
   go mod tidy
   ```

5. **Firebase Authentication Issues**:
   - Verify Firebase project configuration
   - Check service account permissions
   - Ensure Firestore rules allow read/write access

### Logs and Debugging

- **Backend Logs**: Check terminal running the FastAPI server
- **Frontend Logs**: Check browser console (F12)
- **Fi-MCP Logs**: Check terminal running the Go server

## 📚 Additional Resources

- **Project Documentation**: See `docs/` directory
- **API Documentation**: http://localhost:8002/docs (when running)
- **Firebase Console**: https://console.firebase.google.com/
- **Google Cloud Console**: https://console.cloud.google.com/

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review the logs for error messages
3. Ensure all environment variables are properly set
4. Verify all dependencies are installed correctly

For additional support, please refer to the project documentation or create an issue in the repository.
