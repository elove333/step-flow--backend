"""Service for managing movement sessions."""
from typing import List, Optional, Dict, Any
from bson import ObjectId
from app.config.database import get_database
from app.models.session_model import SessionModel
from app.services.ai_service import ai_service


class SessionService:
    """Service for session data management and processing."""
    
    def __init__(self):
        self.collection_name = "sessions"
    
    def _get_collection(self):
        """Get the sessions collection."""
        db = get_database()
        if db is None:
            raise RuntimeError("Database connection is not available")
        return db[self.collection_name]
    
    async def create_session(
        self,
        user_id: str,
        session_type: str,
        duration: float,
        movement_data: List[Dict[str, Any]],
        metadata: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Create a new movement session.
        
        Args:
            user_id: User identifier
            session_type: Type of movement session
            duration: Session duration in seconds
            movement_data: List of movement data points
            metadata: Optional metadata
        
        Returns:
            Created session document
        """
        collection = self._get_collection()
        
        # Create session document
        session_doc = SessionModel.create_session(
            user_id=user_id,
            session_type=session_type,
            duration=duration,
            movement_data=movement_data,
            metadata=metadata
        )
        
        # Insert into database
        result = await collection.insert_one(session_doc)
        session_doc["_id"] = result.inserted_id
        
        # Forward to AI engine asynchronously (fire and forget)
        session_id = str(result.inserted_id)
        try:
            # Trigger AI analysis
            await self._trigger_ai_analysis(
                session_id=session_id,
                user_id=user_id,
                session_type=session_type,
                duration=duration,
                movement_data=movement_data
            )
        except Exception as e:
            print(f"Failed to trigger AI analysis: {e}")
            # Continue even if AI analysis fails
        
        return SessionModel.serialize_session(session_doc)
    
    async def _trigger_ai_analysis(
        self,
        session_id: str,
        user_id: str,
        session_type: str,
        duration: float,
        movement_data: List[Dict[str, Any]]
    ):
        """Trigger AI analysis for a session."""
        collection = self._get_collection()
        
        # Update status to processing
        await collection.update_one(
            {"_id": ObjectId(session_id)},
            SessionModel.update_session_status(session_id, "processing")
        )
        
        # Call AI service
        try:
            ai_result = await ai_service.analyze_session(
                session_id=session_id,
                user_id=user_id,
                session_type=session_type,
                duration=duration,
                movement_data=movement_data
            )
            
            # Store AI analysis results
            await collection.update_one(
                {"_id": ObjectId(session_id)},
                SessionModel.update_session_ai_analysis(session_id, ai_result)
            )
        except Exception as e:
            print(f"AI analysis failed for session {session_id}: {e}")
            # Update status to failed
            await collection.update_one(
                {"_id": ObjectId(session_id)},
                SessionModel.update_session_status(session_id, "failed")
            )
    
    async def get_session(self, session_id: str) -> Optional[Dict[str, Any]]:
        """
        Get a session by ID.
        
        Args:
            session_id: Session identifier
        
        Returns:
            Session document or None if not found
        """
        collection = self._get_collection()
        
        try:
            session = await collection.find_one({"_id": ObjectId(session_id)})
            return SessionModel.serialize_session(session)
        except Exception as e:
            print(f"Failed to get session {session_id}: {e}")
            return None
    
    async def get_user_sessions(
        self,
        user_id: str,
        page: int = 1,
        page_size: int = 20
    ) -> Dict[str, Any]:
        """
        Get all sessions for a user with pagination.
        
        Args:
            user_id: User identifier
            page: Page number (1-indexed)
            page_size: Number of items per page
        
        Returns:
            Dictionary with sessions list and pagination info
        """
        collection = self._get_collection()
        
        # Calculate skip value
        skip = (page - 1) * page_size
        
        # Get total count
        total = await collection.count_documents({"user_id": user_id})
        
        # Get paginated sessions
        cursor = collection.find({"user_id": user_id}).sort("created_at", -1).skip(skip).limit(page_size)
        sessions = await cursor.to_list(length=page_size)
        
        # Serialize sessions
        serialized_sessions = [SessionModel.serialize_session(s) for s in sessions]
        
        return {
            "sessions": serialized_sessions,
            "total": total,
            "page": page,
            "page_size": page_size
        }


# Singleton instance
session_service = SessionService()
