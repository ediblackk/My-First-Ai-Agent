const request = require('supertest');
const app = require('../../server');
const User = require('../../models/user');
const Wish = require('../../models/wish');
const aiService = require('../../services/aiService');

describe('Wish Controller', () => {
  let testUser;
  let authToken;

  beforeEach(async () => {
    // Creare user de test
    testUser = await createTestUser();
    authToken = generateTestToken(testUser._id);
  });

  describe('POST /api/wishes', () => {
    const validWishData = {
      content: 'Test wish content that is long enough'
    };

    it('should create a wish successfully', async () => {
      const response = await request(app)
        .post('/api/wishes')
        .set('Authorization', `Bearer ${authToken}`)
        .send(validWishData);

      expectApiSuccess(response);
      expect(response.body.wish).toBeDefined();
      expect(response.body.wish.content).toBe(validWishData.content);
      expect(response.body.wish.user).toBe(testUser._id.toString());
      expect(response.body.wish.status).toBe('pending');
      expect(response.body.wish.analysis).toBeDefined();
      expect(response.body.wish.solution).toBeDefined();

      // Verificare user actualizat
      const updatedUser = await User.findById(testUser._id);
      expect(updatedUser.credits).toBe(testUser.credits - 1);
      expect(updatedUser.activeWishes).toBe(1);
      expect(updatedUser.totalWishes).toBe(1);
    });

    it('should fail if content is too short', async () => {
      const response = await request(app)
        .post('/api/wishes')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ content: 'Short' });

      expectApiError(response, 400);
    });

    it('should fail if user has insufficient credits', async () => {
      // Set user credits to 0
      await User.findByIdAndUpdate(testUser._id, { credits: 0 });

      const response = await request(app)
        .post('/api/wishes')
        .set('Authorization', `Bearer ${authToken}`)
        .send(validWishData);

      expectApiError(response, 400, 'Credite insuficiente');
    });

    it('should handle AI service errors gracefully', async () => {
      // Mock AI service to throw error
      aiService.analyzeWish.mockRejectedValueOnce(new Error('AI Service Error'));

      const response = await request(app)
        .post('/api/wishes')
        .set('Authorization', `Bearer ${authToken}`)
        .send(validWishData);

      expectApiError(response, 500);
    });
  });

  describe('GET /api/wishes', () => {
    beforeEach(async () => {
      // Create test wishes
      await createTestWish(testUser._id, { status: 'pending' });
      await createTestWish(testUser._id, { status: 'completed' });
      await createTestWish(testUser._id, { status: 'cancelled' });
    });

    it('should list user wishes with pagination', async () => {
      const response = await request(app)
        .get('/api/wishes')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ page: 1, limit: 2 });

      expectApiSuccess(response);
      expect(response.body.wishes).toHaveLength(2);
      expect(response.body.pagination).toBeDefined();
      expect(response.body.pagination.total).toBe(3);
    });

    it('should filter wishes by status', async () => {
      const response = await request(app)
        .get('/api/wishes')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ status: 'pending' });

      expectApiSuccess(response);
      expect(response.body.wishes).toHaveLength(1);
      expect(response.body.wishes[0].status).toBe('pending');
    });

    it('should sort wishes by creation date', async () => {
      const response = await request(app)
        .get('/api/wishes')
        .set('Authorization', `Bearer ${authToken}`);

      expectApiSuccess(response);
      const dates = response.body.wishes.map(w => new Date(w.createdAt));
      expect(dates).toEqual([...dates].sort((a, b) => b - a)); // Descending
    });
  });

  describe('GET /api/wishes/:wishId', () => {
    let testWish;

    beforeEach(async () => {
      testWish = await createTestWish(testUser._id);
    });

    it('should get wish details', async () => {
      const response = await request(app)
        .get(`/api/wishes/${testWish._id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expectApiSuccess(response);
      expect(response.body.wish._id).toBe(testWish._id.toString());
      expect(response.body.wish.content).toBe(testWish.content);
    });

    it('should fail for non-existent wish', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .get(`/api/wishes/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expectApiError(response, 404, 'Dorință negăsită');
    });

    it('should not allow access to other users wishes', async () => {
      const otherUser = await createTestUser();
      const otherWish = await createTestWish(otherUser._id);

      const response = await request(app)
        .get(`/api/wishes/${otherWish._id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expectApiError(response, 404);
    });
  });

  describe('PUT /api/wishes/:wishId/status', () => {
    let testWish;

    beforeEach(async () => {
      testWish = await createTestWish(testUser._id);
    });

    it('should update wish status', async () => {
      const response = await request(app)
        .put(`/api/wishes/${testWish._id}/status`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'completed' });

      expectApiSuccess(response);
      expect(response.body.wish.status).toBe('completed');

      // Verificare user stats
      const updatedUser = await User.findById(testUser._id);
      expect(updatedUser.activeWishes).toBe(0);
    });

    it('should handle invalid status transitions', async () => {
      // First complete the wish
      await request(app)
        .put(`/api/wishes/${testWish._id}/status`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'completed' });

      // Try to set it back to pending
      const response = await request(app)
        .put(`/api/wishes/${testWish._id}/status`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'pending' });

      expectApiError(response, 400);
    });

    it('should validate status value', async () => {
      const response = await request(app)
        .put(`/api/wishes/${testWish._id}/status`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'invalid_status' });

      expectApiError(response, 400);
    });
  });

  describe('DELETE /api/wishes/:wishId', () => {
    let testWish;

    beforeEach(async () => {
      testWish = await createTestWish(testUser._id);
    });

    it('should delete a wish', async () => {
      const response = await request(app)
        .delete(`/api/wishes/${testWish._id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expectApiSuccess(response);

      // Verify wish is deleted
      const deletedWish = await Wish.findById(testWish._id);
      expect(deletedWish).toBeNull();

      // Verify user stats
      const updatedUser = await User.findById(testUser._id);
      expect(updatedUser.activeWishes).toBe(0);
    });

    it('should not allow deleting completed wishes', async () => {
      await Wish.findByIdAndUpdate(testWish._id, { status: 'completed' });

      const response = await request(app)
        .delete(`/api/wishes/${testWish._id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expectApiError(response, 400);
    });

    it('should not allow deleting other users wishes', async () => {
      const otherUser = await createTestUser();
      const otherWish = await createTestWish(otherUser._id);

      const response = await request(app)
        .delete(`/api/wishes/${otherWish._id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expectApiError(response, 404);
    });
  });
});
