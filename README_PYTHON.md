# Step-Flow Backend API (Python/FastAPI)

The central service that connects the mobile app and the AI engine, ensuring that every movement session flows from capture to analysis to feedback. Built with **Python and FastAPI** to provide a clean, predictable, and scalable foundation for all server-side operations.

## Overview

Step-Flow Backend is responsible for:
- ✅ Receiving structured data from the mobile client
- ✅ Validating incoming data using Pydantic schemas
- ✅ Storing validated data in MongoDB
- ✅ Forwarding data to the AI module for analysis
- ✅ Maintaining consistent data format across the ecosystem

This keeps the entire Step-Flow ecosystem organized and prevents errors.

## Technology Stack

- **Framework**: FastAPI 0.109.1
- **Language**: Python 3.12+
- **Database**: MongoDB (via Motor async driver)
- **Validation**: Pydantic v2
- **HTTP Client**: httpx (for AI engine communication)
- **Server**: Uvicorn with auto-reload
- **Testing**: pytest with async support

## Prerequisites

- Python 3.12 or higher
- MongoDB 4.4 or higher (optional for local development)
- pip (Python package manager)

## Installation

### 1. Clone the repository
```bash
git clone https://github.com/elove333/step-flow--backend.git
cd step-flow--backend
```

### 2. Install Python dependencies
```bash
pip install -r requirements.txt
```

### 3. Configure environment variables
```bash
cp .env.example .env
```

Update the `.env` file with your configuration:
```env
# Python/FastAPI Configuration
PYTHON_PORT=8000
MONGODB_URI=mongodb://localhost:27017
DATABASE_NAME=stepflow
AI_ENGINE_URL=http://localhost:5000
AI_ENGINE_TIMEOUT=30
ALLOWED_ORIGINS=*
```

## Running the Application

### Development Mode
```bash
# Using the start script
./start.sh

# Or directly with uvicorn
python3 -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### Production Mode
```bash
python3 -m uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

The server will start on `http://localhost:8000`

## API Endpoints

### Core Endpoints

#### Health Check
```http
GET /health
```

**Response:**
```json
{
  "status": "ok",
  "message": "Step-Flow Backend API is running",
  "service": "step-flow-backend"
}
```

#### API Information
```http
GET /
```

**Response:**
```json
{
  "message": "Step-Flow Backend API",
  "version": "1.0.0",
  "description": "Central service for movement session analysis",
  "endpoints": {
    "health": "/health",
    "sessions": "/api/sessions",
    "docs": "/docs"
  }
}
```

### Session Management

#### Create Movement Session
```http
POST /api/sessions
Content-Type: application/json
```

**Request Body:**
```json
{
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
```

**Response (201 Created):**
```json
{
  "session_id": "65b8f4e1a2c3d4e5f6g7h8i9",
  "user_id": "user_12345",
  "session_type": "walking",
  "duration": 120.5,
  "status": "pending",
  "created_at": "2026-01-30T00:00:00.000000Z",
  "ai_analysis": null
}
```

**Data Flow:**
1. Mobile app sends movement data
2. Backend validates data structure
3. Backend stores in MongoDB with 'pending' status
4. Backend forwards to AI engine asynchronously
5. AI engine analyzes and returns results
6. Backend updates session with 'completed' status

#### Get Session by ID
```http
GET /api/sessions/{session_id}
```

**Response (200 OK):**
```json
{
  "session_id": "65b8f4e1a2c3d4e5f6g7h8i9",
  "user_id": "user_12345",
  "session_type": "walking",
  "duration": 120.5,
  "status": "completed",
  "created_at": "2026-01-30T00:00:00.000000Z",
  "ai_analysis": {
    "session_id": "65b8f4e1a2c3d4e5f6g7h8i9",
    "analysis": {
      "quality_score": 0.85,
      "pattern": "normal_walking",
      "recommendations": ["Increase step frequency"]
    },
    "confidence": 0.92,
    "processing_time": 1.23
  }
}
```

#### Get User Sessions (Paginated)
```http
GET /api/sessions?user_id={user_id}&page=1&page_size=20
```

**Query Parameters:**
- `user_id` (required): User identifier
- `page` (optional): Page number (default: 1)
- `page_size` (optional): Items per page (default: 20, max: 100)

**Response (200 OK):**
```json
{
  "sessions": [
    {
      "session_id": "...",
      "user_id": "user_12345",
      "session_type": "walking",
      "duration": 120.5,
      "status": "completed",
      "created_at": "2026-01-30T00:00:00.000000Z",
      "ai_analysis": {...}
    }
  ],
  "total": 42,
  "page": 1,
  "page_size": 20
}
```

