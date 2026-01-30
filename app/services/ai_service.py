"""Service for communicating with AI engine."""
import httpx
from typing import Dict, Any
from app.config.settings import settings
from app.schemas.session_schemas import AIAnalysisRequest, AIAnalysisResponse


class AIEngineService:
    """Service for forwarding session data to AI engine for analysis."""
    
    def __init__(self):
        self.base_url = settings.ai_engine_url
        self.timeout = settings.ai_engine_timeout
    
    async def analyze_session(
        self,
        session_id: str,
        user_id: str,
        session_type: str,
        duration: float,
        movement_data: list
    ) -> Dict[str, Any]:
        """
        Forward session data to AI engine for analysis.
        
        Args:
            session_id: Unique session identifier
            user_id: User identifier
            session_type: Type of movement session
            duration: Session duration in seconds
            movement_data: List of movement data points
        
        Returns:
            AI analysis results
        
        Raises:
            httpx.HTTPError: If AI engine request fails
        """
        request_data = {
            "session_id": session_id,
            "user_id": user_id,
            "session_type": session_type,
            "duration": duration,
            "movement_data": movement_data
        }
        
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(
                    f"{self.base_url}/api/analyze",
                    json=request_data
                )
                response.raise_for_status()
                return response.json()
        except httpx.HTTPError as e:
            print(f"AI Engine request failed: {e}")
            # Return mock analysis if AI engine is unavailable
            return self._mock_analysis(session_id)
    
    def _mock_analysis(self, session_id: str) -> Dict[str, Any]:
        """
        Return mock analysis when AI engine is unavailable.
        This ensures the system continues to function.
        """
        return {
            "session_id": session_id,
            "analysis": {
                "status": "ai_engine_unavailable",
                "message": "Analysis pending - AI engine currently unavailable",
                "quality_score": None,
                "pattern": None,
                "recommendations": []
            },
            "confidence": 0.0,
            "processing_time": 0.0
        }
    
    async def get_analysis_status(self, session_id: str) -> Dict[str, Any]:
        """
        Check the status of an AI analysis.
        
        Args:
            session_id: Unique session identifier
        
        Returns:
            Analysis status information
        """
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(
                    f"{self.base_url}/api/analysis/{session_id}"
                )
                response.raise_for_status()
                return response.json()
        except httpx.HTTPError as e:
            print(f"Failed to get analysis status: {e}")
            return {"status": "unknown", "error": str(e)}


# Singleton instance
ai_service = AIEngineService()
