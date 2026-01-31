# Quick Start Guide - Step-Flow Backend

## 🚀 5-Minute Setup

### Prerequisites Check
```bash
# Check Python version (needs 3.12+)
python3 --version

# Check pip
pip3 --version

# Check MongoDB (optional)
mongod --version
```

### Installation
```bash
# 1. Clone repository
git clone https://github.com/elove333/step-flow--backend.git
cd step-flow--backend

# 2. Install dependencies
pip3 install -r requirements.txt

# 3. Start the server
./start.sh
# Or: python3 -m uvicorn main:app --reload
```

### Verify Installation
```bash
# Test health endpoint
curl http://localhost:8000/health

# Expected response:
# {"status":"ok","message":"Step-Flow Backend API is running","service":"step-flow-backend"}
```

## 📝 Common Tasks

### Create a Session
```bash
curl -X POST http://localhost:8000/api/sessions \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "test_user",
    "session_type": "walking",
    "duration": 60.0,
    "movement_data": [
      {"timestamp": 1706659200.0, "x": 0.5, "y": 0.3, "z": 0.8}
    ]
  }'
```

### Get User Sessions
```bash
curl "http://localhost:8000/api/sessions?user_id=test_user"
```

### Get Specific Session
```bash
# Replace SESSION_ID with actual ID from create response
curl "http://localhost:8000/api/sessions/SESSION_ID"
```

## 🧪 Testing

```bash
# Run all tests
python3 -m pytest tests/python/ -v

# Run specific test
python3 -m pytest tests/python/test_api.py::test_health_check -v

# Run with coverage
python3 -m pytest tests/python/ --cov=app
```

## 📚 Documentation

- **Interactive API Docs**: http://localhost:8000/docs
- **Alternative Docs**: http://localhost:8000/redoc
- **Full Documentation**: See [README_PYTHON.md](README_PYTHON.md)
- **Architecture**: See [ARCHITECTURE.md](ARCHITECTURE.md)

## ⚙️ Configuration

Edit `.env` file:
```env
PYTHON_PORT=8000
MONGODB_URI=mongodb://localhost:27017
DATABASE_NAME=stepflow
AI_ENGINE_URL=http://localhost:5000
```

## 🐛 Troubleshooting

### Server won't start
```bash
# Check if port is in use
lsof -i :8000

# Kill process if needed
kill -9 <PID>
```

### MongoDB connection error
```bash
# Server runs in limited mode without MongoDB
# Check MongoDB status
sudo systemctl status mongod

# Start MongoDB
sudo systemctl start mongod
```

### Import errors
```bash
# Reinstall dependencies
pip3 install -r requirements.txt --force-reinstall
```

## 🔑 Key Files

| File | Purpose |
|------|---------|
| `main.py` | Application entry point |
| `app/routes/session_routes.py` | API endpoints |
| `app/services/session_service.py` | Business logic |
| `app/schemas/session_schemas.py` | Data validation |
| `requirements.txt` | Dependencies |
| `start.sh` | Startup script |

## 💡 Tips

1. **Use Interactive Docs**: Visit `/docs` for easy API testing
2. **Check Logs**: Server prints helpful debug information
3. **Run Tests First**: Verify setup with `pytest`
4. **Use Virtual Environment**: Isolate dependencies
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```

## 📞 Support

- Issues: GitHub Issues
- Documentation: README_PYTHON.md
- Architecture: ARCHITECTURE.md
