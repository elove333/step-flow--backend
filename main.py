"""
Step-Flow Backend API
Central service connecting mobile app and AI engine for movement session analysis.
"""
import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from app.config.database import connect_db, close_db_connection
from app.routes import session_routes

load_dotenv()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Handle startup and shutdown events."""
    # Startup
    await connect_db()
    yield
    # Shutdown
    await close_db_connection()


app = FastAPI(
    title="Step-Flow Backend API",
    description="Central service for movement session data flow from mobile app to AI engine",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("ALLOWED_ORIGINS", "*").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(session_routes.router, prefix="/api", tags=["sessions"])


@app.get("/")
async def root():
    """Root endpoint with API information."""
    return {
        "message": "Step-Flow Backend API",
        "version": "1.0.0",
        "description": "Central service for movement session analysis",
        "endpoints": {
            "health": "/health",
            "sessions": "/api/sessions",
            "docs": "/docs"
        }
    }


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "ok",
        "message": "Step-Flow Backend API is running",
        "service": "step-flow-backend"
    }


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
