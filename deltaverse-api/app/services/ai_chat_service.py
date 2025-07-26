"""AI-powered chat service for financial advice."""

class AIFinancialChatService:
    """AI-powered financial chat service."""
    
    def __init__(self):
        self.financial_keywords = [
            "portfolio", "investment", "net worth", "balance", "mutual fund",
            "sip", "stock", "loan", "debt", "savings", "expense", "income"
        ]
    
    def is_financial_query(self, message: str) -> bool:
        """Check if message contains financial keywords."""
        message_lower = message.lower()
        return any(keyword in message_lower for keyword in self.financial_keywords)
    
    def is_personal_financial_query(self, message: str) -> bool:
        """Check if message is asking for personal financial data."""
        personal_keywords = [
            "my portfolio", "my investment", "my net worth", "my balance", 
            "my mutual fund", "my sip", "my stock", "my loan", "my debt", 
            "my savings", "my expense", "my income"
        ]
        message_lower = message.lower()
        return any(keyword in message_lower for keyword in personal_keywords)
    
    async def process_general_query(self, message: str, user_id: str = None) -> dict:
        """Process general financial queries."""
        return {
            "response": f"Here's what I know about: {message}",
            "requires_fi_auth": False,
            "conversation_id": "test_conv_123",
            "insights": ["This is a general response"],
            "timestamp": "2024-07-23T10:00:00Z"
        }
    
    async def generate_ai_response(self, message: str) -> str:
        """Generate AI response for a message."""
        return f"AI response to: {message}"
