const express = require('express');
const router = express.Router();

const userController = require('../controllers/userController');




router.post('/editProfile',userController.editProfile);
router.get('/getUser',userController.getUser);


module.exports = router;