const express = require('express');
const router = express.Router();
const publicController = require('../controllers/PublicController');

// Rutas públicas (acceso sin autenticación)
router.get('/company-info', publicController.getCompanyInfo);
router.get('/projects', publicController.getPublicProjects);
router.get('/testimonials', publicController.getTestimonials);
router.get('/reviews', publicController.getPublicReviews);
router.get('/faqs', publicController.getFAQs);
router.get('/service-policies', publicController.getServicePolicies);
router.get('/gallery/:serviceType', publicController.getPublicGallery);
router.get('/galleries/category/:serviceType', publicController.getPublicGalleryByServiceType);
router.get('/galleries', publicController.getPublicGalleries);

module.exports = router;