const request = require('supertest');
const app = require('../src/app');

// Simple integration tests for API routes without database
describe('Folder API Basic Tests (No DB)', () => {
  describe('Health and Root Routes', () => {
    it('should return health status', async () => {
      const res = await request(app).get('/health');

      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('ok');
      expect(res.body.message).toBe('STEPFLOW Backend API is running');
    });

    it('should return API info at root', async () => {
      const res = await request(app).get('/');

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('STEPFLOW Backend API');
      expect(res.body.version).toBe('1.0.0');
      expect(res.body.endpoints).toBeDefined();
      expect(res.body.endpoints.health).toBe('/health');
      expect(res.body.endpoints.folders).toBe('/api/folders');
    });

    it('should return 404 for unknown routes', async () => {
      const res = await request(app).get('/api/unknown');

      expect(res.statusCode).toBe(404);
      expect(res.body.error).toBe('Route not found');
    });
  });

  describe('Folder API Routes', () => {
    it('should have GET /api/folders endpoint', async () => {
      const res = await request(app).get('/api/folders');
      
      // Should fail with validation error (no userId) but endpoint exists
      expect([400, 500]).toContain(res.statusCode);
    });

    it('should have POST /api/folders endpoint', async () => {
      const res = await request(app)
        .post('/api/folders')
        .send({ name: 'Test' });
      
      // Should fail with validation error but endpoint exists
      expect([400, 500]).toContain(res.statusCode);
    });

    it('should validate userId is required for GET', async () => {
      const res = await request(app).get('/api/folders');

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe('User ID is required');
    });

    it('should validate required fields for POST', async () => {
      const res = await request(app)
        .post('/api/folders')
        .send({ description: 'Only description' });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('API Response Format', () => {
    it('should return JSON responses', async () => {
      const res = await request(app).get('/health');

      expect(res.headers['content-type']).toMatch(/json/);
    });

    it('error responses should include error field', async () => {
      const res = await request(app).get('/api/folders');

      expect(res.body).toHaveProperty('error');
      expect(res.statusCode).toBe(400);
    });
  });
});
