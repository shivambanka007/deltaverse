from pydantic import BaseModel
from typing import List, Optional, Dict

class ScoreComponent(BaseModel):
    name: str
    score: float  # 0-100
    weight: float  # Weight in overall score calculation
    description: str
    status: str  # "excellent", "good", "fair", "poor", "critical"
    data_points: Dict  # Relevant metrics used in calculation

class Recommendation(BaseModel):
    title: str
    description: str
    impact: str  # "high", "medium", "low"
    difficulty: str  # "easy", "moderate", "challenging"
    potential_improvement: float  # Potential score improvement
    action_steps: List[str]
    category: str  # Component this recommendation relates to

class FinancialHealthScore(BaseModel):
    overall_score: float  # 0-100
    components: List[ScoreComponent]
    recommendations: List[Recommendation]
    last_updated: str  # ISO timestamp
    historical_scores: Optional[Dict[str, float]]  # Date -> score mapping
