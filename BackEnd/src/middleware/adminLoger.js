// middleware/adminLogger.js
const AdminLog = require('../moduls/AdminLog');
const User = require('../moduls/Users');

const logAdminAction = async (req, action_type, resource_type = null, resource_id = null, resource_name = null, additional_data = {}) => {
    try {
        if (req.session.user && req.session.user.role === 'admin') {
            // Crear descripción automática basada en el tipo de acción
            const actionDescriptions = {
                'CLIENT_CREATE': `Creó el cliente: ${resource_name || 'Nuevo cliente'}`,
                'CLIENT_UPDATE': `Actualizó el cliente: ${resource_name || resource_id}`,
                'CLIENT_DELETE': `Eliminó el cliente: ${resource_name || resource_id}`,
                'GALLERY_CREATE': `Creó galería: ${resource_name || 'Nueva galería'}`,
                'GALLERY_UPDATE': `Actualizó galería: ${resource_name || resource_id}`,
                'GALLERY_DELETE': `Eliminó galería: ${resource_name || resource_id}`,
                'GALLERY_VIEW': `Vió lista de galerías`,
                'VIDEO_CREATE': `Creó el video: ${resource_name || 'Nuevo video'}`,
                'VIDEO_UPDATE': `Editó el video: ${resource_name || resource_id}`,
                'VIDEO_UPDATE_STATUS': `Actualizó estado del video #${resource_id}${resource_name ? ` → ${resource_name}` : ''}`,
                'VIDEO_UPDATE_PROGRESS': `Actualizó progreso del video #${resource_id}${resource_name ? ` al ${resource_name}%` : ''}`,
                'VIDEO_DELETE': `Eliminó el video: ${resource_name || `#${resource_id}`}`,
                'COMMENT_SEEN': `Marcó comentario #${resource_id} como visto`,
                'REQUEST_UPDATE': `Actualizó solicitud #${resource_id}${resource_name ? ` → ${resource_name}` : ''}`,
                'SELECTION_CANCEL': `Canceló la selección de la galería #${resource_id}`,
            };

            const action_description = actionDescriptions[action_type] || action_type;

            const adminUser = await User.getUser(req.session.user.id);
            const adminName = adminUser
                ? `${adminUser.first_name} ${adminUser.last_name}`
                : `Admin #${req.session.user.id}`;

            await AdminLog.createLog({
                admin_id: req.session.user.id,
                admin_name: adminName,
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