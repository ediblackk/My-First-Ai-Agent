const request = require('supertest');
const app = require('../../server');
const User = require('../../models/user');
const { Config, AdminLog } = require('../../models/config');
const adminConfig = require('../../config/adminConfig');

describe('Admin Controller', () => {
  let adminUser;
  let adminToken;
  let normalUser;

  beforeEach(async () => {
    // Create admin user
    adminUser = await createTestUser({
      publicKey: process.env.ADMIN_WALLET_ADDRESS
    });
    adminToken = generateTestToken(adminUser._id);

    // Create normal user
    normalUser = await createTestUser();
  });

  describe('POST /api/admin/auth/verify', () => {
    it('should verify admin wallet', async () => {
      const response = await request(app)
        .post('/api/admin/auth/verify')
        .send({ publicKey: process.env.ADMIN_WALLET_ADDRESS });

      expectApiSuccess(response);
      expect(response.body.role).toBe('SUPER_ADMIN');
      expect(response.body.permissions).toEqual(
        adminConfig.roles.SUPER_ADMIN.permissions
      );
    });

    it('should reject non-admin wallet', async () => {
      const response = await request(app)
        .post('/api/admin/auth/verify')
        .send({ publicKey: normalUser.publicKey });

      expectApiError(response, 403);
    });
  });

  describe('User Management', () => {
    describe('GET /api/admin/users', () => {
      beforeEach(async () => {
        // Create multiple test users
        await Promise.all([
          createTestUser(),
          createTestUser(),
          createTestUser()
        ]);
      });

      it('should list users with pagination', async () => {
        const response = await request(app)
          .get('/api/admin/users')
          .set('Authorization', `Bearer ${adminToken}`)
          .query({ page: 1, limit: 2 });

        expectApiSuccess(response);
        expect(response.body.users).toHaveLength(2);
        expect(response.body.pagination).toBeDefined();
        expect(response.body.pagination.total).toBeGreaterThan(2);
      });

      it('should search users by publicKey', async () => {
        const response = await request(app)
          .get('/api/admin/users')
          .set('Authorization', `Bearer ${adminToken}`)
          .query({ search: normalUser.publicKey });

        expectApiSuccess(response);
        expect(response.body.users).toHaveLength(1);
        expect(response.body.users[0].publicKey).toBe(normalUser.publicKey);
      });
    });

    describe('POST /api/admin/users/:userId/credits', () => {
      it('should modify user credits', async () => {
        const response = await request(app)
          .post(`/api/admin/users/${normalUser._id}/credits`)
          .set('Authorization', `Bearer ${adminToken}`)
          .send({
            amount: 100,
            reason: 'Test credit modification'
          });

        expectApiSuccess(response);
        
        // Verify user credits updated
        const updatedUser = await User.findById(normalUser._id);
        expect(updatedUser.credits).toBe(normalUser.credits + 100);

        // Verify audit log created
        const log = await AdminLog.findOne({
          action: 'USER_CREDIT_MODIFY',
          'details.userId': normalUser._id
        });
        expect(log).toBeDefined();
      });

      it('should prevent negative credits', async () => {
        const response = await request(app)
          .post(`/api/admin/users/${normalUser._id}/credits`)
          .set('Authorization', `Bearer ${adminToken}`)
          .send({
            amount: -1000,
            reason: 'Test negative credits'
          });

        expectApiSuccess(response);
        
        const updatedUser = await User.findById(normalUser._id);
        expect(updatedUser.credits).toBe(0);
      });
    });
  });

  describe('System Configuration', () => {
    describe('GET /api/admin/config', () => {
      beforeEach(async () => {
        await Promise.all([
          createTestConfig({ category: 'SYSTEM' }),
          createTestConfig({ category: 'AI' }),
          createTestConfig({ category: 'GAME' })
        ]);
      });

      it('should list all configs', async () => {
        const response = await request(app)
          .get('/api/admin/config')
          .set('Authorization', `Bearer ${adminToken}`);

        expectApiSuccess(response);
        expect(response.body.configs.length).toBeGreaterThan(0);
      });

      it('should filter configs by category', async () => {
        const response = await request(app)
          .get('/api/admin/config')
          .set('Authorization', `Bearer ${adminToken}`)
          .query({ category: 'AI' });

        expectApiSuccess(response);
        expect(response.body.configs).toEqual(
          expect.arrayContaining([
            expect.objectContaining({ category: 'AI' })
          ])
        );
      });
    });

    describe('PUT /api/admin/config', () => {
      let testConfig;

      beforeEach(async () => {
        testConfig = await createTestConfig();
      });

      it('should update config value', async () => {
        const response = await request(app)
          .put('/api/admin/config')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({
            key: testConfig.key,
            value: 'new-value'
          });

        expectApiSuccess(response);
        expect(response.body.config.value).toBe('new-value');

        // Verify audit log
        const log = await AdminLog.findOne({
          action: 'CONFIG_CHANGE',
          'details.key': testConfig.key
        });
        expect(log).toBeDefined();
      });
    });

    describe('AI Configuration', () => {
      it('should update AI config', async () => {
        const response = await request(app)
          .put('/api/admin/ai/config')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({
            model: 'gpt-4',
            maxTokens: 2000
          });

        expectApiSuccess(response);

        // Verify configs updated
        const modelConfig = await Config.findOne({ key: 'AI_MODEL' });
        const tokensConfig = await Config.findOne({ key: 'AI_MAX_TOKENS' });
        expect(modelConfig.value).toBe('gpt-4');
        expect(tokensConfig.value).toBe(2000);
      });
    });
  });

  describe('System Stats & Logs', () => {
    describe('GET /api/admin/stats/overview', () => {
      beforeEach(async () => {
        // Create test data
        await Promise.all([
          createTestUser(),
          createTestWish(normalUser._id),
          createTestWish(normalUser._id, { status: 'completed' })
        ]);
      });

      it('should return system overview stats', async () => {
        const response = await request(app)
          .get('/api/admin/stats/overview')
          .set('Authorization', `Bearer ${adminToken}`);

        expectApiSuccess(response);
        expect(response.body.stats).toEqual(
          expect.objectContaining({
            users: expect.any(Number),
            activeUsers: expect.any(Number),
            totalCredits: expect.any(Array)
          })
        );
      });
    });

    describe('GET /api/admin/logs', () => {
      beforeEach(async () => {
        // Create test logs
        await Promise.all([
          AdminLog.create({
            action: 'TEST_ACTION',
            adminPublicKey: adminUser.publicKey,
            details: { test: 'data' }
          }),
          AdminLog.create({
            action: 'ANOTHER_ACTION',
            adminPublicKey: adminUser.publicKey,
            details: { more: 'data' }
          })
        ]);
      });

      it('should list system logs with pagination', async () => {
        const response = await request(app)
          .get('/api/admin/logs')
          .set('Authorization', `Bearer ${adminToken}`)
          .query({ page: 1, limit: 10 });

        expectApiSuccess(response);
        expect(response.body.logs.length).toBeGreaterThan(0);
        expect(response.body.pagination).toBeDefined();
      });

      it('should filter audit logs by action', async () => {
        const response = await request(app)
          .get('/api/admin/logs/audit')
          .set('Authorization', `Bearer ${adminToken}`)
          .query({ action: 'TEST_ACTION' });

        expectApiSuccess(response);
        expect(response.body.logs).toEqual(
          expect.arrayContaining([
            expect.objectContaining({ action: 'TEST_ACTION' })
          ])
        );
      });
    });
  });

  describe('Permission Checks', () => {
    it('should require admin authentication', async () => {
      const response = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${generateTestToken(normalUser._id)}`);

      expectApiError(response, 403);
    });

    it('should validate required permissions', async () => {
      // Create admin with limited permissions
      const limitedAdmin = await createTestUser({
        publicKey: 'limited-admin',
        role: 'SUPPORT_ADMIN'
      });
      const limitedToken = generateTestToken(limitedAdmin._id);

      const response = await request(app)
        .put('/api/admin/config')
        .set('Authorization', `Bearer ${limitedToken}`)
        .send({
          key: 'test-key',
          value: 'test-value'
        });

      expectApiError(response, 403);
    });
  });
});
