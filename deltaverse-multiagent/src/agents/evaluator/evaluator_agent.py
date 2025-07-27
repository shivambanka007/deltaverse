import os
import json
from typing import Dict, Any

# Assuming GeminiLLM is defined in orchestrator_agent.py or a common utility file
# For now, let's re-define a placeholder or import if it's in a common place
class GeminiLLM:
    def __init__(self):
        pass

    def generate_content(self, prompt: str) -> str:
        # Simulate LLM response for evaluation
        if "sufficiently answered" in prompt.lower():
            # In a real scenario, this would be a sophisticated evaluation based on query and results
            return json.dumps({"sufficient": True, "reason": "Mock evaluation: Query seems answered."})
        else:
            return "Mock LLM response for evaluation: " + prompt

class EvaluatorAgent:
    def __init__(self):
        self.llm = GeminiLLM() # Placeholder for actual Gemini LLM

    def evaluate_response(self, context: Dict[str, Any]) -> Dict[str, Any]:
        user_id = context.get("user_id")
        initial_query = context.get("initial_query")
        collated_results = context.get("collated_results", [])

        print(f"Evaluator received context for user {user_id}, query: {initial_query}")
        print(f"Collated results: {collated_results}")

        # Use LLM to evaluate if the initial query was sufficiently answered
        prompt_for_evaluation = (
            f"Given the initial user query: '{initial_query}' and the following collated results: "
            f"{json.dumps(collated_results)}. Was the initial query sufficiently answered? "
            "Respond with a JSON object like {\"sufficient\": true/false, \"reason\": \"...\"}"
        )
        llm_response = self.llm.generate_content(prompt_for_evaluation)

        try:
            evaluation_result = json.loads(llm_response)
        except json.JSONDecodeError:
            print(f"Error decoding LLM evaluation response: {llm_response}")
            evaluation_result = {"sufficient": False, "reason": "LLM response malformed."}

        if not evaluation_result.get("sufficient", False):
            print("Evaluation: Insufficient. Re-triggering Orchestrator.")
            # In a real system, this would publish a message back to the Orchestrator
            # to re-trigger with enriched context or new sub-queries.
            # For this example, we'll just return the decision.
            return {"status": "re_orchestrate", "reason": evaluation_result.get("reason", ""), "context": context}
        else:
            print("Evaluation: Sufficient. Aggregating final response.")
            return {"status": "complete", "reason": evaluation_result.get("reason", ""), "context": context}

    