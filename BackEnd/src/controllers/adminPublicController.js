const PublicContent = require('../moduls/PublicContent');

const adminPublicController = {

    // Company Info Management
    getCompanyInfo: async (req, res) => {
        try {
            const user = req.session.user;
            if (!user || user.role !== 'admin') {
                return res.status(401).json({ message: 'Acceso no autorizado' });
            }

            const companyInfo = await PublicContent.getCompanyInfo();
            res.status(200).json({
                success: true,
                data: companyInfo
            });
        } catch (error) {
            console.error('Error getting company info:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener información de la empresa'
            });
        }
    },

    updateCompanyInfo: async (req, res) => {
        try {
            const user = req.session.user;
            if (!user || user.role !== 'admin') {
                return res.status(401).json({ message: 'Acceso no autorizado' });
            }

            const result = await PublicContent.updateCompanyInfo(req.body);
            
            if (result) {
                res.status(200).json({
                    success: true,
                    message: 'Información de la empresa actualizada correctamente'
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: 'Error al actualizar la información'
                });
            }
        } catch (error) {
            console.error('Error updating company info:', error);
            res.status(500).json({
                success: false,
                message: 'Error al actualizar información de la empresa'
            });
        }
    },

    // Projects Management
    getAllProjects: async (req, res) => {
        try {
            const user = req.session.user;
            if (!user || user.role !== 'admin') {
                return res.status(401).json({ message: 'Acceso no autorizado' });
            }

            const projects = await PublicContent.getAllProjects();
            res.status(200).json({
                success: true,
                data: projects
            });
        } catch (error) {
            console.error('Error getting all projects:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener proyectos'
            });
        }
    },

    createProject: async (req, res) => {
        try {
            const user = req.session.user;
            if (!user || user.role !== 'admin') {
                return res.status(401).json({ message: 'Acceso no autorizado' });
            }

            const projectId = await PublicContent.createProject(req.body);
            
            if (projectId) {
                res.status(201).json({
                    success: true,
                    message: 'Proyecto creado correctamente',
                    data: { id: projectId }
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: 'Error al crear el proyecto'
                });
            }
        } catch (error) {
            console.error('Error creating project:', error);
            res.status(500).json({
                success: false,
                message: 'Error al crear proyecto'
            });
        }
    },

    updateProject: async (req, res) => {
        try {
            const user = req.session.user;
            if (!user || user.role !== 'admin') {
                return res.status(401).json({ message: 'Acceso no autorizado' });
            }

            const { id } = req.params;
            const result = await PublicContent.updateProject(id, req.body);
            
            if (result) {
                res.status(200).json({
                    success: true,
                    message: 'Proyecto actualizado correctamente'
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: 'Error al actualizar el proyecto'
                });
            }
        } catch (error) {
            console.error('Error updating project:', error);
            res.status(500).json({
                success: false,
                message: 'Error al actualizar proyecto'
            });
        }
    },

    deleteProject: async (req, res) => {
        try {
            const user = req.session.user;
            if (!user || user.role !== 'admin') {
                return res.status(401).json({ message: 'Acceso no autorizado' });
            }

            const { id } = req.params;
            const result = await PublicContent.deleteProject(id);
            
            if (result) {
                res.status(200).json({
                    success: true,
                    message: 'Proyecto eliminado correctamente'
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: 'Error al eliminar el proyecto'
                });
            }
        } catch (error) {
            console.error('Error deleting project:', error);
            res.status(500).json({
                success: false,
                message: 'Error al eliminar proyecto'
            });
        }
    },

    // Testimonials Management (mismos métodos para FAQs y Service Policies)
    getAllTestimonials: async (req, res) => {
        try {
            const user = req.session.user;
            if (!user || user.role !== 'admin') {
                return res.status(401).json({ message: 'Acceso no autorizado' });
            }

            const testimonials = await PublicContent.getAllTestimonials();
            res.status(200).json({
                success: true,
                data: testimonials
            });
        } catch (error) {
            console.error('Error getting all testimonials:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener testimonios'
            });
        }
    },

    createTestimonial: async (req, res) => {
        try {
            const user = req.session.user;
            if (!user || user.role !== 'admin') {
                return res.status(401).json({ message: 'Acceso no autorizado' });
            }

            const testimonialId = await PublicContent.createTestimonial(req.body);
            
            if (testimonialId) {
                res.status(201).json({
                    success: true,
                    message: 'Testimonio creado correctamente',
                    data: { id: testimonialId }
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: 'Error al crear el testimonio'
                });
            }
        } catch (error) {
            console.error('Error creating testimonial:', error);
            res.status(500).json({
                success: false,
                message: 'Error al crear testimonio'
            });
        }
    },

    updateTestimonial: async (req, res) => {
        try {
            const user = req.session.user;
            if (!user || user.role !== 'admin') {
                return res.status(401).json({ message: 'Acceso no autorizado' });
            }

            const { id } = req.params;
            const result = await PublicContent.updateTestimonial(id, req.body);
            
            if (result) {
                res.status(200).json({
                    success: true,
                    message: 'Testimonio actualizado correctamente'
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: 'Error al actualizar el testimonio'
                });
            }
        } catch (error) {
            console.error('Error updating testimonial:', error);
            res.status(500).json({
                success: false,
                message: 'Error al actualizar testimonio'
            });
        }
    },

    deleteTestimonial: async (req, res) => {
        try {
            const user = req.session.user;
            if (!user || user.role !== 'admin') {
                return res.status(401).json({ message: 'Acceso no autorizado' });
            }

            const { id } = req.params;
            const result = await PublicContent.deleteTestimonial(id);
            
            if (result) {
                res.status(200).json({
                    success: true,
                    message: 'Testimonio eliminado correctamente'
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: 'Error al eliminar el testimonio'
                });
            }
        } catch (error) {
            console.error('Error deleting testimonial:', error);
            res.status(500).json({
                success: false,
                message: 'Error al eliminar testimonio'
            });
        }
    },

    // Similar methods for FAQs and Service Policies...
    getAllFAQs: async (req, res) => {
        try {
            const user = req.session.user;
            if (!user || user.role !== 'admin') {
                return res.status(401).json({ message: 'Acceso no autorizado' });
            }

            const faqs = await PublicContent.getAllFAQs();
            res.status(200).json({
                success: true,
                data: faqs
            });
        } catch (error) {
            console.error('Error getting all FAQs:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener FAQs'
            });
        }
    },

    createFAQ: async (req, res) => {
        try {
            const user = req.session.user;
            if (!user || user.role !== 'admin') {
                return res.status(401).json({ message: 'Acceso no autorizado' });
            }

            const faqId = await PublicContent.createFAQ(req.body);
            
            if (faqId) {
                res.status(201).json({
                    success: true,
                    message: 'FAQ creado correctamente',
                    data: { id: faqId }
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: 'Error al crear el FAQ'
                });
            }
        } catch (error) {
            console.error('Error creating FAQ:', error);
            res.status(500).json({
                success: false,
                message: 'Error al crear FAQ'
            });
        }
    },

    updateFAQ: async (req, res) => {
        try {
            const user = req.session.user;
            if (!user || user.role !== 'admin') {
                return res.status(401).json({ message: 'Acceso no autorizado' });
            }

            const { id } = req.params;
            const result = await PublicContent.updateFAQ(id, req.body);
            
            if (result) {
                res.status(200).json({
                    success: true,
                    message: 'FAQ actualizado correctamente'
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: 'Error al actualizar el FAQ'
                });
            }
        } catch (error) {
            console.error('Error updating FAQ:', error);
            res.status(500).json({
                success: false,
                message: 'Error al actualizar FAQ'
            });
        }
    },

    deleteFAQ: async (req, res) => {
        try {
            const user = req.session.user;
            if (!user || user.role !== 'admin') {
                return res.status(401).json({ message: 'Acceso no autorizado' });
            }

            const { id } = req.params;
            const result = await PublicContent.deleteFAQ(id);
            
            if (result) {
                res.status(200).json({
                    success: true,
                    message: 'FAQ eliminado correctamente'
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: 'Error al eliminar el FAQ'
                });
            }
        } catch (error) {
            console.error('Error deleting FAQ:', error);
            res.status(500).json({
                success: false,
                message: 'Error al eliminar FAQ'
            });
        }
    },

    // Service Policies Management
    getAllServicePolicies: async (req, res) => {
        try {
            const user = req.session.user;
            if (!user || user.role !== 'admin') {
                return res.status(401).json({ message: 'Acceso no autorizado' });
            }

            const policies = await PublicContent.getAllServicePolicies();
            res.status(200).json({
                success: true,
                data: policies
            });
        } catch (error) {
            console.error('Error getting all service policies:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener políticas de servicio'
            });
        }
    },

    createServicePolicy: async (req, res) => {
        try {
            const user = req.session.user;
            if (!user || user.role !== 'admin') {
                return res.status(401).json({ message: 'Acceso no autorizado' });
            }

            const policyId = await PublicContent.createServicePolicy(req.body);
            
            if (policyId) {
                res.status(201).json({
                    success: true,
                    message: 'Política de servicio creada correctamente',
                    data: { id: policyId }
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: 'Error al crear la política de servicio'
                });
            }
        } catch (error) {
            console.error('Error creating service policy:', error);
            res.status(500).json({
                success: false,
                message: 'Error al crear política de servicio'
            });
        }
    },

    updateServicePolicy: async (req, res) => {
        try {
            const user = req.session.user;
            if (!user || user.role !== 'admin') {
                return res.status(401).json({ message: 'Acceso no autorizado' });
            }

            const { id } = req.params;
            const result = await PublicContent.updateServicePolicy(id, req.body);
            
            if (result) {
                res.status(200).json({
                    success: true,
                    message: 'Política de servicio actualizada correctamente'
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: 'Error al actualizar la política de servicio'
                });
            }
        } catch (error) {
            console.error('Error updating service policy:', error);
            res.status(500).json({
                success: false,
                message: 'Error al actualizar política de servicio'
            });
        }
    },

    deleteServicePolicy: async (req, res) => {
        try {
            const user = req.session.user;
            if (!user || user.role !== 'admin') {
                return res.status(401).json({ message: 'Acceso no autorizado' });
            }

            const { id } = req.params;
            const result = await PublicContent.deleteServicePolicy(id);
            
            if (result) {
                res.status(200).json({
                    success: true,
                    message: 'Política de servicio eliminada correctamente'
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: 'Error al eliminar la política de servicio'
                });
            }
        } catch (error) {
            console.error('Error deleting service policy:', error);
            res.status(500).json({
                success: false,
                message: 'Error al eliminar política de servicio'
            });
        }
    }
};

module.exports = adminPublicController;