import express from 'express';
import { isAdmin, hasPermission, auditLog } from '../middleware/adminMiddleware.js';
import * as adminController from '../controllers/adminController.js';
import { permissions } from '../config/adminConfig.js';

const router = express.Router();

// Rute publice pentru autentificare admin
router.post('/auth/verify', adminController.verifyAdmin);

// Middleware pentru toate rutele admin
router.use(isAdmin);

// Gestionare utilizatori
router.get(
  '/users',
  hasPermission(permissions.MANAGE_USERS),
  adminController.getUsers
);

router.get(
  '/users/:userId',
  hasPermission(permissions.MANAGE_USERS),
  adminController.getUserDetails
);

router.post(
  '/users/:userId/credits',
  hasPermission(permissions.MANAGE_CREDITS),
  auditLog('USER_CREDIT_MODIFY'),
  adminController.modifyUserCredits
);

router.put(
  '/users/:userId/role',
  hasPermission(permissions.MANAGE_USERS),
  auditLog('USER_ROLE_CHANGE'),
  adminController.updateUserRole
);

// Configurări sistem
router.get(
  '/config',
  hasPermission(permissions.MANAGE_CONFIG),
  adminController.getConfig
);

router.put(
  '/config',
  hasPermission(permissions.MANAGE_CONFIG),
  auditLog('CONFIG_CHANGE'),
  adminController.updateConfig
);

// Configurări AI
router.get(
  '/ai/config',
  hasPermission(permissions.MANAGE_AI),
  adminController.getAIConfig
);

router.put(
  '/ai/config',
  hasPermission(permissions.MANAGE_AI),
  auditLog('AI_CONFIG_CHANGE'),
  adminController.updateAIConfig
);

// Statistici
router.get(
  '/stats/overview',
  hasPermission(permissions.VIEW_STATS),
  adminController.getStatsOverview
);

router.get(
  '/stats/users',
  hasPermission(permissions.VIEW_STATS),
  adminController.getUserStats
);

router.get(
  '/stats/transactions',
  hasPermission(permissions.VIEW_STATS),
  adminController.getTransactionStats
);

router.get(
  '/stats/wishes',
  hasPermission(permissions.VIEW_STATS),
  adminController.getWishStats
);

// Logs sistem
router.get(
  '/logs',
  hasPermission(permissions.MANAGE_CONFIG),
  adminController.getLogs
);

router.get(
  '/logs/audit',
  hasPermission(permissions.MANAGE_CONFIG),
  adminController.getAuditLogs
);

// Export router
export { router };
