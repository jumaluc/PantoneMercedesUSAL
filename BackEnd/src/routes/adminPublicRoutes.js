const express = require('express');
const router = express.Router();
const adminPublicController = require('../controllers/adminPublicController');

// Rutas administrativas (requieren autenticación de admin)
router.get('/company-info', adminPublicController.getCompanyInfo);
router.put('/company-info', adminPublicController.updateCompanyInfo);

// Proyectos
router.get('/projects', adminPublicController.getAllProjects);
router.post('/projects', adminPublicController.createProject);
router.put('/projects/:id', adminPublicController.updateProject);
router.delete('/projects/:id', adminPublicController.deleteProject);

// Testimonios
router.get('/testimonials', adminPublicController.getAllTestimonials);
router.post('/testimonials', adminPublicController.createTestimonial);
router.put('/testimonials/:id', adminPublicController.updateTestimonial);
router.delete('/testimonials/:id', adminPublicController.deleteTestimonial);

// FAQs
router.get('/faqs', adminPublicController.getAllFAQs);
router.post('/faqs', adminPublicController.createFAQ);
router.put('/faqs/:id', adminPublicController.updateFAQ);
router.delete('/faqs/:id', adminPublicController.deleteFAQ);

// Políticas de servicio
router.get('/service-policies', adminPublicController.getAllServicePolicies);
router.post('/service-policies', adminPublicController.createServicePolicy);
router.put('/service-policies/:id', adminPublicController.updateServicePolicy);
router.delete('/service-policies/:id', adminPublicController.deleteServicePolicy);

module.exports = router;