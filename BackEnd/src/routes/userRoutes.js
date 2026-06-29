const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { requireAuth } = require('../middleware/auth');
router.use(requireAuth);

router.post('/editProfile',userController.editProfile);
router.get('/getUser',userController.getUser);
router.get('/getGallery',userController.getGallery);
router.post('/downloadImages',userController.downloadImages);
router.post('/downloadSingleImage',userController.downloadSingleImage);
router.post('/confirmSelection',userController.confirmSelection);
router.post('/addComment',userController.addComment);
router.get('/getImageComments',userController.getImageComments);
router.delete('/deleteImageComment', userController.deleteImageComment);
router.put('/updateImageComment', userController.updateImageComment)
router.get('/getMyComments', userController.getMyComments);
router.post("/createRequest",  userController.createRequest);
router.get('/getMyRequests', userController.getMyRequests);
router.get('/getMyVideos', userController.getMyVideos);
router.post('/cancelSelection', userController.cancelSelection);
router.get('/downloadVideo/:videoId', userController.downloadVideo);
router.post('/submitReview', userController.submitReview);
router.get('/getMyReview', userController.getMyReview);
router.get('/getAllReviews', userController.getAllReviews);
router.post('/toggleLike/:id', userController.toggleLike);
module.exports = router;