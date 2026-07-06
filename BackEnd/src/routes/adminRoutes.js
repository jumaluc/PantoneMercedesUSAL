// routes/admin.js
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminControllers');
const uploadGaleria = require('../middleware/upload');
const { withAdminLog } = require('../middleware/adminLoger');
const {uploadVideo} = require('../middleware/uploadVideo');
const { requireAdmin } = require('../middleware/auth');
router.use(requireAdmin);
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
  uploadVideo,
  withAdminLog('VIDEO_CREATE', (req, data) => ({
    resource_type: 'VIDEO',
    resource_id: data.data?.video?.id,
    resource_name: req.body.title
  })),
  adminController.createVideo
);

router.get('/getAllVideos', adminController.getAllVideos);

router.put('/updateVideoStatus/:videoId',
  withAdminLog('VIDEO_UPDATE_STATUS', (req) => ({
    resource_type: 'VIDEO',
    resource_id: req.params.videoId,
    resource_name: req.body.status
  })),
  adminController.updateVideoStatus
);

router.put('/updateVideoProgress/:videoId',
  withAdminLog('VIDEO_UPDATE_PROGRESS', (req) => ({
    resource_type: 'VIDEO',
    resource_id: req.params.videoId,
    resource_name: String(req.body.progress)
  })),
  adminController.updateVideoProgress
);

router.delete('/deleteVideo/:videoId',
  withAdminLog('VIDEO_DELETE', (req, data) => ({
    resource_type: 'VIDEO',
    resource_id: req.params.videoId,
    resource_name: data.data?.title
  })),
  adminController.deleteVideo
);

router.put('/updateVideo/:videoId',
  withAdminLog('VIDEO_UPDATE', (req) => ({
    resource_type: 'VIDEO',
    resource_id: req.params.videoId,
    resource_name: req.body.title
  })),
  adminController.updateVideo
);

router.put('/toggleGalleryStatus/:galleryId',
  withAdminLog('GALLERY_UPDATE', (req) => ({
    resource_type: 'GALLERY',
    resource_id: req.params.galleryId,
    resource_name: `status: ${req.body.status}`
  })),
  adminController.toggleGalleryStatus
);
router.put('/updateGallery/:galleryId',
  withAdminLog('GALLERY_UPDATE', (req) => ({
    resource_type: 'GALLERY',
    resource_id: req.params.galleryId,
    resource_name: req.body.title
  })),
  adminController.updateGallery
);
router.get('/getGalleryImages/:galleryId', adminController.getGalleryImages);
router.delete('/deleteGalleryImage/:imageId', adminController.deleteGalleryImage);
router.post('/addImagesToGallery/:galleryId', uploadGaleria, adminController.addImagesToGallery);
router.post('/createGalleryMeta', adminController.createGalleryMeta);
router.post('/finalizeGallery/:galleryId', adminController.finalizeGallery);

router.get('/getStats', adminController.getStats);

router.get('/public-content/getPublicGalleries', uploadGaleria, adminController.getPublicGalleries);
router.post('/public-content/createPublicGallery', uploadGaleria, adminController.createPublicGallery);

router.get('/client-selections', adminController.getClientSelections);
router.get('/client-selections/:galleryId/images', adminController.getSelectionImages);
router.post('/client-selections/:galleryId/cancel',
  withAdminLog('SELECTION_CANCEL', (req) => ({
    resource_type: 'SELECTION',
    resource_id: req.params.galleryId
  })),
  adminController.cancelSelection
);

router.get('/comments', adminController.getAllComments);
router.post('/comments/:id/seen',
  withAdminLog('COMMENT_SEEN', (req) => ({
    resource_type: 'COMMENT',
    resource_id: req.params.id
  })),
  adminController.markCommentSeen
);
router.get('/requests', adminController.getAllRequests);
router.put('/requests/:id',
  withAdminLog('REQUEST_UPDATE', (req) => ({
    resource_type: 'REQUEST',
    resource_id: req.params.id,
    resource_name: req.body.status
  })),
  adminController.updateRequest
);

router.get('/reviews', adminController.getAllReviews);
router.delete('/reviews/:id', withAdminLog('REVIEW_DELETE', (req) => ({
  resource_type: 'REVIEW',
  resource_id: req.params.id
})), adminController.deleteReview);

router.get('/song-selections', adminController.getAllSongSelections);

router.get('/notifications', adminController.getNotifications);
router.post('/notifications/:id/read', adminController.markNotificationRead);
router.post('/notifications/read-all', adminController.markAllNotificationsRead);

module.exports = router;