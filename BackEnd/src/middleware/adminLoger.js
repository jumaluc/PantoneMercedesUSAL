// middleware/adminLogger.js
const AdminLog = require('../moduls/AdminLog');

const logAdminAction = async (req, action_type, resource_type = null, resource_id = null, resource_name = null, additional_data = {}) => {
    try {
        if (req.session.user && req.session.user.role === 'admin') {
            // Crear descripción automática basada en el tipo de acción
            const actionDescriptions = {
                'CLIENT_CREATE': `Creó el cliente: ${resource_name || 'Nuevo cliente'}`,
                'CLIENT_UPDATE': `Actualizó el cliente: ${resource_name || resource_id}`,
                'CLIENT_DELETE': `Eliminó el cliente: ${resource_name || resource_id}`,
                'GALLERY_CREATE': `Creó galería: ${resource_name || 'Nueva galería'}`,
                'GALLERY_DELETE': `Eliminó galería: ${resource_name || resource_id}`,
                'GALLERY_VIEW': `Vió lista de galerías`
            };

            const action_description = actionDescriptions[action_type] || action_type;

            await AdminLog.createLog({
                admin_id: req.session.user.id,
                admin_name: `${req.session.user.first_name} ${req.session.user.last_name}`,
                action_type: action_type,
                action_description: action_description,
                resource_type: resource_type,
                resource_id: resource_id,
                resource_name: resource_name,
                ip_address: req.ip || req.connection.remoteAddress,
                user_agent: req.get('User-Agent'),
                additional_data: {
                    ...additional_data,
                    url: req.originalUrl,
                    method: req.method
                }
            });
        }
    } catch (error) {
        console.error('Error logging admin action:', error);
        // No lanzar error para no interrumpir la operación principal
    }
};

// Middleware para logging automático
const withAdminLog = (action_type, getResourceDataFn = null) => {
    return async (req, res, next) => {
        // Guardar referencia original
        const originalJson = res.json;
        
        res.json = async function(data) {
            // Llamar a la función original
            originalJson.call(this, data);
            
            // Loggear después de enviar la respuesta (no bloqueante)
            if (res.statusCode >= 200 && res.statusCode < 300) {
                try {
                    let resource_type = null;
                    let resource_id = null;
                    let resource_name = null;
                    let additional_data = {};

                    if (getResourceDataFn) {
                        const resourceData = getResourceDataFn(req, data);
                        resource_type = resourceData.resource_type;
                        resource_id = resourceData.resource_id;
                        resource_name = resourceData.resource_name;
                        additional_data = resourceData.additional_data || {};
                    }

                    await logAdminAction(req, action_type, resource_type, resource_id, resource_name, additional_data);
                } catch (error) {
                    console.error('Error in admin logger middleware:', error);
                }
            }
        };
        
        next();
    };
};

module.exports = { logAdminAction, withAdminLog };