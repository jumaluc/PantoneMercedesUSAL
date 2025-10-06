// routes/admin.js
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminControllers');
const uploadGaleria = require('../middleware/upload');
const { withAdminLog } = require('../middleware/adminLoger');
const {uploadVideo} = require('../middleware/uploadVideo');
router.get('/getAllClients', withAdminLog('CLIENT_VIEW'), adminController.getAllClients);
router.post('/createClient', withAdminLog('CLIENT_CREATE', (req, data) => ({
    resource_type: 'CLIENT',
    resource_id: data.data?.id,
    resource_name: `${req.body.first_name} ${req.body.last_name}`
})), adminController.createClient);

router.post('/updateClient', withAdminLog('CLIENT_UPDATE', (req, data) => ({
    resource_type: 'CLIENT',
    resource_id: req.body.id,
    resource_name: `${req.body.first_name} ${req.body.last_name}`,
    additional_data: {
        updated_fields: Object.keys(req.body).filter(key => !['id'].includes(key))
    }
})), adminController.updateClient);

router.delete('/deleteClient/:clientId', withAdminLog('CLIENT_DELETE', (req, data) => ({
    resource_type: 'CLIENT',
    resource_id: req.params.clientId
})), adminController.deleteClient);

router.post('/createGallery', uploadGaleria, withAdminLog('GALLERY_CREATE', (req, data) => ({
    resource_type: 'GALLERY',
    resource_id: data.data?.gallery?.insertId,
    resource_name: req.body.title,
    additional_data: {
        client_id: req.body.id,
        image_count: req.files?.length || 0
    }
})), adminController.createGallery);

router.delete('/deleteGallery/:galleryId', withAdminLog('GALLERY_DELETE', (req, data) => ({
    resource_type: 'GALLERY',
    resource_id: req.params.galleryId
})), adminController.deleteGallery);

router.get('/getAllGalleries', withAdminLog('GALLERY_VIEW'), adminController.getAllGalleries);
router.get('/dashboard-stats', adminController.getDashboardStats);
router.get('/activity-logs', adminController.getActivityLogs);
router.get('/stats/summary', adminController.getStatsSummary);
router.get('/stats/clients-growth', adminController.getClientsGrowth);
router.get('/stats/galleries-growth', adminController.getGalleriesGrowth);
router.get('/stats/activity-timeline', adminController.getActivityTimeline);
router.post('/createVideo', 
  uploadVideo, // Middleware de multer (usa memoria)
  adminController.createVideo // Controller que sube a GCS
);
    
router.get('/getAllVideos', adminController.getAllVideos);
router.put('/updateVideoStatus/:videoId', adminController.updateVideoStatus);
router.put('/updateVideoProgress/:videoId', adminController.updateVideoProgress);
router.delete('/deleteVideo/:videoId', adminController.deleteVideo);
router.get('/getStats', adminController.getStats);
module.exports = router;