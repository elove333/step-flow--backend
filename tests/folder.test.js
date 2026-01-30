const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../src/app');
const Folder = require('../src/models/Folder');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
});

beforeEach(async () => {
  await Folder.deleteMany({});
});

describe('Folder API Tests', () => {
  const testUserId = 'user123';
  
  describe('GET /api/folders', () => {
    it('should return all folders for a user', async () => {
      // Create test folders
      await Folder.create([
        { name: 'Folder 1', userId: testUserId },
        { name: 'Folder 2', userId: testUserId },
        { name: 'Other User Folder', userId: 'otheruser' }
      ]);

      const res = await request(app)
        .get('/api/folders')
        .query({ userId: testUserId });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(2);
      expect(res.body.data).toHaveLength(2);
    });

    it('should return 400 if userId is not provided', async () => {
      const res = await request(app).get('/api/folders');

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe('User ID is required');
    });

    it('should filter folders by parentFolder', async () => {
      const parent = await Folder.create({ name: 'Parent', userId: testUserId });
      await Folder.create([
        { name: 'Child 1', userId: testUserId, parentFolder: parent._id },
        { name: 'Child 2', userId: testUserId, parentFolder: parent._id },
        { name: 'Root Folder', userId: testUserId }
      ]);

      const res = await request(app)
        .get('/api/folders')
        .query({ userId: testUserId, parentFolder: parent._id.toString() });

      expect(res.statusCode).toBe(200);
      expect(res.body.count).toBe(2);
    });
  });

  describe('GET /api/folders/:id', () => {
    it('should return a folder by ID', async () => {
      const folder = await Folder.create({ 
        name: 'Test Folder', 
        userId: testUserId,
        description: 'Test description'
      });

      const res = await request(app).get(`/api/folders/${folder._id}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Test Folder');
      expect(res.body.data.description).toBe('Test description');
    });

    it('should return 404 for non-existent folder', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app).get(`/api/folders/${fakeId}`);

      expect(res.statusCode).toBe(404);
      expect(res.body.error).toBe('Folder not found');
    });

    it('should return 404 for invalid ObjectId', async () => {
      const res = await request(app).get('/api/folders/invalid-id');

      expect(res.statusCode).toBe(404);
      expect(res.body.error).toBe('Folder not found');
    });
  });

  describe('POST /api/folders', () => {
    it('should create a new folder', async () => {
      const folderData = {
        name: 'New Folder',
        description: 'A new test folder',
        userId: testUserId,
        color: '#FF5733'
      };

      const res = await request(app)
        .post('/api/folders')
        .send(folderData);

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('New Folder');
      expect(res.body.data.description).toBe('A new test folder');
      expect(res.body.data.userId).toBe(testUserId);
      expect(res.body.data.color).toBe('#FF5733');

      // Verify in database
      const folder = await Folder.findById(res.body.data._id);
      expect(folder).toBeTruthy();
      expect(folder.name).toBe('New Folder');
    });

    it('should create a folder with a parent folder', async () => {
      const parent = await Folder.create({ name: 'Parent', userId: testUserId });

      const folderData = {
        name: 'Child Folder',
        userId: testUserId,
        parentFolder: parent._id.toString()
      };

      const res = await request(app)
        .post('/api/folders')
        .send(folderData);

      expect(res.statusCode).toBe(201);
      expect(res.body.data.parentFolder.toString()).toBe(parent._id.toString());
    });

    it('should return 400 if name is missing', async () => {
      const res = await request(app)
        .post('/api/folders')
        .send({ userId: testUserId });

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe('Name and userId are required');
    });

    it('should return 400 if userId is missing', async () => {
      const res = await request(app)
        .post('/api/folders')
        .send({ name: 'Test Folder' });

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe('Name and userId are required');
    });

    it('should return 400 if folder with same name exists at same level', async () => {
      await Folder.create({ name: 'Duplicate', userId: testUserId });

      const res = await request(app)
        .post('/api/folders')
        .send({ name: 'Duplicate', userId: testUserId });

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe('A folder with this name already exists at this level');
    });

    it('should return 404 if parent folder does not exist', async () => {
      const fakeParentId = new mongoose.Types.ObjectId();

      const res = await request(app)
        .post('/api/folders')
        .send({ 
          name: 'Child', 
          userId: testUserId,
          parentFolder: fakeParentId.toString()
        });

      expect(res.statusCode).toBe(404);
      expect(res.body.error).toBe('Parent folder not found');
    });

    it('should return 403 if trying to create folder under another user\'s folder', async () => {
      const otherUserFolder = await Folder.create({ 
        name: 'Other User Folder', 
        userId: 'otheruser' 
      });

      const res = await request(app)
        .post('/api/folders')
        .send({ 
          name: 'My Folder', 
          userId: testUserId,
          parentFolder: otherUserFolder._id.toString()
        });

      expect(res.statusCode).toBe(403);
      expect(res.body.error).toBe('Cannot create folder under another user\'s folder');
    });
  });

  describe('PUT /api/folders/:id', () => {
    it('should update a folder', async () => {
      const folder = await Folder.create({ 
        name: 'Old Name', 
        userId: testUserId 
      });

      const res = await request(app)
        .put(`/api/folders/${folder._id}`)
        .send({ 
          name: 'New Name',
          description: 'Updated description',
          color: '#00FF00'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('New Name');
      expect(res.body.data.description).toBe('Updated description');
      expect(res.body.data.color).toBe('#00FF00');
    });

    it('should archive a folder', async () => {
      const folder = await Folder.create({ 
        name: 'Folder to Archive', 
        userId: testUserId 
      });

      const res = await request(app)
        .put(`/api/folders/${folder._id}`)
        .send({ isArchived: true });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.isArchived).toBe(true);
    });

    it('should return 404 for non-existent folder', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .put(`/api/folders/${fakeId}`)
        .send({ name: 'Updated' });

      expect(res.statusCode).toBe(404);
      expect(res.body.error).toBe('Folder not found');
    });

    it('should return 400 when trying to move folder into itself', async () => {
      const folder = await Folder.create({ 
        name: 'Test Folder', 
        userId: testUserId 
      });

      const res = await request(app)
        .put(`/api/folders/${folder._id}`)
        .send({ parentFolder: folder._id.toString() });

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe('Cannot move a folder into itself');
    });

    it('should return 400 when trying to move folder into its direct child', async () => {
      // Create hierarchy: parent -> child
      const parent = await Folder.create({ 
        name: 'Parent', 
        userId: testUserId 
      });
      const child = await Folder.create({ 
        name: 'Child', 
        userId: testUserId,
        parentFolder: parent._id
      });

      // Try to move parent into child (its direct descendant)
      const res = await request(app)
        .put(`/api/folders/${parent._id}`)
        .send({ parentFolder: child._id.toString() });

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe('Cannot move a folder into its own descendant');
    });

    it('should return 400 when trying to move folder into its descendant', async () => {
      // Create hierarchy: grandparent -> parent -> child
      const grandparent = await Folder.create({ 
        name: 'Grandparent', 
        userId: testUserId 
      });
      const parent = await Folder.create({ 
        name: 'Parent', 
        userId: testUserId,
        parentFolder: grandparent._id
      });
      const child = await Folder.create({ 
        name: 'Child', 
        userId: testUserId,
        parentFolder: parent._id
      });

      // Try to move grandparent into child (its descendant)
      const res = await request(app)
        .put(`/api/folders/${grandparent._id}`)
        .send({ parentFolder: child._id.toString() });

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe('Cannot move a folder into its own descendant');
    });

    it('should return 400 if updated name conflicts with existing folder', async () => {
      await Folder.create({ name: 'Existing', userId: testUserId });
      const folder = await Folder.create({ name: 'ToUpdate', userId: testUserId });

      const res = await request(app)
        .put(`/api/folders/${folder._id}`)
        .send({ name: 'Existing' });

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe('A folder with this name already exists at this level');
    });
  });

  describe('DELETE /api/folders/:id', () => {
    it('should delete a folder', async () => {
      const folder = await Folder.create({ 
        name: 'To Delete', 
        userId: testUserId 
      });

      const res = await request(app).delete(`/api/folders/${folder._id}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Folder deleted successfully');

      // Verify deletion
      const deletedFolder = await Folder.findById(folder._id);
      expect(deletedFolder).toBeNull();
    });

    it('should return 404 for non-existent folder', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app).delete(`/api/folders/${fakeId}`);

      expect(res.statusCode).toBe(404);
      expect(res.body.error).toBe('Folder not found');
    });

    it('should return 400 if folder has sub-folders', async () => {
      const parent = await Folder.create({ name: 'Parent', userId: testUserId });
      await Folder.create({ name: 'Child', userId: testUserId, parentFolder: parent._id });

      const res = await request(app).delete(`/api/folders/${parent._id}`);

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe('Cannot delete folder with sub-folders. Delete or move sub-folders first.');
    });
  });

  describe('Health and Root Routes', () => {
    it('should return health status', async () => {
      const res = await request(app).get('/health');

      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('ok');
    });

    it('should return API info at root', async () => {
      const res = await request(app).get('/');

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('STEPFLOW Backend API');
      expect(res.body.endpoints).toBeDefined();
    });

    it('should return 404 for unknown routes', async () => {
      const res = await request(app).get('/api/unknown');

      expect(res.statusCode).toBe(404);
      expect(res.body.error).toBe('Route not found');
    });
  });
});
