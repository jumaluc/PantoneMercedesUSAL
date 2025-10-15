const PublicContent = require('../moduls/PublicContent');

const publicController = {

    // Información de la empresa
    getCompanyInfo: async (req, res) => {
        try {
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

    // Proyectos públicos
    getPublicProjects: async (req, res) => {
        try {
            const { featured } = req.query;
            const featuredOnly = featured === 'true';
            
            const projects = await PublicContent.getPublicProjects(featuredOnly);
            res.status(200).json({
                success: true,
                data: projects
            });
        } catch (error) {
            console.error('Error getting public projects:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener proyectos públicos'
            });
        }
    },

    // Testimonios
    getTestimonials: async (req, res) => {
        try {
            const { featured } = req.query;
            const featuredOnly = featured === 'true';
            
            const testimonials = await PublicContent.getTestimonials(featuredOnly);
            res.status(200).json({
                success: true,
                data: testimonials
            });
        } catch (error) {
            console.error('Error getting testimonials:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener testimonios'
            });
        }
    },

    // FAQs
    getFAQs: async (req, res) => {
        try {
            const faqs = await PublicContent.getFAQs();
            res.status(200).json({
                success: true,
                data: faqs
            });
        } catch (error) {
            console.error('Error getting FAQs:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener preguntas frecuentes'
            });
        }
    },

    // Políticas de servicio
    getServicePolicies: async (req, res) => {
        try {
            const policies = await PublicContent.getServicePolicies();
            res.status(200).json({
                success: true,
                data: policies
            });
        } catch (error) {
            console.error('Error getting service policies:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener políticas de servicio'
            });
        }
    }
};

module.exports = publicController;