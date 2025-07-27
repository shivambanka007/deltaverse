from typing import Dict, Any

MOCK_FI_MCP_RESPONSE: Dict[str, Any] = {
    "jsonrpc": "2.0",
    "id": 1,
    "result": {
        "content": [{
            "type": "text",
            "text": "{\"status\": \"success\", \"data\": {\"transactions\": [{\"date\": \"2023-01-01\", \"description\": \"Mock Coffee Shop\", \"amount\": -50.0}, {\"date\": \"2023-01-02\", \"description\": \"Mock Salary\", \"amount\": 2000.0}]}}"
        }]
    }
}

MOCK_YAHOO_MCP_RESPONSE: Dict[str, Any] = {
    "status": "success",
    "data": {"ticker": "MOCK", "price": 123.45}
}

MOCK_MOSPI_API_RESPONSE: Dict[str, Any] = {
    "status": "success",
    "data": {"indicator": "MOCK_GDP_GROWTH", "year": 2023, "value": 6.8, "unit": "%"}
}

MOCK_MINT_MCP_RESPONSE: Dict[str, Any] = {
    "status": "success",
    "data": {
        "Checking": 1500.75,
        "Savings": 5000.00,
        "Credit Card": -1200.50,
        "Investments": 10000.00,
        "message": "This is mock data from the conceptual MintMcpAgent."
    }
}

MOCK_YNAB_LIST_BUDGETS_RESPONSE: Dict[str, Any] = {
    "status": "success",
    "data": {
        "data": {
            "budgets": [
                {"id": "mock-budget-1", "name": "Mock Personal Budget"},
                {"id": "mock-budget-2", "name": "Mock Joint Household Budget"}
            ]
        }
    }
}

MOCK_YNAB_TRANSACTIONS_RESPONSE: Dict[str, Any] = {
    "status": "success",
    "data": {
        "data": {
            "transactions": [
                {"id": "mock-txn-1", "date": "2023-07-20", "amount": -15000, "memo": "Mock Rent"},
                {"id": "mock-txn-2", "date": "2023-07-22", "amount": 50000, "memo": "Mock Paycheck"}
            ]
        }
    }
}

MOCK_ZERODHA_PROFILE_RESPONSE: Dict[str, Any] = {
    "status": "success",
    "data": {
        "user_id": "MOCK1234",
        "user_name": "Mock Zerodha User",
        "email": "mock.zerodha@example.com",
        "broker": "MOCK_ZERODHA"
    }
}

MOCK_ELEVENLABS_AUDIO_RESPONSE: Dict[str, Any] = {
    "status": "success",
    "audio_data": b"Mock audio data for ElevenLabs text-to-speech."
}
