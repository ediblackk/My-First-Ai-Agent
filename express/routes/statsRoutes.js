const express = require('express');
const router = express.Router();
const {
  getLatestFulfilledWishes,
  getTopRewards,
  getRoundStatistics
} = require('../controllers/statsController');

// All these routes are public as they show general game statistics
router.get('/latest-wishes', getLatestFulfilledWishes);
router.get('/top-rewards', getTopRewards);
router.get('/round-stats', getRoundStatistics);

module.exports = router;
