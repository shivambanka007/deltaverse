# Deltaverse Architecture Diagram

## System Architecture

```mermaid
graph TD
    %% Client Layer
    Client[Web Browser - React UI + Redux]
    
    %% Hosting Layer
    Firebase[Firebase Hosting]
    
    %% Backend Services
    DeltaAPI[Cloud Run - Deltaverse API<br>FastAPI + Python]
    FiMCP[Cloud Run - Fi-MCP Mock Server<br>Go]
    Firestore[(Firestore Database)]
    SecretMgr[Secret Manager]
    
    %% Authentication
    FireAuth[Firebase Authentication]
    
    %% CI/CD
    BitbucketPipelines[Bitbucket Pipelines]
    GAR[Google Artifact Registry]
    CloudRunDeploy[Cloud Run Deployment]
    
    %% Connections
    Client -->|HTTPS| Firebase
    Firebase -->|HTTPS| DeltaAPI
    Client -->|API Calls| DeltaAPI
    DeltaAPI -->|Financial Data Requests| FiMCP
    DeltaAPI -->|Store/Retrieve Data| Firestore
    DeltaAPI -->|Authentication| FireAuth
    DeltaAPI -->|Access Secrets| SecretMgr
    
    %% CI/CD Flow
    BitbucketPipelines -->|Build & Push Images| GAR
    GAR -->|Deploy Images| CloudRunDeploy
    CloudRunDeploy -->|Deploy| DeltaAPI
    CloudRunDeploy -->|Deploy| FiMCP
    
    %% Styling
    classDef client fill:#f9f,stroke:#333,stroke-width:2px;
    classDef hosting fill:#bbf,stroke:#333,stroke-width:2px;
    classDef backend fill:#bfb,stroke:#333,stroke-width:2px;
    classDef database fill:#fbb,stroke:#333,stroke-width:2px;
    classDef auth fill:#fbf,stroke:#333,stroke-width:2px;
    classDef cicd fill:#bff,stroke:#333,stroke-width:2px;
    
    class Client client;
    class Firebase hosting;
    class DeltaAPI,FiMCP backend;
    class Firestore,SecretMgr database;
    class FireAuth auth;
    class BitbucketPipelines,GAR,CloudRunDeploy cicd;
```

## Architecture Components

### Frontend
- **Technology**: React + Redux
- **Hosting**: Firebase Hosting

### Backend API
- **Technology**: FastAPI + Python (UV package manager)
- **Deployment**: Google Cloud Run

### Fi-MCP Mock Server
- **Technology**: Go
- **Deployment**: Google Cloud Run

### Data Storage
- **Primary Database**: Firestore

### Authentication
- **System**: Firebase Authentication

### CI/CD Pipeline
- **Platform**: Bitbucket Pipelines
