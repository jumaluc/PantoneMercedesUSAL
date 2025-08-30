const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminControllers');

router.get('/getAllClients',adminController.getAllClients);
router.post('/createClient',adminController.createClient);

module.exports = router;