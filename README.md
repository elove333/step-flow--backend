# STEPFLOW Backend API

Backend API for STEPFLOW, handling authentication, session ingestion, analytics, scoring, and user progress tracking.

## Features

- **Folder Management**: Full CRUD operations for organizing content into folders
- RESTful API architecture
- MongoDB for data persistence
- Input validation and error handling
- Hierarchical folder structure support
- **Rate Limiting**: Protection against API abuse
  - General API: 100 requests per 15 minutes
  - Write operations: 20 requests per 15 minutes

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)

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

3. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

4. Update the `.env` file with your configuration:
```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/stepflow
NODE_ENV=development
```

## Running the Application

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server will start on `http://localhost:3000`

## API Endpoints

### Health Check
- `GET /health` - Check API health status

### Folders

#### Get All Folders
```
GET /api/folders?userId={userId}&parentFolder={parentFolderId}
```
**Query Parameters:**
- `userId` (required) - User ID to filter folders
- `parentFolder` (optional) - Parent folder ID to get sub-folders

**Response:**
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "_id": "folder_id",
      "name": "My Folder",
      "description": "Folder description",
      "userId": "user123",
      "parentFolder": null,
      "color": "#808080",
      "isArchived": false,
      "createdAt": "2026-01-23T00:00:00.000Z",
      "updatedAt": "2026-01-23T00:00:00.000Z"
    }
  ]
}
```

#### Get Single Folder
```
GET /api/folders/:id
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "folder_id",
    "name": "My Folder",
    "description": "Folder description",
    "userId": "user123",
    "parentFolder": null,
    "color": "#808080",
    "isArchived": false,
    "createdAt": "2026-01-23T00:00:00.000Z",
    "updatedAt": "2026-01-23T00:00:00.000Z"
  }
}
```

#### Create Folder
```
POST /api/folders
```

**Request Body:**
```json
{
  "name": "New Folder",
  "description": "Optional description",
  "userId": "user123",
  "parentFolder": "parent_folder_id",
  "color": "#FF5733"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "new_folder_id",
    "name": "New Folder",
    "description": "Optional description",
    "userId": "user123",
    "parentFolder": "parent_folder_id",
    "color": "#FF5733",
    "isArchived": false,
    "createdAt": "2026-01-23T00:00:00.000Z",
    "updatedAt": "2026-01-23T00:00:00.000Z"
  }
}
```

#### Update Folder
```
PUT /api/folders/:id
```

**Request Body:**
```json
{
  "name": "Updated Folder Name",
  "description": "Updated description",
  "color": "#00FF00",
  "isArchived": false
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "folder_id",
    "name": "Updated Folder Name",
    "description": "Updated description",
    "color": "#00FF00",
    "isArchived": false
  }
}
```

#### Delete Folder
```
DELETE /api/folders/:id
```

**Response:**
```json
{
  "success": true,
  "data": {},
  "message": "Folder deleted successfully"
}
```

**Note:** Folders with sub-folders cannot be deleted. Delete or move sub-folders first.

## Testing

Run basic API tests (no database required):
```bash
npm test
```

Run full integration tests with MongoDB (requires MongoDB connection):
```bash
npm run test:integration
```

Run tests in watch mode:
```bash
npm run test:watch
```

**Note:** The full integration tests require a MongoDB instance. For local development with MongoDB:
1. Install and run MongoDB locally, OR
2. Use MongoDB Atlas or another cloud MongoDB service, OR
3. Tests will automatically use an in-memory MongoDB server if available

The basic tests (`npm test`) verify API endpoints and response formats without requiring a database.

## Project Structure

```
-STEPFLOW--backend/
├── src/
│   ├── config/
│   │   └── database.js       # Database connection configuration
│   ├── controllers/
│   │   └── folderController.js  # Folder business logic
│   ├── models/
│   │   └── Folder.js         # Folder data model
│   ├── routes/
│   │   └── folderRoutes.js   # Folder API routes
│   ├── app.js                # Express application setup
│   └── server.js             # Server entry point
├── tests/
│   └── folder.test.js        # Folder API tests
├── .env.example              # Environment variables example
├── .gitignore
├── jest.config.js            # Jest configuration
├── package.json
└── README.md
```

## Error Handling

The API returns standard HTTP status codes:

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `403` - Forbidden
- `404` - Not Found
- `429` - Too Many Requests (rate limit exceeded)
- `500` - Internal Server Error

Error responses follow this format:
```json
{
  "success": false,
  "error": "Error message"
}
```

### Rate Limiting

To prevent API abuse, rate limiting is applied:
- **General API routes**: 100 requests per 15 minutes per IP
- **Write operations** (POST, PUT, DELETE): 20 requests per 15 minutes per IP

When rate limit is exceeded, the API returns a 429 status with retry information in the response headers.

## Features in Detail

### Folder Hierarchy
- Create nested folders with parent-child relationships
- Query folders by parent to get folder structure
- Prevent circular references (folder cannot be its own parent)

### Validation
- Folder names are required and limited to 100 characters
- Descriptions are limited to 500 characters
- Duplicate folder names at the same level are prevented
- Parent folder ownership is validated

### Archiving
- Folders can be archived instead of deleted
- Archived folders are excluded from default queries

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License - see the LICENSE file for details.
