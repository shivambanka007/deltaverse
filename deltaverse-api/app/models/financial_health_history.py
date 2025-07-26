from pydantic import BaseModel
from typing import Dict, List, Optional
from datetime import datetime
import json
import os
import asyncio
from pathlib import Path

class FinancialHealthHistory(BaseModel):
    """Model for storing financial health score history"""
    user_id: str
    phone_number: str
    overall_score: float
    components: List[Dict]
    recommendations: List[Dict]
    raw_financial_data: Dict
    calculated_at: datetime
    fi_mcp_session_id: Optional[str] = None

class FinancialHealthDatabase:
    """Simple file-based database for storing financial health data"""
    
    def __init__(self, data_dir: str = "data/financial_health"):
        self.data_dir = Path(data_dir)
        self.data_dir.mkdir(parents=True, exist_ok=True)
        self.lock = asyncio.Lock()
    
    def _get_user_file_path(self, user_id: str) -> Path:
        """Get file path for user's financial health data"""
        return self.data_dir / f"{user_id}.json"
    
    async def save_health_score(self, health_history: FinancialHealthHistory) -> bool:
        """Save financial health score to database"""
        async with self.lock:
            try:
                user_file = self._get_user_file_path(health_history.user_id)
                
                # Load existing data
                existing_data = []
                if user_file.exists():
                    with open(user_file, 'r') as f:
                        existing_data = json.load(f)
                
                # Add new entry
                new_entry = {
                    "user_id": health_history.user_id,
                    "phone_number": health_history.phone_number,
                    "overall_score": health_history.overall_score,
                    "components": health_history.components,
                    "recommendations": health_history.recommendations,
                    "raw_financial_data": health_history.raw_financial_data,
                    "calculated_at": health_history.calculated_at.isoformat(),
                    "fi_mcp_session_id": health_history.fi_mcp_session_id
                }
                
                existing_data.append(new_entry)
                
                # Keep only last 100 entries per user
                if len(existing_data) > 100:
                    existing_data = existing_data[-100:]
                
                # Save to file
                with open(user_file, 'w') as f:
                    json.dump(existing_data, f, indent=2)
                
                return True
            except Exception as e:
                print(f"Error saving health score: {str(e)}")
                return False
    
    async def get_user_history(self, user_id: str, limit: int = 30) -> List[FinancialHealthHistory]:
        """Get user's financial health history"""
        async with self.lock:
            try:
                user_file = self._get_user_file_path(user_id)
                
                if not user_file.exists():
                    return []
                
                with open(user_file, 'r') as f:
                    data = json.load(f)
                
                # Return latest entries
                recent_data = data[-limit:] if len(data) > limit else data
                
                history = []
                for entry in recent_data:
                    history.append(FinancialHealthHistory(
                        user_id=entry["user_id"],
                        phone_number=entry["phone_number"],
                        overall_score=entry["overall_score"],
                        components=entry["components"],
                        recommendations=entry["recommendations"],
                        raw_financial_data=entry["raw_financial_data"],
                        calculated_at=datetime.fromisoformat(entry["calculated_at"]),
                        fi_mcp_session_id=entry.get("fi_mcp_session_id")
                    ))
                
                return history
            except Exception as e:
                print(f"Error getting user history: {str(e)}")
                return []
    
    async def get_historical_scores(self, user_id: str, days: int = 90) -> Dict[str, float]:
        """Get historical scores for chart display"""
        try:
            history = await self.get_user_history(user_id, limit=days)
            
            historical_scores = {}
            for entry in history:
                date_key = entry.calculated_at.strftime('%Y-%m-%d')
                historical_scores[date_key] = entry.overall_score
            
            return historical_scores
        except Exception as e:
            print(f"Error getting historical scores: {str(e)}")
            return {}
    
    async def get_latest_score(self, user_id: str) -> Optional[FinancialHealthHistory]:
        """Get user's latest financial health score"""
        history = await self.get_user_history(user_id, limit=1)
        return history[0] if history else None
    
    async def delete_user_data(self, user_id: str) -> bool:
        """Delete all data for a user"""
        async with self.lock:
            try:
                user_file = self._get_user_file_path(user_id)
                if user_file.exists():
                    user_file.unlink()
                return True
            except Exception as e:
                print(f"Error deleting user data: {str(e)}")
                return False

# Global database instance
financial_health_db = FinancialHealthDatabase()
