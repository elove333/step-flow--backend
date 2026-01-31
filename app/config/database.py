"""Database configuration and connection management."""
import os
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError

DATABASE_URL = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
DATABASE_NAME = os.getenv("DATABASE_NAME", "stepflow")

# Database client
client: AsyncIOMotorClient = None
database = None


async def connect_db():
    """Connect to MongoDB database."""
    global client, database
    try:
        # Use a shorter timeout for connection
        client = AsyncIOMotorClient(DATABASE_URL, serverSelectionTimeoutMS=5000)
        database = client[DATABASE_NAME]
        # Verify connection
        await client.admin.command('ping')
        print(f"Connected to MongoDB: {DATABASE_NAME}")
    except (ConnectionFailure, ServerSelectionTimeoutError) as e:
        print(f"Warning: MongoDB connection failed: {e}")
        print("Server will start in limited mode without database connectivity.")
        # Set database to None to indicate no connection
        database = None


async def close_db_connection():
    """Close database connection."""
    global client
    if client:
        client.close()
        print("MongoDB connection closed")


def get_database():
    """Get database instance."""
    return database