### Interactive API Documentation

FastAPI provides automatic interactive API documentation:

- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

## Project Structure

```
step-flow--backend/
├── app/
│   ├── __init__.py
│   ├── config/
│   │   ├── __init__.py
│   │   ├── database.py          # MongoDB connection management
│   │   └── settings.py          # Application settings
│   ├── models/
│   │   ├── __init__.py
│   │   └── session_model.py     # Database models and serialization
│   ├── routes/
│   │   ├── __init__.py
│   │   └── session_routes.py    # API route handlers
│   ├── schemas/
│   │   ├── __init__.py
│   │   └── session_schemas.py   # Pydantic validation schemas
│   └── services/
│       ├── __init__.py
│       ├── ai_service.py         # AI engine communication
│       └── session_service.py    # Business logic for sessions
├── tests/
│   └── python/
│       ├── conftest.py           # pytest configuration
│       └── test_api.py           # API endpoint tests
├── main.py                       # FastAPI application entry point
├── requirements.txt              # Python dependencies
├── pytest.ini                    # pytest configuration
├── start.sh                      # Startup script
└── README_PYTHON.md             # This file
```

## Testing

Run the test suite:
```bash
# Run all tests
python3 -m pytest tests/python/ -v

# Run specific test file
python3 -m pytest tests/python/test_api.py -v

# Run with coverage
python3 -m pytest tests/python/ --cov=app --cov-report=html
```

The tests validate:
- ✅ API endpoint accessibility
- ✅ Request/response formats
- ✅ Data validation (Pydantic schemas)
- ✅ Error handling

## Data Validation

The API uses Pydantic v2 for comprehensive data validation:

### Movement Data Point
- `timestamp` (float): Unix timestamp - required
- `x` (float): X-axis value - required
- `y` (float): Y-axis value - required
- `z` (float): Z-axis value - required

### Session
- `user_id` (string): 1-100 characters - required
- `session_type` (string): 1-50 characters - required
- `duration` (float): Must be > 0 - required
- `movement_data` (array): Must contain at least 1 data point - required
- `metadata` (object): Optional additional data

## Error Handling

The API returns standard HTTP status codes:

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `404` - Not Found
- `422` - Validation Error (Pydantic)
- `500` - Internal Server Error

Error responses follow this format:
```json
{
  "detail": "Error message or validation details"
}
```

## AI Engine Integration

The backend forwards validated session data to an AI engine for analysis:

1. **Asynchronous Processing**: AI analysis happens in the background
2. **Graceful Degradation**: If AI engine is unavailable, session is still stored
3. **Status Tracking**: Session status updates from `pending` → `processing` → `completed`/`failed`
4. **Mock Responses**: Returns mock analysis if AI engine is down

### AI Engine Configuration
```env
AI_ENGINE_URL=http://localhost:5000
AI_ENGINE_TIMEOUT=30
```

## Database

The backend uses MongoDB for persistent storage:

### Collections

#### sessions
Stores movement session data with the following structure:
```javascript
{
  "_id": ObjectId,
  "user_id": String,
  "session_type": String,
  "duration": Number,
  "movement_data": [
    {
      "timestamp": Number,
      "x": Number,
      "y": Number,
      "z": Number
    }
  ],
  "metadata": Object,
  "status": String,  // "pending", "processing", "completed", "failed"
  "created_at": Date,
  "updated_at": Date,
  "ai_analysis": Object  // null until analysis completes
}
```

## Deployment

### Using Docker (Recommended)
```dockerfile
FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Environment Variables for Production
```env
PYTHON_PORT=8000
MONGODB_URI=mongodb://mongodb:27017
DATABASE_NAME=stepflow
AI_ENGINE_URL=http://ai-engine:5000
AI_ENGINE_TIMEOUT=30
ALLOWED_ORIGINS=https://yourdomain.com
```

## Security Considerations

- ✅ CORS configuration via environment variables
- ✅ Input validation using Pydantic
- ✅ Database connection timeout handling
- ✅ Graceful error handling for external services
- 🔜 Rate limiting (recommended for production)
- 🔜 Authentication/Authorization (recommended for production)
- 🔜 HTTPS/TLS (required for production)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Write tests for your changes
4. Ensure all tests pass (`pytest tests/python/`)
5. Commit your changes (`git commit -m 'Add some amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## License

This project is licensed under the ISC License - see the LICENSE file for details.

## Support

For issues, questions, or contributions, please open an issue on GitHub.
