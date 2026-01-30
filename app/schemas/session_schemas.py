"""Pydantic schemas for movement session data validation."""
from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, validator


class MovementData(BaseModel):
    """Individual movement data point."""
    timestamp: float = Field(..., description="Unix timestamp of the movement data point")
    x: float = Field(..., description="X-axis acceleration/position")
    y: float = Field(..., description="Y-axis acceleration/position")
    z: float = Field(..., description="Z-axis acceleration/position")
    
    class Config:
        json_schema_extra = {
            "example": {
                "timestamp": 1706659200.123,
                "x": 0.5,
                "y": 0.3,
                "z": 0.8
            }
        }


class SessionCreate(BaseModel):
    """Schema for creating a new movement session."""
    user_id: str = Field(..., description="User identifier", min_length=1, max_length=100)
    session_type: str = Field(..., description="Type of movement session (walk, run, jump, etc.)", min_length=1, max_length=50)
    duration: float = Field(..., description="Session duration in seconds", gt=0)
    movement_data: List[MovementData] = Field(..., description="List of movement data points", min_length=1)
    metadata: Optional[Dict[str, Any]] = Field(default=None, description="Additional metadata")
    
    @validator('movement_data')
    def validate_movement_data(cls, v):
        """Validate movement data list is not empty."""
        if not v:
            raise ValueError("movement_data cannot be empty")
        return v
    
    class Config:
        json_schema_extra = {
            "example": {
                "user_id": "user_12345",
                "session_type": "walking",
                "duration": 120.5,
                "movement_data": [
                    {
                        "timestamp": 1706659200.123,
                        "x": 0.5,
                        "y": 0.3,
                        "z": 0.8
                    },
                    {
                        "timestamp": 1706659201.123,
                        "x": 0.6,
                        "y": 0.4,
                        "z": 0.9
                    }
                ],
                "metadata": {
                    "device": "iPhone 13",
                    "app_version": "1.0.0"
                }
            }
        }


class SessionResponse(BaseModel):
    """Schema for session response."""
    session_id: str = Field(..., description="Unique session identifier")
    user_id: str
    session_type: str
    duration: float
    status: str = Field(..., description="Processing status (pending, processing, completed, failed)")
    created_at: datetime
    ai_analysis: Optional[Dict[str, Any]] = Field(default=None, description="AI analysis results")
    
    class Config:
        json_schema_extra = {
            "example": {
                "session_id": "session_abc123",
                "user_id": "user_12345",
                "session_type": "walking",
                "duration": 120.5,
                "status": "pending",
                "created_at": "2026-01-30T00:00:00Z",
                "ai_analysis": None
            }
        }


class SessionList(BaseModel):
    """Schema for paginated session list."""
    sessions: List[SessionResponse]
    total: int
    page: int
    page_size: int
    
    class Config:
        json_schema_extra = {
            "example": {
                "sessions": [],
                "total": 0,
                "page": 1,
                "page_size": 20
            }
        }


class AIAnalysisRequest(BaseModel):
    """Schema for AI analysis request."""
    session_id: str
    user_id: str
    session_type: str
    duration: float
    movement_data: List[MovementData]
    
    class Config:
        json_schema_extra = {
            "example": {
                "session_id": "session_abc123",
                "user_id": "user_12345",
                "session_type": "walking",
                "duration": 120.5,
                "movement_data": []
            }
        }


class AIAnalysisResponse(BaseModel):
    """Schema for AI analysis response."""
    session_id: str
    analysis: Dict[str, Any]
    confidence: float = Field(..., ge=0, le=1, description="Confidence score between 0 and 1")
    processing_time: float = Field(..., description="Analysis processing time in seconds")
    
    class Config:
        json_schema_extra = {
            "example": {
                "session_id": "session_abc123",
                "analysis": {
                    "quality_score": 0.85,
                    "pattern": "normal_walking",
                    "recommendations": ["Increase step frequency"]
                },
                "confidence": 0.92,
                "processing_time": 1.23
            }
        }
