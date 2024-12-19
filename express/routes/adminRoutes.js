import express from 'express';
import { isAdmin, auditLog } from '../middleware/adminMiddleware.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import * as adminController from '../controllers/adminController.js';

const router = express.Router();

// Middleware pentru toate rutele admin
router.use(authMiddleware);
router.use(isAdmin);

// Statistici
router.get('/stats/overview', adminController.getStatsOverview);
router.get('/stats/users', adminController.getUserStats);
router.get('/stats/transactions', adminController.getTransactionStats);
router.get('/stats/wishes', adminController.getWishStats);

// Gestionare utilizatori
router.get('/users', adminController.getUsers);
router.get('/users/:userId', adminController.getUserDetails);
router.post('/users/:userId/credits', auditLog('USER_CREDIT_MODIFY'), adminController.modifyUserCredits);
router.put('/users/:userId/role', auditLog('USER_ROLE_CHANGE'), adminController.updateUserRole);

// Configurări sistem
router.get('/config', adminController.getConfig);
router.put('/config', auditLog('CONFIG_CHANGE'), adminController.updateConfig);

// Configurări AI
router.get('/ai/config', adminController.getAIConfig);
router.put('/ai/config', auditLog('AI_CONFIG_CHANGE'), adminController.updateAIConfig);

// Logs sistem
router.get('/logs', adminController.getLogs);
router.get('/logs/audit', adminController.getAuditLogs);

export { router };
