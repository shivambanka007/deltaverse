# 🚀 Developer Quick Reference Card

## 🔄 Complete Flow Summary

```
User Login → Firebase Auth → JWT Token → Dashboard → Connect Fi → AI Chat
    ↓            ↓             ↓           ↓           ↓         ↓
  Secure      Validate      Protect     Show UI    Get Data   Smart
  Access      Identity      Routes      Elements   Context    Advice
```

## 📋 Checklist: What Happens When

### ✅ User Logs In
- [ ] Frontend sends credentials to Firebase
- [ ] Firebase validates and returns JWT token
- [ ] Token stored in localStorage/Redux
- [ ] User redirected to dashboard
- [ ] All subsequent API calls include JWT header

### ✅ User Connects Fi-MCP
- [ ] Backend generates unique session ID
- [ ] Fi-MCP server creates popup URL
- [ ] User authenticates in popup window
- [ ] Financial data retrieved from Fi-MCP
- [ ] Data stored in Firestore database
- [ ] Frontend updates connection status

### ✅ User Asks AI Question
- [ ] Frontend sends message + JWT to backend
- [ ] Backend validates JWT token
- [ ] Check if user has Fi-MCP data (Firestore + Fi-MCP server)
- [ ] Create appropriate prompt (with/without financial context)
- [ ] Send prompt to Vertex AI (Gemini)
- [ ] Format response with metadata
- [ ] Return to frontend for display

## 🔧 Key Code Locations

| Component | File Path | Purpose |
|-----------|-----------|---------|
| **Login** | `deltaverse-ui/src/pages/Login/Login.jsx` | User authentication UI |
| **Auth Hook** | `deltaverse-ui/src/hooks/useAuth.js` | Firebase auth logic |
| **Dashboard** | `deltaverse-ui/src/pages/Dashboard/Dashboard.jsx` | Main user interface |
| **Chat** | `deltaverse-ui/src/pages/Chat/Chat.jsx` | AI chat interface |
| **Fi Connect** | `deltaverse-ui/src/services/fiLoginPopup.js` | Fi-MCP connection |
| **Backend Main** | `deltaverse-api/app/main.py` | API endpoints |
| **Chat Service** | `deltaverse-api/app/services/intelligent_chat_service.py` | AI processing |
| **Fi-MCP Server** | `fi-mcp-dev-master/main.go` | Mock financial data |

## 🌐 API Endpoints Quick Reference

```bash
# Authentication (handled by Firebase)
POST /login                    # User login
POST /logout                   # User logout

# Fi-MCP Integration
POST /api/v1/fi/initiate-login      # Start Fi connection
POST /api/v1/fi/complete-login      # Complete Fi connection
GET  /api/v1/fi/status              # Check Fi connection status

# AI Chat
POST /api/v1/chat/message           # Send chat message
GET  /api/v1/chat/insights          # Get financial insights
GET  /api/v1/chat/suggestions       # Get query suggestions

# Data & Health Score
GET  /api/v1/mcp/summary            # Financial summary
POST /api/v1/financial-health/score # Health score calculation
```

## 🔍 Environment Variables

```bash
# Frontend (.env)
REACT_APP_API_URL=http://localhost:8002
REACT_APP_FI_MCP_URL=http://localhost:8080
REACT_APP_FIREBASE_API_KEY=your_key
REACT_APP_FIREBASE_PROJECT_ID=your_project

# Backend (.env)
FIREBASE_PROJECT_ID=your_project
FI_MCP_SERVER_URL=http://localhost:8080
VERTEX_AI_PROJECT_ID=your_gcp_project
GEMINI_MODEL_NAME=gemini-2.0-flash-exp
```

## 🐛 Common Issues & Solutions

| Issue | Symptoms | Solution |
|-------|----------|----------|
| **JWT Invalid** | 401 Unauthorized | Re-login to get fresh token |
| **Fi-MCP Not Connected** | `status: "not_connected"` | Start Fi-MCP server on port 8080 |
| **AI Generic Responses** | No personalized advice | Check Fi-MCP data in Firestore |
| **CORS Errors** | Network requests blocked | Check backend CORS settings |
| **Popup Blocked** | Fi connection fails | Allow popups for localhost |

## 🧪 Testing Commands

```bash
# Start all services
cd fi-mcp-dev-master && FI_MCP_PORT=8080 go run . &
cd deltaverse-api && uvicorn app.main:app --reload --port 8002 &
cd deltaverse-ui && npm start &

# Test Fi-MCP server
curl http://localhost:8080/health

# Test backend health
curl http://localhost:8002/health

# Test chat endpoint (replace JWT_TOKEN)
curl -X POST http://localhost:8002/api/v1/chat/message \
  -H "Authorization: Bearer JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message": "What is my net worth?", "user_id": "test"}'
```

## 📊 Data Structures

### JWT Token Payload
```json
{
  "user_id": "firebase_user_123",
  "email": "user@example.com",
  "exp": 1640995200
}
```

### Fi-MCP Financial Data
```json
{
  "user_id": "firebase_user_123",
  "sync_status": "success",
  "portfolio": {
    "total_value": 450000,
    "sip_amount": 15000,
    "accounts": [...]
  },
  "net_worth": {
    "total_assets": 450000,
    "total_liabilities": 50000
  }
}
```

### AI Chat Response
```json
{
  "message": "Based on your portfolio...",
  "mcp_integration": {
    "status": "connected",
    "has_financial_data": true
  },
  "insights": ["Personalized advice", "4 accounts connected"]
}
```

## 🎯 Development Workflow

1. **Setup**: Start all three services (Fi-MCP, Backend, Frontend)
2. **Login**: Use test credentials to get JWT token
3. **Connect Fi**: Click "Connect Fi Money" → Select test scenario
4. **Test Chat**: Ask personal financial questions
5. **Debug**: Check browser console and server logs
6. **Verify**: Ensure `mcp_integration.status` is "connected"

## 🔐 Security Notes

- **Never commit**: Firebase keys, JWT secrets, API keys
- **Always validate**: JWT tokens on backend
- **Use HTTPS**: In production environments
- **Sanitize inputs**: Before sending to AI
- **Rate limiting**: Implement for API endpoints

## 🚀 Deployment Checklist

- [ ] Environment variables configured
- [ ] Firebase project setup
- [ ] GCP Vertex AI enabled
- [ ] Fi-MCP server deployed
- [ ] CORS configured for production domain
- [ ] SSL certificates installed
- [ ] Database backups configured

---

**💡 Remember**: This is a complex system with multiple moving parts. Test each component individually before testing the complete flow!
