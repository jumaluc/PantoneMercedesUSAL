const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminControllers');
const uploadGaleria = require('../middleware/upload')

router.get('/getAllClients',adminController.getAllClients);
router.post('/createClient',adminController.createClient);
router.post('/updateClient', adminController.updateClient)
router.delete('/deleteClient/:clientId',adminController.deleteClient);
router.post('/createGallery', uploadGaleria ,adminController.createGallery);
router.get('/getAllGalleries', adminController.getAllGalleries);
module.exports = router;