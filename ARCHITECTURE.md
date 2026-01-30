# Step-Flow Backend Architecture

## System Overview

```
┌─────────────────┐         ┌──────────────────────┐         ┌──────────────┐
│                 │  HTTP   │                      │  HTTP   │              │
│  Mobile App     ├────────►│  FastAPI Backend     ├────────►│  AI Engine   │
│  (iOS/Android)  │         │  (Python)            │         │  (Analysis)  │
│                 │         │                      │         │              │
└─────────────────┘         └──────────┬───────────┘         └──────────────┘
                                       │
                                       │ MongoDB
                                       ▼
                            ┌──────────────────────┐
                            │                      │
                            │  MongoDB Database    │
                            │  (Session Storage)   │
                            │                      │
                            └──────────────────────┘
```

## Data Flow

### 1. Session Creation Flow
```
Mobile App
    │
    │ POST /api/sessions
    │ {user_id, session_type, duration, movement_data}
    ▼
FastAPI Backend
    │
    ├─► Validate with Pydantic
    │   ├─ Check required fields
    │   ├─ Validate data types
    │   └─ Validate movement_data array
    │
    ├─► Store in MongoDB
    │   ├─ Create session document
    │   ├─ Set status: "pending"
    │   └─ Return session_id
    │
    └─► Forward to AI Engine (async)
        ├─ POST /api/analyze
        ├─ Update status: "processing"
        ├─ Receive AI analysis
        └─ Update session with results
            └─ Set status: "completed"
```

### 2. Session Retrieval Flow
```
Mobile App
    │
    │ GET /api/sessions/{session_id}
    ▼
FastAPI Backend
    │
    ├─► Query MongoDB
    │   └─ Find by session_id
    │
    └─► Return session with AI analysis
        └─ Status: completed/pending/failed
```

## Component Architecture

### Backend Service (Python/FastAPI)

```
main.py (Entry Point)
    │
    ├─► app/
    │   │
    │   ├─► config/
    │   │   ├─ database.py      # MongoDB connection
    │   │   └─ settings.py      # Environment config
    │   │
    │   ├─► schemas/
    │   │   └─ session_schemas.py  # Pydantic validation models
    │   │       ├─ MovementData
    │   │       ├─ SessionCreate
    │   │       ├─ SessionResponse
    │   │       └─ AIAnalysisRequest
    │   │
    │   ├─► routes/
    │   │   └─ session_routes.py   # API endpoints
    │   │       ├─ POST /api/sessions
    │   │       ├─ GET /api/sessions/{id}
    │   │       └─ GET /api/sessions
    │   │
    │   ├─► services/
    │   │   ├─ session_service.py  # Business logic
    │   │   │   ├─ create_session()
    │   │   │   ├─ get_session()
    │   │   │   └─ get_user_sessions()
    │   │   │
    │   │   └─ ai_service.py       # AI integration
    │   │       ├─ analyze_session()
    │   │       └─ get_analysis_status()
    │   │
    │   └─► models/
    │       └─ session_model.py    # DB models
    │           ├─ create_session()
    │           ├─ serialize_session()
    │           └─ update_session_*()
```

## Database Schema

### MongoDB Collection: `sessions`

```javascript
{
  "_id": ObjectId,                    // Auto-generated
  "user_id": String,                  // Required
  "session_type": String,             // Required (e.g., "walking", "running")
  "duration": Number,                 // Required (seconds)
  "movement_data": [                  // Required (min 1 item)
    {
      "timestamp": Number,            // Unix timestamp
      "x": Number,                    // X-axis value
      "y": Number,                    // Y-axis value
      "z": Number                     // Z-axis value
    }
  ],
  "metadata": Object,                 // Optional
  "status": String,                   // "pending" | "processing" | "completed" | "failed"
  "created_at": Date,                 // Auto-generated
  "updated_at": Date,                 // Auto-updated
  "ai_analysis": Object | null        // Populated after AI processing
}
```

