# STEPFLOW Backend API Documentation

## Base URL
```
http://localhost:3000/api
```

## Authentication
All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

---

## Authentication Endpoints

### Register User
**POST** `/api/auth/register`

Create a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe" 
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

### Login
**POST** `/api/auth/login`

Authenticate a user and receive a token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

### Get Profile
**GET** `/api/auth/profile`

Get the authenticated user's profile.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "John Doe",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

## Session Endpoints

### Create Session
**POST** `/api/sessions`

Submit a new session from the mobile app.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "startTime": "2024-01-23T10:00:00.000Z",
  "endTime": "2024-01-23T10:30:00.000Z",
  "steps": 5000,
  "distance": 3500,
  "movementData": [
    {
      "timestamp": "2024-01-23T10:05:00.000Z",
      "stepCount": 100,
      "speed": 1.5,
      "cadence": 150,
      "elevation": 10,
      "heartRate": 120
    }
  ],
  "metadata": {
    "deviceType": "iPhone 14",
    "appVersion": "1.0.0"
  }
}
```

**Response:**
```json
{
  "message": "Session created successfully",
  "session":
    "id": "session_id",
    "userId": "user_id",
    "startTime": "2024-01-23T10:00:00.000Z",
    "endTime": "2024-01-23T10:30:00.000Z",
    "duration": 1800,
    "steps": 5000,
    "distance": 3500,
    "avgPace": 5.14,
    "calories": 200,
    "movementData": 'export const           
    ScreenMeta = {
  Home: { title: "STEPFLOW Home" },
  Session: { title: "Movement Session" },
  Results: { title: "Results" },
  Settings: { title: "Settings" }
};
],
    "metadata": {...},
    "createdAt": "2024-01-23T10:30:05.000Z"
  }
}
```

> Note: `avgCadence` and `avgSpeed` are computed metrics (e.g. by the backend's `processMetrics` logic). They may be included in the `session` object returned by this API, but they are **not** persisted in the `Session` database schema.
### Get Sessions
**GET** `/api/sessions`

Retrieve all sessions for the authenticated user.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `startDate` (optional): ISO date string
- `endDate` (optional): ISO date string
- `limit` (optional): Number of results (default: 50)
- `skip` (optional): Number of results to skip (default: 0)

**Response:**
```json
{
  "sessions": [...],
  "pagination": {
    "total": 100,
    "limit": 50,
    "skip": 0
  }
}
```

### Get Session by ID
**GET** `/api/sessions/:id`

Retrieve a specific session.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "session": {
    "id": "session_id",
    "userId": "user_id",
    ...
  }
}
```

### Delete Session
**DELETE** `/api/sessions/:id`

Delete a specific session.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "message": "Session deleted successfully"
}
```

---

## Analytics Endpoints

### Get Analytics
**GET** `/api/analytics`

Get aggregated analytics for a specific period.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `period` (optional): "daily", "weekly", or "monthly" (default: "weekly")
- `startDate` (optional): ISO date string
- `endDate` (optional): ISO date string

**Response:**
```json
{
  "analytics": {
    "period": "weekly",
    "startDate": "2024-01-16T00:00:00.000Z",
    "endDate": "2024-01-23T00:00:00.000Z",
    "totalSteps": 50000,
    "totalDistance": 35000,
    "totalDuration": 18000,
    "totalCalories": 2000,
    "avgPace": 5.14,
    "sessionsCount": 10
  }
}
```

### Get Progress
**GET** `/api/analytics/progress`

Get daily progress data.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `days` (optional): Number of days to retrieve (default: 30)

**Response:**
```json
{
  "progress": [
    {
      "date": "2024-01-23",
      "steps": 10000,
      "distance": 7000,
      "duration": 3600,
      "calories": 400,
      "sessionsCount": 2
    },
    ...
  ]
}
```

### Get Stats
**GET** `/api/analytics/stats`

Get all-time statistics.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "stats": {
    "totalSessions": 100,
    "totalSteps": 500000,
    "totalDistance": 350000,
    "totalDuration": 180000,
    "totalCalories": 20000,
    "avgStepsPerSession": 5000,
    "avgDistancePerSession": 3500,
    "avgDurationPerSession": 1800,
    "avgPace": 5.14
  }
}
```

---

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "error": "Email and password are required"
}
```

### 401 Unauthorized
```json
{
  "error": "Invalid token"
}
```

### 404 Not Found
```json
{
  "error": "Session not found"
}
```

### 409 Conflict
```json
{
  "error": "User already exists"
}
```

### 500 Internal Server Error
```json
{
  "error": "Error message here"
}
```

---

## Data Models

### User
```typescript
{
  email: string;
  password: string (hashed);
  name?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Session
```typescript
{
  userId: string;
  startTime: Date;
  endTime: Date;
  duration: number; // in seconds
  steps: number;
  distance: number; // in meters
  avgPace: number; // minutes per kilometer
  calories: number;
  movementData: MovementData[];
  metadata?: object;
  createdAt: Date;
  updatedAt: Date;
}
```

### MovementData
```typescript
{
  timestamp: Date;
  stepCount: number;
  speed: number; // meters per second
  cadence: number; // steps per minute
  elevation?: number; // meters
  heartRate?: number; // bpm
}
```

---

## AI Feedback

The system automatically generates AI feedback for each session. This feedback includes:
- Overall performance score (0-100)
- Strengths identified
- Areas for improvement
- Personalized suggestions

AI feedback is generated asynchronously after session creation and can be retrieved via the session endpoints.
