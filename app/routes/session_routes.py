"""API routes for movement session management."""
from typing import Optional
from fastapi import APIRouter, HTTPException, status, Query
from app.schemas.session_schemas import (
    SessionCreate,
    SessionResponse,
    SessionList
)
from app.services.session_service import session_service


router = APIRouter()


@router.post(
    "/sessions",
    response_model=SessionResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new movement session",
    description="""
    Receive movement session data from mobile app, validate it, store it in database,
    and forward it to the AI engine for analysis.
    """
)
async def create_session(session: SessionCreate):
    """
    Create a new movement session.
    
    The data flow is:
    1. Validate incoming data structure
    2. Store in database with 'pending' status
    3. Forward to AI engine for analysis
    4. Return session ID to mobile app
    
    The AI analysis happens asynchronously.
    """
    try:
        # Convert movement data to dict format
        movement_data_dicts = [m.model_dump() for m in session.movement_data]
        
        # Create session
        created_session = await session_service.create_session(
            user_id=session.user_id,
            session_type=session.session_type,
            duration=session.duration,
            movement_data=movement_data_dicts,
            metadata=session.metadata
        )
        
        return created_session
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create session: {str(e)}"
        )


@router.get(
    "/sessions/{session_id}",
    response_model=SessionResponse,
    summary="Get a specific session",
    description="Retrieve a movement session by its ID, including AI analysis results if available."
)
async def get_session(session_id: str):
    """Get a session by ID."""
    session = await session_service.get_session(session_id)
    
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Session {session_id} not found"
        )
    
    return session


@router.get(
    "/sessions",
    response_model=SessionList,
    summary="Get user sessions",
    description="Retrieve all movement sessions for a specific user with pagination."
)
async def get_user_sessions(
    user_id: str = Query(..., description="User ID to filter sessions"),
    page: int = Query(1, ge=1, description="Page number (1-indexed)"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page")
):
    """Get all sessions for a user."""
    try:
        result = await session_service.get_user_sessions(
            user_id=user_id,
            page=page,
            page_size=page_size
        )
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve sessions: {str(e)}"
        )
