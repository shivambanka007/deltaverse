# Deltaverse Project Summary Document

## Project Overview
Deltaverse is a financial application that provides personalized financial insights and recommendations to users. It integrates with Fi Money to access financial data and uses AI to generate personalized advice. The application consists of a React frontend, FastAPI backend, and Fi-MCP mock server for simulating financial data.

## Architecture Components

### Frontend
- **Technology**: React + Redux
- **Hosting**: Firebase Hosting
- **Key Features**: 
  - Interactive chat interface
  - Financial insights dashboard
  - Fi Money connection integration
  - Responsive design

### Backend API
- **Technology**: FastAPI + Python (UV package manager)
- **Deployment**: Google Cloud Run
- **Key Features**:
  - RESTful API endpoints
  - Firebase authentication integration
  - Financial data processing
  - AI-powered insights generation

### Fi-MCP Mock Server
- **Technology**: Go
- **Deployment**: Google Cloud Run
- **Purpose**: Simulates Fi Money's Model Context Protocol for development and testing
- **Features**:
  - Provides dummy financial data
  - Simulates different user scenarios
  - Implements mock authentication flow

### Data Storage
- **Primary Database**: Firestore
- **Data Types**:
  - User profiles
  - Financial data
  - Chat conversations
  - Generated insights

### Authentication
- **System**: Firebase Authentication
- **Features**:
  - User registration and login
  - Session management
  - Security rules

### CI/CD Pipeline
- **Platform**: Bitbucket Pipelines
- **Process**:
  1. Code changes trigger pipeline
  2. Build Docker images
  3. Push to Google Artifact Registry
  4. Deploy to Cloud Run

## Key Workflows

### User Authentication Flow
1. User logs in via Firebase Authentication
2. Backend validates Firebase token
3. User session established

### Fi Money Connection Flow
1. User initiates Fi Money connection
2. System redirects to Fi-MCP authentication
3. User completes authentication
4. System receives and stores connection token
5. Financial data becomes available for insights

### Chat Interaction Flow
1. User sends message in chat interface
2. Backend processes message
3. If financial data is needed, system queries Fi-MCP
4. AI generates personalized response
5. Response displayed to user

## Technical Challenges & Solutions

### Firebase Service Account Integration
- **Challenge**: Service account file not found in production
- **Solution**: Updated Dockerfile to copy service account file to correct paths

### Fi-MCP Connection Performance
- **Challenge**: Slow connection initiation in production
- **Solution**: Implemented connection pooling and increased server resources

### Package Dependencies
- **Challenge**: npm ci failures due to package-lock.json inconsistencies
- **Solution**: Synchronized package-lock.json with package.json dependencies

## Future Enhancements
1. Implement more robust error handling for Fi-MCP connections
2. Add comprehensive testing suite
3. Enhance security by moving credentials to Secret Manager
4. Implement performance monitoring
5. Add more personalized financial insights features
