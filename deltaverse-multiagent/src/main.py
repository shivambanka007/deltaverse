import os
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from dotenv import load_dotenv
from src.common.utils import setup_gcp_service_account
from src.agents.orchestrator.orchestrator_agent import OrchestratorAgent
from src.agents.evaluator.evaluator_agent import EvaluatorAgent
from src.agents.task_agents.fi_mcp_agent import FiMcpAgent
from src.agents.task_agents.yahoo_mcp_agent import YahooMcpAgent
from src.agents.task_agents.mospi_api_agent import MospiApiAgent
from src.agents.task_agents.mint_mcp_agent import MintMcpAgent
from src.agents.task_agents.ynab_mcp_agent import YnabMcpAgent
from src.agents.task_agents.zerodha_coin_mcp_agent import ZerodhaCoinMcpAgent
from src.agents.task_agents.elevenlabs_api_agent import ElevenlabsApiAgent

# Load environment variables from .env file
load_dotenv()

# Set up GCP service account credentials
setup_gcp_service_account()

app = FastAPI(
    title="Deltaverse Multi-Agent Financial Insights",
    description="An AI-powered multi-agent system for personalized financial insights.",
    version="0.1.0",
)

# --- Configuration ---
# GCP Project ID and Pub/Sub topic prefix should be set as environment variables
GCP_PROJECT_ID = os.getenv("GCP_PROJECT_ID", "opportune-scope-466406-p6")
PUBSUB_TOPIC_PREFIX = os.getenv("PUBSUB_TOPIC_PREFIX", "deltaverse-financial-insights")
print(f"Using Pub/Sub Topic Prefix: {PUBSUB_TOPIC_PREFIX}")

# Agent configuration - eliminates duplication
AGENT_CONFIGS = {
    "fi_mcp_agent": {"class": FiMcpAgent, "port": 8001},
    "yahoo_mcp_agent": {"class": YahooMcpAgent, "port": 8002},
    "mospi_api_agent": {"class": MospiApiAgent, "port": 8003},
    "mint_mcp_agent": {"class": MintMcpAgent, "port": 8004},
    "ynab_mcp_agent": {"class": YnabMcpAgent, "port": 8005},
    "zerodha_coin_mcp_agent": {"class": ZerodhaCoinMcpAgent, "port": 8006},
    "elevenlabs_api_agent": {"class": ElevenlabsApiAgent, "port": 8007},
}

# Initialize agents dynamically
TASK_AGENTS = {}
for agent_name, config in AGENT_CONFIGS.items():
    url_key = f"{agent_name.upper().replace('_AGENT', '')}_SERVER_URL"
    enable_key = f"ENABLE_{agent_name.upper().replace('_AGENT', '')}"
    
    server_url = os.getenv(url_key, f"http://localhost:{config['port']}")
    is_enabled = os.getenv(enable_key, "true").lower() == "true"
    
    TASK_AGENTS[agent_name] = config["class"](server_url, enable_mcp=is_enabled)
    print(f"{agent_name.replace('_', ' ').title()} Enabled: {is_enabled}")

# Initialize Agents
orchestrator_agent = OrchestratorAgent(TASK_AGENTS)
evaluator_agent = EvaluatorAgent()

class QueryRequest(BaseModel):
    user_id: str
    query: str

class QueryResponse(BaseModel):
    user_id: str
    response: str
    
@app.get("/")
async def root():
    return {"message": "Welcome to the Deltaverse Multi-Agent Financial Insights API!"}

@app.post("/query", response_model=QueryResponse)
async def process_query(request: QueryRequest):
    """
    Processes a natural language financial query from the user.
    """
    user_id = request.user_id
    user_query = request.query

    print(f"Main API received query: {user_query} for user {user_id}")

    # Step 1: Orchestrator processes the initial query
    orchestration_status = orchestrator_agent.process_user_query(user_id, user_query)
    
    # The orchestrator now directly calls task agents and collects results
    # Update Orchestrator's memory with collated results for evaluation
    # This is already handled within the orchestrator_agent.process_user_query method

    # Step 2: Evaluator assesses the collated results
    evaluation_context = {
        "user_id": user_id,
        "initial_query": user_query,
        "collated_results": orchestrator_agent.workflow_memory["sub_query_results"]
    }
    evaluation_outcome = evaluator_agent.evaluate_response(evaluation_context)

    final_response_message = ""
    if evaluation_outcome["status"] == "complete":
        final_response_message = orchestrator_agent.aggregate_final_response()
    elif evaluation_outcome["status"] == "re_orchestrate":
        final_response_message = (
            f"Further processing needed: {evaluation_outcome['reason']}. "
            "Orchestrator would re-trigger workflow with enriched context."
        )
        # In a real system, the Orchestrator would be re-invoked here with the new context
        # For this example, we'll just indicate the need for re-orchestration.
    else:
        final_response_message = "An unexpected error occurred during evaluation."

    return QueryResponse(user_id=user_id, response=final_response_message)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)