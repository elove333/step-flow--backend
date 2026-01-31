#!/bin/bash
# Start the Step-Flow FastAPI Backend

echo "Starting Step-Flow Backend API..."
python3 -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
