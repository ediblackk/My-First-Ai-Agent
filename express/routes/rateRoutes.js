const express = require('express');
const router = express.Router();
const { getCurrentRates } = require('../controllers/rateController');

router.get('/current', getCurrentRates);

module.exports = router;
