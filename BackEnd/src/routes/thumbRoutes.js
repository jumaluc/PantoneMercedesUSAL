const express = require('express');
const router = express.Router();
const thumbController = require('../controllers/thumbController');

router.get('/', thumbController.getThumbnail);

module.exports = router;
