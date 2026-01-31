"""Database models for movement sessions."""
from datetime import datetime
from typing import List, Optional, Dict, Any
from bson import ObjectId


class SessionModel:
    """Database model for movement session."""
    
    @staticmethod
    def create_session(
        user_id: str,
        session_type: str,
        duration: float,
        movement_data: List[Dict[str, Any]],
        metadata: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Create a session document for database insertion."""
        return {
            "user_id": user_id,
            "session_type": session_type,
            "duration": duration,
            "movement_data": movement_data,
            "metadata": metadata or {},
            "status": "pending",
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
            "ai_analysis": None
        }
    
    @staticmethod
    def serialize_session(session: Dict[str, Any]) -> Dict[str, Any]:
        """Serialize session document for API response."""
        if not session:
            return None
        
        session_copy = session.copy()
        if "_id" in session_copy:
            session_copy["session_id"] = str(session_copy.pop("_id"))
        
        # Convert datetime to ISO format string
        if "created_at" in session_copy and isinstance(session_copy["created_at"], datetime):
            session_copy["created_at"] = session_copy["created_at"].isoformat() + "Z"
        if "updated_at" in session_copy and isinstance(session_copy["updated_at"], datetime):
            session_copy["updated_at"] = session_copy["updated_at"].isoformat() + "Z"
        
        return session_copy
    
    @staticmethod
    def update_session_status(session_id: str, status: str) -> Dict[str, Any]:
        """Create update document for session status."""
        return {
            "$set": {
                "status": status,
                "updated_at": datetime.utcnow()
            }
        }
    
    @staticmethod
    def update_session_ai_analysis(
        session_id: str,
        ai_analysis: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Create update document for AI analysis results."""
        return {
            "$set": {
                "ai_analysis": ai_analysis,
                "status": "completed",
                "updated_at": datetime.utcnow()
            }
        }
