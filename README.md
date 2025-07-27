# DeltaVerse - Let AI Speak to your money (Agentic AI Code Collaboration)

DeltaVerse is a comprehensive financial AI platform that combines agentic AI capabilities with real-time financial data integration. The platform features a React-based frontend, FastAPI backend, and a Go-based MCP (Model Context Protocol) server for financial data simulation.

## 🏗️ Architecture Overview

The project consists of five main applications:

1. **deltaverse-ui** - React frontend with Redux state management
2. **deltaverse-api** - FastAPI Python backend with Firebase integration
3. **fi-mcp-dev-master** - Go-based MCP server for financial data simulation
4. **fi-zen** - React Native mobile application for iOS and Android
5. **deltaverse-multiagent** - Multi-agent AI system for personalized financial insights

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

#### Mobile App Environment (fi-zen)
```bash
cd ../fi-zen
cp .env.example .env
```

Edit `fi-zen/.env` (create if doesn't exist):
```bash
# API Configuration
API_BASE_URL=http://localhost:8002
FI_MCP_URL=http://localhost:8080

# Firebase Configuration (same as web app)
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
FIREBASE_STORAGE_BUCKET=your-project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=1:your_sender_id:web:your_app_id

# Development Settings
ENVIRONMENT=development
DEBUG=true

# Feature Flags
ENABLE_ANALYTICS=true
ENABLE_PUSH_NOTIFICATIONS=false
```

#### Multi-Agent System Environment (deltaverse-multiagent)
```bash
cd ../deltaverse-multiagent
cp .env.example .env
```

Edit `deltaverse-multiagent/.env`:
```bash
# GCP Configuration (for service account authentication)
GCP_PROJECT_ID=your-gcp-project-id
PUBSUB_TOPIC_PREFIX=deltaverse-financial-insights

# MCP Server URLs (for local development)
FI_MCP_SERVER_URL=http://localhost:8001
YAHOO_MCP_SERVER_URL=http://localhost:8002
MOSPI_API_SERVER_URL=http://localhost:8003
MINT_MCP_SERVER_URL=http://localhost:8004
YNAB_MCP_SERVER_URL=http://localhost:8005
ZERODHA_COIN_MCP_SERVER_URL=http://localhost:8006
ELEVENLABS_API_SERVER_URL=http://localhost:8007

# Feature Flags (set to 'false' to enable mock data for specific agents)
ENABLE_FI_MCP=true
ENABLE_YAHOO_MCP=true
ENABLE_MOSPI_API=true
ENABLE_MINT_MCP=true
ENABLE_YNAB_MCP=true
ENABLE_ZERODHA_COIN_MCP=true
ENABLE_ELEVENLABS_API=true

# API Keys/Tokens for External Services (replace with your actual credentials)
# YNAB_ACCESS_TOKEN=your_ynab_personal_access_token
# KITE_API_KEY=your_zerodha_kite_api_key
# KITE_API_SECRET=your_zerodha_kite_api_secret
# ELEVENLABS_API_KEY=your_elevenlabs_api_key
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

#### Mobile App Dependencies (fi-zen)
```bash
cd ../fi-zen

# Install Node.js dependencies
npm install

# For iOS development (macOS only)
cd ios
bundle install
bundle exec pod install
cd ..

# For Android development, ensure Android SDK is properly configured
# Check React Native environment setup: npx react-native doctor
```

#### Multi-Agent System Dependencies (deltaverse-multiagent)
```bash
cd ../deltaverse-multiagent

# Create virtual environment
python3 -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Install Go dependencies for fi-mcp-dev-master (if running locally)
cd fi-mcp-dev-master
go mod tidy
cd ..
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

#### Terminal 4: Multi-Agent System (Optional)
```bash
cd deltaverse-multiagent
source .venv/bin/activate

# Start the multi-agent system
uvicorn src.main:app --host 0.0.0.0 --port 8000

# Optional: Start additional MCP servers for specific agents
# Terminal 4a: Yahoo MCP Server (if ENABLE_YAHOO_MCP=true)
python src/mcp_servers/yfinance_mcp_server.py

# Terminal 4b: Fi-MCP Server for multiagent (if different from main)
cd fi-mcp-dev-master
FI_MCP_PORT=8001 go run .
```

## 📱 Mobile Development (fi-zen)

The fi-zen mobile application is built with React Native and supports both iOS and Android platforms.

### Prerequisites for Mobile Development

Before building the mobile app, ensure you have completed the React Native environment setup:

#### For Android Development
1. **Install Android Studio** - [Download](https://developer.android.com/studio)
2. **Configure Android SDK**:
   - Open Android Studio
   - Go to SDK Manager (Tools > SDK Manager)
   - Install Android SDK Platform 34 (or latest)
   - Install Android SDK Build-Tools
   - Install Android Emulator
3. **Set Environment Variables**:
   ```bash
   # Add to your ~/.bashrc, ~/.zshrc, or ~/.bash_profile
   export ANDROID_HOME=$HOME/Library/Android/sdk  # macOS
   export ANDROID_HOME=$HOME/Android/Sdk          # Linux
   export PATH=$PATH:$ANDROID_HOME/emulator
   export PATH=$PATH:$ANDROID_HOME/platform-tools
   ```
4. **Install Java Development Kit (JDK 17)**

#### For iOS Development (macOS only)
1. **Install Xcode** - [Download from Mac App Store](https://apps.apple.com/us/app/xcode/id497799835)
2. **Install Xcode Command Line Tools**:
   ```bash
   xcode-select --install
   ```
3. **Install CocoaPods**:
   ```bash
   sudo gem install cocoapods
   ```

### Setting Up the Mobile App

#### 1. Navigate to fi-zen Directory
```bash
cd fi-zen
```

#### 2. Install Dependencies
```bash
# Install Node.js dependencies
npm install

# For iOS (macOS only)
cd ios
bundle install
bundle exec pod install
cd ..
```

#### 3. Environment Setup
Create `.env` file in the fi-zen directory:
```bash
# API Configuration
API_BASE_URL=http://localhost:8002
FI_MCP_URL=http://localhost:8080

# Firebase Configuration
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
FIREBASE_STORAGE_BUCKET=your-project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=1:your_sender_id:web:your_app_id

# Development Settings
ENVIRONMENT=development
DEBUG=true
```

### Running the Mobile App

#### Start Metro Bundler
```bash
# In the fi-zen directory
npm start
```

#### Run on Android
```bash
# Make sure you have an Android emulator running or device connected
npm run android

# Alternative: using React Native CLI directly
npx react-native run-android
```

#### Run on iOS (macOS only)
```bash
# Make sure you have iOS Simulator installed
npm run ios

# Alternative: using React Native CLI directly
npx react-native run-ios

# To run on a specific simulator
npx react-native run-ios --simulator="iPhone 15 Pro"
```

### Building APK for Android

#### Debug APK
```bash
cd android
./gradlew assembleDebug

# APK will be generated at:
# android/app/build/outputs/apk/debug/app-debug.apk
```

#### Release APK
1. **Generate a signing key** (first time only):
   ```bash
   cd android/app
   keytool -genkeypair -v -storename my-upload-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000
   ```

2. **Configure signing** in `android/gradle.properties`:
   ```properties
   MYAPP_UPLOAD_STORE_FILE=my-upload-key.keystore
   MYAPP_UPLOAD_KEY_ALIAS=my-key-alias
   MYAPP_UPLOAD_STORE_PASSWORD=*****
   MYAPP_UPLOAD_KEY_PASSWORD=*****
   ```

3. **Update build.gradle** (`android/app/build.gradle`):
   ```gradle
   android {
       ...
       signingConfigs {
           release {
               if (project.hasProperty('MYAPP_UPLOAD_STORE_FILE')) {
                   storeFile file(MYAPP_UPLOAD_STORE_FILE)
                   storePassword MYAPP_UPLOAD_STORE_PASSWORD
                   keyAlias MYAPP_UPLOAD_KEY_ALIAS
                   keyPassword MYAPP_UPLOAD_KEY_PASSWORD
               }
           }
       }
       buildTypes {
           release {
               ...
               signingConfig signingConfigs.release
           }
       }
   }
   ```

4. **Build release APK**:
   ```bash
   cd android
   ./gradlew assembleRelease
   
   # APK will be generated at:
   # android/app/build/outputs/apk/release/app-release.apk
   ```

### Building for iOS

#### Debug Build
```bash
# Build for iOS Simulator
npx react-native run-ios --configuration Debug

# Build for device (requires Apple Developer account)
npx react-native run-ios --device --configuration Debug
```

#### Release Build
1. **Open Xcode**:
   ```bash
   open ios/FiMoney.xcworkspace
   ```

2. **Configure signing**:
   - Select your project in Xcode
   - Go to Signing & Capabilities
   - Select your development team
   - Configure bundle identifier

3. **Build for release**:
   - Product > Scheme > Edit Scheme
   - Set Build Configuration to "Release"
   - Product > Build
   - Product > Archive (for App Store submission)

### Mobile App Testing

#### Unit Tests
```bash
# Run Jest tests
npm test

# Run tests with coverage
npm test -- --coverage
```

#### End-to-End Testing
```bash
# Install Detox (if not already installed)
npm install -g detox-cli

# Build for testing
detox build --configuration ios.sim.debug

# Run E2E tests
detox test --configuration ios.sim.debug
```

### Mobile App Debugging

#### React Native Debugger
1. **Install React Native Debugger**:
   ```bash
   # macOS
   brew install --cask react-native-debugger
   
   # Or download from: https://github.com/jhen0409/react-native-debugger
   ```

2. **Enable debugging**:
   - Shake device or press `Cmd+D` (iOS) / `Cmd+M` (Android)
   - Select "Debug"

#### Flipper Integration
1. **Install Flipper**: [Download](https://fbflipper.com/)
2. **Run the app** and Flipper should automatically detect it

### Troubleshooting Mobile Development

#### Common Android Issues
1. **Metro bundler issues**:
   ```bash
   npx react-native start --reset-cache
   ```

2. **Gradle build failures**:
   ```bash
   cd android
   ./gradlew clean
   cd ..
   npx react-native run-android
   ```

3. **ADB issues**:
   ```bash
   adb kill-server
   adb start-server
   ```

#### Common iOS Issues
1. **CocoaPods issues**:
   ```bash
   cd ios
   pod deintegrate
   pod install
   cd ..
   ```

2. **Xcode build issues**:
   - Clean build folder: Product > Clean Build Folder
   - Reset simulator: Device > Erase All Content and Settings

3. **Metro bundler cache**:
   ```bash
   npx react-native start --reset-cache
   ```

### Mobile App Configuration

#### App Icons and Splash Screens
- **Android**: Place icons in `android/app/src/main/res/mipmap-*` directories
- **iOS**: Use Xcode to manage app icons and launch screens

#### App Permissions
- **Android**: Configure in `android/app/src/main/AndroidManifest.xml`
- **iOS**: Configure in `ios/FiMoney/Info.plist`

#### Deep Linking
Configure URL schemes in:
- **Android**: `android/app/src/main/AndroidManifest.xml`
- **iOS**: `ios/FiMoney/Info.plist`

## 🤖 Multi-Agent System (deltaverse-multiagent)

The deltaverse-multiagent system is an AI-powered multi-agent architecture designed to provide personalized financial insights through natural language queries. It orchestrates multiple specialized agents to process complex financial questions and deliver comprehensive responses.

### Architecture

The system follows a multi-agent pattern with these key components:

- **Main API (FastAPI)**: Entry point for user interactions via `/query` endpoint
- **Orchestrator Agent**: Breaks down user queries into sub-queries and coordinates task agents
- **Evaluator Agent**: Assesses the quality and completeness of responses
- **Task Agents**: Specialized agents for different financial data sources:
  - **FI MCP Agent**: Connects to fi-mcp-dev-master for personal financial data
  - **Yahoo MCP Agent**: Fetches stock market data via yfinance
  - **MoSPI API Agent**: Government economic data (conceptual)
  - **Mint MCP Agent**: Account balances and transactions (mock only)
  - **YNAB MCP Agent**: Budget and transaction data from YNAB API
  - **Zerodha Coin MCP Agent**: Investment portfolio data via Kite Connect
  - **ElevenLabs API Agent**: Text-to-speech conversion

### Key Features

- **Feature Flags**: Enable/disable individual agents via environment variables
- **Mock Data Integration**: Fallback to mock data when external services are unavailable
- **Modular Architecture**: Easy to add new agents and data sources
- **Authentication Support**: Service account and API key management

### Usage Examples

Once the system is running on `http://localhost:8000`, you can send POST requests to `/query`:

```bash
# General financial query
curl -X POST -H "Content-Type: application/json" \
  -d '{"user_id": "test_user", "query": "How much money will I have at 40?"}' \
  http://localhost:8000/query

# Stock price query
curl -X POST -H "Content-Type: application/json" \
  -d '{"user_id": "test_user", "query": "What is the stock price of AAPL?"}' \
  http://localhost:8000/query

# Budget information
curl -X POST -H "Content-Type: application/json" \
  -d '{"user_id": "test_user", "query": "List my budgets"}' \
  http://localhost:8000/query
```

### Agent Configuration

Each agent can be enabled/disabled using environment variables:
- `ENABLE_FI_MCP=true/false`
- `ENABLE_YAHOO_MCP=true/false`
- `ENABLE_YNAB_MCP=true/false`
- `ENABLE_ZERODHA_COIN_MCP=true/false`
- `ENABLE_ELEVENLABS_API=true/false`

When disabled, agents return mock data for testing and development purposes.

## 🌐 Access Points

Once all services are running:

- **Frontend Application**: http://localhost:3000
- **Backend API**: http://localhost:8002
- **API Documentation**: http://localhost:8002/docs
- **Fi-MCP Server**: http://localhost:8080
- **Multi-Agent System**: http://localhost:8000 (API Documentation: http://localhost:8000/docs)

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

### 4. Test Multi-Agent System
```bash
curl -X POST -H "Content-Type: application/json" \
  -d '{"user_id": "test_user", "query": "What is my net worth?"}' \
  http://localhost:8000/query
```

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

5. **Mobile App Issues (fi-zen)**:
   ```bash
   # Reset React Native cache
   cd fi-zen
   npx react-native start --reset-cache
   
   # Clean Android build
   cd android
   ./gradlew clean
   cd ..
   
   # Reset iOS pods (macOS only)
   cd ios
   pod deintegrate
   pod install
   cd ..
   ```

6. **Firebase Authentication Issues**:
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
