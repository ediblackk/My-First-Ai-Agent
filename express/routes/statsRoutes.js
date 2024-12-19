import express from 'express';
import {
  getLatestFulfilledWishes,
  getTopRewards,
  getRoundStatistics
} from '../controllers/statsController.js';

const router = express.Router();

// All these routes are public as they show general game statistics
router.get('/latest-wishes', getLatestFulfilledWishes);
router.get('/top-rewards', getTopRewards);
router.get('/round-stats', getRoundStatistics);

export { router };
