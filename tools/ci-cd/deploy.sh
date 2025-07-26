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

# Check environment argument
ENVIRONMENT=$1
if [[ ! $ENVIRONMENT =~ ^(staging|production)$ ]]; then
    print_status "$RED" "Error: Environment must be 'staging' or 'production'"
    exit 1
fi

# Load environment variables
source config/${ENVIRONMENT}/api.env
source config/${ENVIRONMENT}/ui.env
source config/${ENVIRONMENT}/fi-mcp.env

# Verify required variables
required_vars=(
    "GCP_PROJECT_ID"
    "CLOUD_RUN_REGION"
    "FIREBASE_PROJECT_ID"
)

for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        print_status "$RED" "Error: $var is not set"
        exit 1
    fi
done

# Deploy Fi-MCP Server
print_status "$YELLOW" "🚀 Deploying Fi-MCP Server..."
cd fi-mcp-dev-master
./deploy-fi-mcp.sh $GCP_PROJECT_ID $CLOUD_RUN_REGION
FI_MCP_URL=$(gcloud run services describe fi-mcp-server --region=$CLOUD_RUN_REGION --format='value(status.url)')
cd ..

# Deploy Backend API
print_status "$YELLOW" "🚀 Deploying Backend API..."
cd deltaverse-api
docker build -t gcr.io/${GCP_PROJECT_ID}/api:${VERSION:-latest} .
docker push gcr.io/${GCP_PROJECT_ID}/api:${VERSION:-latest}

gcloud run deploy api \
    --image gcr.io/${GCP_PROJECT_ID}/api:${VERSION:-latest} \
    --platform managed \
    --region $CLOUD_RUN_REGION \
    --memory 2Gi \
    --cpu 2 \
    --min-instances 2 \
    --max-instances 10 \
    --set-env-vars="FI_MCP_URL=${FI_MCP_URL}"

API_URL=$(gcloud run services describe api --region=$CLOUD_RUN_REGION --format='value(status.url)')
cd ..

# Deploy Frontend
print_status "$YELLOW" "🚀 Deploying Frontend..."
cd deltaverse-ui
npm ci
REACT_APP_API_URL=$API_URL npm run build
firebase use $FIREBASE_PROJECT_ID
firebase deploy --only hosting

# Verify Deployment
print_status "$YELLOW" "🔍 Verifying deployment..."

# Check Fi-MCP health
if curl -s -f "${FI_MCP_URL}/health" > /dev/null; then
    print_status "$GREEN" "✅ Fi-MCP Server is healthy"
else
    print_status "$RED" "❌ Fi-MCP Server health check failed"
    exit 1
fi

# Check API health
if curl -s -f "${API_URL}/health" > /dev/null; then
    print_status "$GREEN" "✅ Backend API is healthy"
else
    print_status "$RED" "❌ Backend API health check failed"
    exit 1
fi

# Print deployment info
print_status "$GREEN" "✅ Deployment completed successfully!"
echo "Fi-MCP URL: ${FI_MCP_URL}"
echo "API URL: ${API_URL}"
echo "Frontend URL: https://${FIREBASE_PROJECT_ID}.web.app"

# Send deployment notification
if [ -n "$SLACK_WEBHOOK_URL" ]; then
    curl -X POST -H 'Content-type: application/json' \
        --data "{\"text\":\"🚀 Deployment to ${ENVIRONMENT} completed successfully!\\n- Fi-MCP: ${FI_MCP_URL}\\n- API: ${API_URL}\\n- Frontend: https://${FIREBASE_PROJECT_ID}.web.app\"}" \
        $SLACK_WEBHOOK_URL
fi
