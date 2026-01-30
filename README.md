# STEPFLOW Backend

Backend API for STEPFLOW, handling authentication, session ingestion, analytics, scoring, and user progress tracking.

## Features

1. **Authentication** - JWT-based authentication system
2. **Session Data Processing** - Receive and process workout sessions from mobile app
3. **Metrics Processing** - Calculate timing, movement metrics, pace, and calories
4. **Database Storage** - MongoDB integration for data persistence
5. **Analytics & Progress** - Comprehensive analytics and progress tracking endpoints
6. **AI Feedback** - Integration with AI services for personalized feedback

## Tech Stack

- **Runtime**: Node.js >= 20.19.0 with TypeScript
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (jsonwebtoken) + bcrypt
- **Development**: ts-node, nodemon

## Installation

1. Clone the repository:
```bash
git clone https://github.com/elove333/-STEPFLOW--backend.git
cd -STEPFLOW--backend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` and configure:
```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/stepflow
JWT_SECRET=your-secret-key-change-this-in-production
JWT_EXPIRES_IN=7d
AI_SERVICE_URL=http://localhost:5000
AI_SERVICE_API_KEY=your-ai-api-key
```

4. Ensure MongoDB is running:
```bash
# If using Docker:
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Or install MongoDB locally from https://www.mongodb.com/
```

## Usage

### Development Mode
```bash
npm run dev
```

### Build
```bash
npm run build
```

### Production Mode
```bash
npm start
```

The server will start on `http://localhost:3000`

## API Documentation

See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for detailed API endpoints and usage.

## Project Structure

```
src/
├── controllers/     # Request handlers
├── models/          # Database models
├── routes/          # API routes
├── middleware/      # Custom middleware (auth, etc.)
├── services/        # External services (AI, etc.)
├── utils/           # Utility functions
├── types/           # TypeScript type definitions
└── index.ts         # Application entry point
```

## Quick Start Example

1. Register a new user:
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123","name":"John Doe"}'
```

2. Login:
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'
```

3. Create a session (use token from login):
```bash
curl -X POST http://localhost:3000/api/sessions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "startTime": "2024-01-23T10:00:00.000Z",
    "endTime": "2024-01-23T10:30:00.000Z",
    "steps": 5000,
    "distance": 3500
  }'
```

4. Get analytics:
```bash
curl -X GET http://localhost:3000/api/analytics?period=weekly \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## License

ISC
