const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminControllers');

router.get('/getAllClients',adminController.getAllClients);

module.exports = router;