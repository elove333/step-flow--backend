"""
Example usage of the Step-Flow Backend API
"""
import json

# Example: Create a movement session
example_session = {
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
        },
        {
            "timestamp": 1706659202.123,
            "x": 0.4,
            "y": 0.5,
            "z": 0.7
        }
    ],
    "metadata": {
        "device": "iPhone 13",
        "app_version": "1.0.0",
        "location": "indoor"
    }
}

print("Example Session Data:")
print(json.dumps(example_session, indent=2))

print("\n" + "="*60)
print("To test the API:")
print("="*60)
print("\n1. Start the server:")
print("   ./start.sh")
print("\n2. Test health endpoint:")
print("   curl http://localhost:8000/health")
print("\n3. Create a session:")
print("   curl -X POST http://localhost:8000/api/sessions \\")
print("     -H 'Content-Type: application/json' \\")
print("     -d @example_session.json")
print("\n4. Get user sessions:")
print("   curl 'http://localhost:8000/api/sessions?user_id=user_12345'")
print("\n5. View interactive docs:")
print("   Open http://localhost:8000/docs in your browser")
