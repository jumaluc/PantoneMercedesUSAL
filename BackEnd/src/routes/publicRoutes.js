const express = require('express');
const router = express.Router();
const publicController = require('../controllers/PublicController');

// Rutas públicas (acceso sin autenticación)
router.get('/company-info', publicController.getCompanyInfo);
router.get('/projects', publicController.getPublicProjects);
router.get('/testimonials', publicController.getTestimonials);
router.get('/faqs', publicController.getFAQs);
router.get('/service-policies', publicController.getServicePolicies);

module.exports = router;