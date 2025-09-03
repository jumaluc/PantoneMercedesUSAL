const express = require('express');
const router = express.Router();

const userController = require('../controllers/userController');




router.post('/editProfile',userController.editProfile);
router.get('/getUser',userController.getUser);
router.get('/getGallery',userController.getGallery);

module.exports = router;