## API Request/Response Formats

### Create Session Request
```json
POST /api/sessions
Content-Type: application/json

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
    }
  ],
  "metadata": {
    "device": "iPhone 13",
    "app_version": "1.0.0"
  }
}
```

### Session Response
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

## Error Handling Strategy

### 1. Validation Errors (422)
- Pydantic automatically validates all inputs
- Returns detailed field-level errors
- Example: Missing required field, invalid type

### 2. Database Errors (500)
- Graceful degradation when MongoDB unavailable
- Server starts in limited mode
- Clear error messages to client

### 3. AI Engine Errors
- Non-blocking: session still created if AI fails
- Status tracked: pending → failed
- Mock response returned if AI unavailable

### 4. Not Found (404)
- Session ID doesn't exist
- Clear error message

## Security Considerations

### ✅ Implemented
- Input validation (Pydantic)
- CORS configuration
- Environment-based configuration
- Database connection timeouts
- Error message sanitization

### 🔜 Recommended for Production
- Rate limiting
- Authentication/Authorization (JWT)
- HTTPS/TLS encryption
- API key management
- Request logging/monitoring
- Database encryption at rest

## Scalability Design

### Horizontal Scaling
```
                    ┌─────────────────┐
                    │  Load Balancer  │
                    └────────┬────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
        ▼                    ▼                    ▼
┌───────────────┐   ┌───────────────┐   ┌───────────────┐
│  FastAPI      │   │  FastAPI      │   │  FastAPI      │
│  Instance 1   │   │  Instance 2   │   │  Instance 3   │
└───────┬───────┘   └───────┬───────┘   └───────┬───────┘
        │                    │                    │
        └────────────────────┼────────────────────┘
                             │
                    ┌────────▼────────┐
                    │  MongoDB        │
                    │  (Replica Set)  │
                    └─────────────────┘
```

### Async Processing
- AI analysis happens asynchronously
- Non-blocking session creation
- Background task processing
- Status polling for results

## Deployment Options

### Option 1: Docker Container
```dockerfile
FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Option 2: Kubernetes
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: stepflow-backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: stepflow-backend
  template:
    metadata:
      labels:
        app: stepflow-backend
    spec:
      containers:
      - name: fastapi
        image: stepflow-backend:latest
        ports:
        - containerPort: 8000
```

### Option 3: Cloud Platform
- AWS: Elastic Beanstalk, ECS, Lambda
- GCP: Cloud Run, GKE, App Engine
- Azure: App Service, AKS

## Monitoring & Observability

### Health Checks
- `/health` endpoint for liveness probes
- Database connection status
- AI engine connectivity

### Metrics to Track
- Request rate (requests/second)
- Response time (latency)
- Error rate (4xx, 5xx)
- Session creation rate
- AI processing time
- Database query performance

### Logging
- Request/response logging
- Error tracking
- AI engine communication logs
- Database operation logs

## Future Enhancements

1. **Caching Layer**: Redis for frequent queries
2. **Message Queue**: RabbitMQ/Kafka for AI processing
3. **WebSockets**: Real-time updates to mobile app
4. **GraphQL**: Alternative to REST API
5. **Batch Processing**: Handle multiple sessions
6. **Analytics Dashboard**: Session insights
7. **Export Features**: CSV/JSON data export
8. **Backup/Recovery**: Automated backups

## Testing Strategy

### Unit Tests
- Pydantic schema validation
- Service layer logic
- Model serialization

### Integration Tests
- API endpoint testing
- Database operations
- AI service communication

### End-to-End Tests
- Complete data flow
- Error scenarios
- Performance testing

## Support & Maintenance

- **Code Quality**: Modular, well-documented
- **Test Coverage**: Comprehensive test suite
- **Documentation**: README, inline comments
- **Version Control**: Git with semantic versioning
- **Dependencies**: Regular security updates
