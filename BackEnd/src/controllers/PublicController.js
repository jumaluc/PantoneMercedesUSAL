const PublicContent = require('../moduls/PublicContent');
const Gallery = require('../moduls/Galleries')
const Gallery_images = require('../moduls/Gallery_images')

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
    },
    getPublicGallery: async (req, res) => {
    try {
        const { serviceType } = req.params;
        
        // Buscar galería por service_type
        const gallery = await Gallery.getGalleryByServiceTypes(serviceType);
        
        if (!gallery) {
            return res.status(404).json({
                success: false,
                message: 'Galería no encontrada'
            });
        }

        // Obtener imágenes de la galería
        const images = await Gallery_images.getByGalleryId(gallery.id);
        
        res.status(200).json({
            success: true,
            data: {
                gallery,
                images
            }
        });
    } catch (error) {
        console.error('Error getting public gallery:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener la galería'
        });
    }
},
getPublicGalleryByServiceType : async(req,res) =>{
    try {
        const { serviceType } = req.params;
        
        // Buscar todas las galerías con este service_type
        const galleries = await Gallery.getGalleryByServiceTypes(serviceType);
        
        if (!galleries || galleries.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'No se encontraron galerías para esta categoría' 
            });
        }

        // Para cada galería, obtener sus imágenes
        const galleriesWithImages = await Promise.all(
            galleries.map(async (gallery) => {
                const images = await Gallery_images.getAllImagesPathGallery(gallery.id);
                return {
                    ...gallery,
                    images: images || []
                };
            })
        );

        res.json({
            success: true,
            data: galleriesWithImages
        });

    } catch (error) {
        console.error('Error fetching category galleries:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error del servidor' 
        });
    }

},
getPublicGalleries : async(req,res) =>{
    try {
        console.log("ENTRO ! ")
        // Buscar todas las galerías públicas (que empiecen con "public-")
        const galleries = await Gallery.getPublicGalleries();
        
        console.log(galleries)
        if(!galleries)return res.status(405).json({message : 'No se encontraron galerias'})

        const galleriesWithImages = await Promise.all(
            galleries.map(async (gallery) => {
                const images = await Gallery_images.getAllImagesPathGallery(gallery.id);
                return {
                    ...gallery,
                    images: images || []
                };
            })
        );
        console.log(galleriesWithImages)
        if(!galleriesWithImages)return res.status(406).json({message : 'No se encontraron imagenes'})
        res.json({
            success: true,
            data: galleriesWithImages
        });

    } catch (error) {
        console.error('Error fetching public galleries:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error del servidor' 
        });
    }
}
};

module.exports = publicController;