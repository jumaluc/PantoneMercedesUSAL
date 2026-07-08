// controllers/adminControllers.js
const User = require('../moduls/Users');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const { uploadFile, getFileUrls, deleteFile, checkCredentials, uploadVideoToGCS, uploadThumbnailToGCS, bucket} = require('../utils/googleStorageService');
const archiver = require('archiver');
const Gallery = require('../moduls/Galleries');
const Gallery_images = require('../moduls/Gallery_images');
const path = require('path');
const AdminLog = require('../moduls/AdminLog');
const Video = require('../moduls/Video')
const Stats = require('../moduls/Stats')
const Reviews = require('../moduls/Reviews')
const SongSelection = require('../moduls/SongSelection')
const Notification = require('../moduls/Notification')
const adminController = {

    getAllClients: async (req, res) => {
        try {
            const user = req.session.user;
            if (!user || user.role !== 'admin') return res.status(401).json({ message: 'Acceso no autorizado' });
            
            const allClients = await User.getAllClients();
            res.status(200).json({ data: allClients });
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: 'Error del servidor' });
        }
    },

    createClient: async (req, res) => {
        try {
            const user = req.session.user;
            if (!user || user.role !== 'admin') return res.status(401).json({ message: 'Acceso no autorizado' });
            
            const { first_name, last_name, email, number, service, password } = req.body;
            const hashPassword = await bcrypt.hash(password, 10);
            const result = await User.registerUser(first_name, last_name, email, number, service, hashPassword);
            
            if (result === 0) return res.status(500).json({ message: "Error en el servidor" });
            Stats.addStat(req.session.user.id, 'admin', 'create', 'creó un nuevo cliente', 'complete').catch(err => console.error('Stats error:', err));
            res.status(200).json({ 
                message: 'Cliente creado correctamente',
                data: { id: result.insertId }
            });
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: 'Error del servidor' });
        }
    },

    updateClient: async (req, res) => {
        try {
            const user = req.session.user;
            if (!user || user.role !== 'admin') return res.status(401).json({ message: 'Acceso no autorizado' });
            
            const { id, first_name, last_name, email, number, service } = req.body;
            const result = await User.editProfile(id, first_name, last_name, email, number, service);
            Stats.addStat(req.session.user.id, 'admin', 'update', 'actualizó un cliente', 'complete').catch(err => console.error('Stats error:', err));
            if (result === 1) {
                Notification.create(parseInt(id), 'profile_updated', 'Tu perfil fue actualizado', 'Un administrador realizó cambios en los datos de tu perfil.').catch(err => console.error('Notif error:', err));
                res.status(200).json({
                    message: "Perfil actualizado correctamente",
                    data: {
                        id: id,
                        first_name: first_name,
                        last_name: last_name,
                        service: service,
                        email: email,
                        number: number
                    }
                });
            } else {
                res.status(400).json({ message: "Error al actualizar" });
            }
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: 'Error del servidor' });
        }
    },

    deleteClient: async (req, res) => {
        try {
            const user = req.session.user;
            if (!user || user.role !== 'admin') return res.status(401).json({ message: 'Acceso no autorizado' });
            
            const { clientId } = req.params;
            if (!clientId) {
                return res.status(400).json({ message: 'ID de cliente no proporcionado' });
            }

            // Obtener info del cliente antes de eliminar para el log
            const client = await User.findOne(clientId);
            const clientName = client ? `${client.first_name} ${client.last_name}` : 'Cliente desconocido';

            const result = await User.deleteClient(clientId);
            if (result === 0) return res.status(500).json({ message: "Error en el servidor" });
            Stats.addStat(req.session.user.id, 'admin', 'delete', 'eliminó un cliente', 'complete').catch(err => console.error('Stats error:', err));
            res.status(200).json({ 
                message: 'Cliente eliminado correctamente',
                data: { deleted_client: clientName }
            });
        } catch (err) {
            console.log(err);
            res.status(500).json({ message: 'Error del servidor' });
        }
    },

    createGallery: async (req, res) => {
        try {
            const user = req.session.user;
            if (!user || user.role !== 'admin') {
                return res.status(401).json({ message: 'Acceso no autorizado' });
            }
            
            if (!req.files || req.files.length === 0) {
                return res.status(400).json({ message: 'No se subieron imágenes' });
            }

            const { id, title, service, description, status = 'active' } = req.body;

            if (!id || !title || !service) {
                return res.status(400).json({ 
                    message: 'client_id, title y service_type son obligatorios' 
                });
            }

            const client = await User.findOne(id);
            if (!client) {
                return res.status(404).json({ message: 'Cliente no encontrado' });
            }

            const safeClientName = `${client.first_name}${client.last_name}`
                .replace(/[^a-zA-Z0-9]/g, '-')
                .toLowerCase();
            const folderName = `${id}-${safeClientName}`;

            const uploadedImages = [];
            let photoCount = 0;

            for (const file of req.files) {
                try {
                    const fileExtension = path.extname(file.originalname);
                    const uniqueFileName = `${uuidv4()}${fileExtension}`;
                    const isPrimary = photoCount === 0;

                    const uploadResult = await uploadFile(
                        file.buffer,
                        uniqueFileName,
                        folderName,
                        file.mimetype
                    );

                    if (uploadResult.success) {
                        uploadedImages.push({
                            originalName: file.originalname,
                            storageName: uniqueFileName,
                            url: uploadResult.url,
                            path: uploadResult.path,
                            isPrimary: isPrimary
                        });
                        photoCount++;
                    } else {
                        console.error('Error subiendo archivo:', uploadResult.error);
                    }
                } catch (fileError) {
                    console.error('Error procesando archivo:', fileError);
                }
            }

            if (uploadedImages.length === 0) {
                return res.status(500).json({ message: 'Error al subir las imágenes' });
            }

            const newGallery = await Gallery.newGallery(
                id, title, service, description, status, 
                uploadedImages.length, uploadedImages[0].url, folderName, user.id
            );

            if (!newGallery || newGallery === 0) {
                return res.status(500).json({ message: 'Error en el servidor' });
            }

            const galleryImages = uploadedImages.map(img => ({
                gallery_id: newGallery.insertId,
                original_name: img.originalName,
                storage_name: img.storageName,
                image_url: img.url,
                storage_path: img.path,
                is_primary: img.isPrimary,
                upload_order: img.isPrimary ? 0 : parseInt(img.storageName.split('.')[0])
            }));

            for (const img of galleryImages) {
                const result = await Gallery_images.createImage(
                    img.gallery_id,
                    img.original_name,
                    img.storage_name,
                    img.image_url,
                    img.storage_path,
                    img.is_primary,
                    img.upload_order
                );
                
                if (!result || result.affectedRows === 0) {
                    console.error('Error insertando imagen:', img.storage_name);
                }
            }
            Stats.addStat(req.session.user.id, 'admin', 'create', 'creó una nueva galería', 'complete').catch(err => console.error('Stats error:', err));
            Notification.create(parseInt(id), 'gallery_created', '¡Nueva galería disponible!', `Se creó tu galería "${title}" con ${uploadedImages.length} foto${uploadedImages.length !== 1 ? 's' : ''}.`).catch(err => console.error('Notif error:', err));
            res.status(201).json({
                message: 'Galería creada exitosamente',
                data: {
                    gallery: newGallery,
                    images: uploadedImages,
                    total_images: uploadedImages.length,
                    folder: folderName
                }
            });

        } catch (err) {
            console.error('Error en createGallery:', err);
            res.status(500).json({ message: 'Error del servidor' });
        }
    },

    getAllGalleries: async (req, res) => {
        try {
            const user = req.session.user;
            if (!user || user.role !== 'admin') {
                return res.status(401).json({ message: 'Acceso no autorizado' });
            }

            const galleries = await Gallery.getAllGalleries();
            const galleriesWithClients = await Promise.all(
                galleries.map(async (gal) => {
                    const client = await User.findOne(gal.client_id);
                    return {
                        ...gal,
                        client: client
                    };
                })
            );

            if (!galleriesWithClients) {
                return res.status(500).json({ message: 'Error en el servidor' });
            }

            res.status(200).json(galleriesWithClients);
        } catch (err) {
            console.log(err);
            res.status(500).json({ message: 'Error en el servidor' });
        }
    },

    deleteGallery: async (req, res) => {
        try {
            const user = req.session.user;
            if (!user || user.role !== 'admin') {
                return res.status(401).json({ message: 'Acceso no autorizado' });
            }

            const { galleryId } = req.params;
            
            // Obtener info de la galería antes de eliminar para el log
            const gallery = await Gallery.getGalleryById(galleryId);
            const galleryName = gallery ? gallery.title : 'Galería desconocida';

            const allFilePath = await Gallery_images.getAllImagesPathGallery(galleryId);
            const resultDeleteGallery = await Gallery.deleteGallery(galleryId);

            // Eliminar archivos de storage
            for (const path of allFilePath) {
                try {
                    await deleteFile(path.file_path);
                } catch (deleteError) {
                    console.error('Error eliminando archivo:', deleteError);
                }
            }

            if (!resultDeleteGallery || resultDeleteGallery === 0) {
                return res.status(500).json({ message: 'Error al eliminar la galería' });
            }
            Stats.addStat(req.session.user.id, 'admin', 'delete', 'eliminó una galería', 'complete').catch(err => console.error('Stats error:', err));
            res.status(200).json({ 
                message: 'Galería eliminada correctamente',
                data: { deleted_gallery: galleryName, deleted_files: allFilePath.length }
            });

        } catch (err) {
            console.log(err);
            res.status(500).json({ message: 'Error del servidor' });
        }
    },

    getDashboardStats: async (req, res) => {
        try {
            const user = req.session.user;
            if (!user || user.role !== 'admin') {
                return res.status(401).json({ message: 'Acceso no autorizado' });
            }

            const { range = 'today' } = req.query;
            
            // Obtener estadísticas según el rango de tiempo
            const stats = await adminController.calculateDashboardStats(range);
            
            res.status(200).json({
                success: true,
                data: stats
            });
        } catch (error) {
            console.error('Error getting dashboard stats:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener estadísticas del dashboard'
            });
        }
    },

    calculateDashboardStats: async (range) => {
        try {
            const today = new Date();
            const startDate = new Date();
            
            // Calcular fechas según el rango
            switch (range) {
                case 'week':
                    startDate.setDate(today.getDate() - 7);
                    break;
                case 'month':
                    startDate.setMonth(today.getMonth() - 1);
                    break;
                default: // today
                    startDate.setHours(0, 0, 0, 0);
            }

            // Obtener datos en paralelo para mejor performance
            const [
                todayStats,
                weekStats,
                recentActivity,
                actionSummary
            ] = await Promise.all([
                adminController.getTodayStats(),
                adminController.getWeekStats(),
                AdminLog.getRecentActivity(10),
                AdminLog.getActionSummary(startDate, today)
            ]);

            return {
                todayStats,
                weekStats,
                recentActivity: recentActivity || [],
                actionSummary: actionSummary || [],
                range
            };
        } catch (error) {
            console.error('Error calculating dashboard stats:', error);
            return {
                todayStats: {},
                weekStats: {},
                recentActivity: [],
                actionSummary: [],
                range
            };
        }
    },

    getTodayStats: async () => {
        try {
            const todayStart = new Date();
            todayStart.setHours(0, 0, 0, 0);
            
            const todayEnd = new Date();
            todayEnd.setHours(23, 59, 59, 999);

            const yesterdayStart = new Date(todayStart);
            yesterdayStart.setDate(yesterdayStart.getDate() - 1);
            const yesterdayEnd = new Date(todayStart);

            const [
                totalClients,
                newClientsToday,
                totalGalleries,
                newGalleriesToday,
                totalImages,
                newImagesToday,
                actionsToday,
                actionsYesterday
            ] = await Promise.all([
                User.getTotalClients ? await User.getTotalClients() : 0,
                User.getNewClientsCount ? await User.getNewClientsCount(todayStart, todayEnd) : 0,
                Gallery.getTotalGalleries ? await Gallery.getTotalGalleries() : 0,
                Gallery.getNewGalleriesCount ? await Gallery.getNewGalleriesCount(todayStart, todayEnd) : 0,
                Gallery_images.getTotalImages ? await Gallery_images.getTotalImages() : 0,
                Gallery_images.getNewImagesCount ? await Gallery_images.getNewImagesCount(todayStart, todayEnd) : 0,
                AdminLog.getActionsCount ? await AdminLog.getActionsCount(todayStart, todayEnd) : 0,
                AdminLog.getActionsCount ? await AdminLog.getActionsCount(yesterdayStart, yesterdayEnd) : 0
            ]);

            const actionsChange = actionsYesterday > 0 ? 
                Math.round(((actionsToday - actionsYesterday) / actionsYesterday) * 100) : 
                actionsToday > 0 ? 100 : 0;

            return {
                totalClients: totalClients || 0,
                newClients: newClientsToday || 0,
                totalGalleries: totalGalleries || 0,
                newGalleries: newGalleriesToday || 0,
                totalImages: totalImages || 0,
                newImages: newImagesToday || 0,
                totalActions: actionsToday || 0,
                actionsChange: actionsChange || 0
            };
        } catch (error) {
            console.error('Error getting today stats:', error);
            return {
                totalClients: 0,
                newClients: 0,
                totalGalleries: 0,
                newGalleries: 0,
                totalImages: 0,
                newImages: 0,
                totalActions: 0,
                actionsChange: 0
            };
        }
    },

    getWeekStats: async () => {
        try {
            const weekStart = new Date();
            weekStart.setDate(weekStart.getDate() - 7);
            
            const [
                clientsCreated,
                galleriesCreated,
                updatesPerformed,
                deletionsPerformed,
                totalActions
            ] = await Promise.all([
                User.getNewClientsCount ? await User.getNewClientsCount(weekStart, new Date()) : 0,
                Gallery.getNewGalleriesCount ? await Gallery.getNewGalleriesCount(weekStart, new Date()) : 0,
                AdminLog.getActionsCountByType ? await AdminLog.getActionsCountByType(weekStart, new Date(), 'UPDATE') : 0,
                AdminLog.getActionsCountByType ? await AdminLog.getActionsCountByType(weekStart, new Date(), 'DELETE') : 0,
                AdminLog.getActionsCount ? await AdminLog.getActionsCount(weekStart, new Date()) : 0
            ]);

            return {
                clientsCreated: clientsCreated || 0,
                galleriesCreated: galleriesCreated || 0,
                updatesPerformed: updatesPerformed || 0,
                deletionsPerformed: deletionsPerformed || 0,
                totalActions: totalActions || 0
            };
        } catch (error) {
            console.error('Error getting week stats:', error);
            return {
                clientsCreated: 0,
                galleriesCreated: 0,
                updatesPerformed: 0,
                deletionsPerformed: 0,
                totalActions: 0
            };
        }
    },

    getActivityLogs: async (req, res) => {
        try {
            const user = req.session.user;
            if (!user || user.role !== 'admin') {
                return res.status(401).json({ message: 'Acceso no autorizado' });
            }

            const { 
                page = 1, 
                limit = 50, 
                action_type, 
                admin_id, 
                start_date, 
                end_date 
            } = req.query;

            const filters = {
                page: parseInt(page),
                limit: parseInt(limit),
                action_type,
                admin_id,
                start_date,
                end_date
            };

            const logs = await AdminLog.getLogs(filters);
            const total = await AdminLog.getLogsCount(filters);

            res.status(200).json({
                success: true,
                data: {
                    logs,
                    pagination: {
                        page: filters.page,
                        limit: filters.limit,
                        total,
                        totalPages: Math.ceil(total / filters.limit)
                    }
                }
            });
        } catch (error) {
            console.error('Error getting activity logs:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener los logs de actividad'
            });
        }
    },

    getStatsSummary: async (req, res) => {
        try {
            const user = req.session.user;
            if (!user || user.role !== 'admin') {
                return res.status(401).json({ message: 'Acceso no autorizado' });
            }

            const { days = 30 } = req.query;
            const summary = await AdminLog.getStatsSummary(parseInt(days));

            res.status(200).json({
                success: true,
                data: summary
            });
        } catch (error) {
            console.error('Error getting stats summary:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener resumen de estadísticas'
            });
        }
    },

    getClientsGrowth: async (req, res) => {
        try {
            const user = req.session.user;
            if (!user || user.role !== 'admin') {
                return res.status(401).json({ message: 'Acceso no autorizado' });
            }

            const { days = 30 } = req.query;
            const growthData = await User.getClientsGrowth ? await User.getClientsGrowth(parseInt(days)) : [];

            res.status(200).json({
                success: true,
                data: growthData
            });
        } catch (error) {
            console.error('Error getting clients growth:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener crecimiento de clientes'
            });
        }
    },

    getGalleriesGrowth: async (req, res) => {
        try {
            const user = req.session.user;
            if (!user || user.role !== 'admin') {
                return res.status(401).json({ message: 'Acceso no autorizado' });
            }

            const { days = 30 } = req.query;
            const growthData = await Gallery.getGalleriesGrowth ? await Gallery.getGalleriesGrowth(parseInt(days)) : [];

            res.status(200).json({
                success: true,
                data: growthData
            });
        } catch (error) {
            console.error('Error getting galleries growth:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener crecimiento de galerías'
            });
        }
    },

    getActivityTimeline: async (req, res) => {
        try {
            const user = req.session.user;
            if (!user || user.role !== 'admin') {
                return res.status(401).json({ message: 'Acceso no autorizado' });
            }

            const { limit = 20 } = req.query;
            const timeline = await AdminLog.getRecentActivity(parseInt(limit));

            res.status(200).json({
                success: true,
                data: timeline
            });
        } catch (error) {
            console.error('Error getting activity timeline:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener timeline de actividad'
            });
        }
    },
createVideo: async (req, res) => {
    try {
      const user = req.session.user;
      if (!user || user.role !== 'admin') {
        return res.status(401).json({ message: 'Acceso no autorizado' });
      }

      const { client_id, title, description, estimated_delivery, status } = req.body;
      if (!client_id || !title) {
        return res.status(400).json({
          success: false,
          message: 'Cliente y título son obligatorios'
        });
      }

      const videoFile = req.files?.video?.[0];
      const thumbnailFile = req.files?.thumbnail?.[0];

      let videoUploadResult = null;
      if (videoFile) {
        videoUploadResult = await uploadVideoToGCS(videoFile, 'videos', client_id);
      }

      let thumbnailUploadResult = null;
      if (thumbnailFile) {
        thumbnailUploadResult = await uploadThumbnailToGCS(thumbnailFile, 'thumbnails', client_id);
      }

      const videoData = {
        user_id: parseInt(client_id),
        title: title.trim(),
        description: description?.trim() || '',
        estimated_delivery: estimated_delivery || null,
        status: status || 'waiting_selection',
        video_url: videoUploadResult?.url || null,
        file_name: videoUploadResult?.fileName || null,
        original_filename: videoFile?.originalname || null,
        file_size: videoFile?.size || null,
        format: videoFile?.mimetype || null,
        thumbnail_url: thumbnailUploadResult?.url || null,
        created_by: user.id,
      };

      const newVideo = await Video.create(videoData);
            Stats.addStat(req.session.user.id, 'admin', 'create', 'creó un nuevo video', 'complete').catch(err => console.error('Stats error:', err));
            Notification.create(parseInt(client_id), 'new_video', '¡Nuevo video disponible!', `Se subió un nuevo video: "${title.trim()}". Podés verlo en tu sección de videos.`).catch(err => console.error('Notif error:', err));
      res.status(201).json({
        success: true,
        message: 'Video creado correctamente',
        data: {
          video: newVideo
        }
      });

    } catch (error) {
      console.error('Error creating video:', error);

      res.status(500).json({
        success: false,
        message: error.message || 'Error al crear el video'
      });
    }
  },

  getAllVideos: async (req, res) => {
    try {
      const user = req.session.user;
      if (!user || user.role !== 'admin') {
        return res.status(401).json({ message: 'Acceso no autorizado' });
      }

      const videos = await Video.getAllWithClients();
      
      res.status(200).json({
        success: true,
        videos: videos
      });

    } catch (error) {
      console.error('Error getting videos:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener los videos'
      });
    }
  },

  updateVideoStatus: async (req, res) => {
    try {
      const user = req.session.user;
      if (!user || user.role !== 'admin') {
        return res.status(401).json({ message: 'Acceso no autorizado' });
      }

      const { videoId } = req.params;
      const { status } = req.body;

      const result = await Video.updateStatus(videoId, status);
            Stats.addStat(req.session.user.id, 'admin', 'update', 'actualizó status de video', 'complete').catch(err => console.error('Stats error:', err));
      if (result) {
        res.json({
          success: true,
          message: 'Estado del video actualizado'
        });
      } else {
        res.status(404).json({
          success: false,
          message: 'Video no encontrado'
        });
      }

    } catch (error) {
      console.error('Error updating video status:', error);
      res.status(500).json({
        success: false,
        message: 'Error al actualizar el estado'
      });
    }
  },

  deleteVideo: async (req, res) => {
    try {
      const user = req.session.user;
      if (!user || user.role !== 'admin') {
        return res.status(401).json({ message: 'Acceso no autorizado' });
      }

      const { videoId } = req.params;
      const video = await Video.getById(videoId);
      if (!video) {
        return res.status(404).json({
          success: false,
          message: 'Video no encontrado'
        });
      }

      if (video.file_name) {
        await deleteFile(video.file_name);
      }

      const result = await Video.deleteVideo(videoId);
            Stats.addStat(req.session.user.id, 'admin', 'delete', 'eliminó un video', 'complete').catch(err => console.error('Stats error:', err));
      if (result) {
        res.json({
          success: true,
          message: 'Video eliminado correctamente',
          data: { title: video.title }
        });
      } else {
        res.status(404).json({
          success: false,
          message: 'Error al eliminar el video'
        });
      }

    } catch (error) {
      console.error('Error deleting video:', error);
      res.status(500).json({
        success: false,
        message: 'Error al eliminar el video'
      });
    }
  },

getStats: async(req,res) =>{
    try{
        const user = req.session.user;
        if (!user || user.role !== 'admin') {
            return res.status(401).json({ success: false, message: 'Acceso no autorizado' });
        }

        const stats = await Stats.getAllStats();
        console.log("STATS: ", stats);
        
        if(!stats) {
            return res.status(500).json({ success: false, message: "Error en el servidor" });
        }
        
        return res.status(200).json({ 
            success: true, 
            data: stats  // CORREGIDO: Cambiado de 'stats' a 'data'
        });
    }
    catch(err){
        console.log(err);
        return res.status(500).json({ success: false, message: "Error interno del servidor" });
    }
},

getPublicGalleries: async (req, res) =>{
    try{
        console.log( 'entro al getZ====================================D')
        const user = req.session.user;
        if(!user || user.role !== 'admin')return res.status(404).json({message : 'Acceso no autorizado'});
        const galeries = await Gallery.getPublicGalleries();
        if(!galeries)return res.status(404).json({message : 'No se encontraron galerias'});
        console.log(galeries)
        return res.status(200).json({data : galeries});
    }
    catch(err){console.log(err)};
},

createPublicGallery: async (req, res) => {
    try {
        console.log("CREATE PUBLIC GALLERY - Iniciando");
        const user = req.session.user;
        if (!user || user.role !== 'admin') {
            return res.status(401).json({ message: 'Acceso no autorizado' });
        }
        
        console.log("Archivos recibidos:", req.files);
        console.log("Body recibido:", req.body);

        console.log(req.files);

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: 'No se subieron imágenes' });
        }

        const { title, service_type, description, status = 'active' } = req.body;
        
        // CORRECCIÓN: Cambié 'service' por 'service_type'
        if (!title || !service_type) {
            return res.status(400).json({ 
                message: 'title y service_type son obligatorios' 
            });
        }

        // Para galerías públicas, usamos el admin como "cliente"
        const adminId = user.id;
        
        // Crear folder name para galerías públicas
        const safeServiceName = service_type.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
        const folderName = `public-${safeServiceName}-${Date.now()}`;

        const uploadedImages = [];
        let photoCount = 0;

        for (const file of req.files) {
            try {
                const fileExtension = path.extname(file.originalname);
                const uniqueFileName = `${uuidv4()}${fileExtension}`;
                const isPrimary = photoCount === 0;

                console.log(`Subiendo archivo: ${file.originalname} como ${uniqueFileName}`);

                const uploadResult = await uploadFile(
                    file.buffer,
                    uniqueFileName,
                    folderName,
                    file.mimetype
                );

                if (uploadResult.success) {
                    uploadedImages.push({
                        originalName: file.originalname,
                        storageName: uniqueFileName,
                        url: uploadResult.url,
                        path: uploadResult.path,
                        isPrimary: isPrimary
                    });
                    photoCount++;
                    console.log(`Archivo subido exitosamente: ${uploadResult.url}`);
                } else {
                    console.error('Error subiendo archivo:', uploadResult.error);
                }
            } catch (fileError) {
                console.error('Error procesando archivo:', fileError);
            }
        }

        if (uploadedImages.length === 0) {
            return res.status(500).json({ message: 'Error al subir las imágenes' });
        }

        // CORRECCIÓN: Usar adminId como client_id para galerías públicas
        const newGallery = await Gallery.newGallery(
            adminId, // client_id (admin para galerías públicas)
            title, 
            service_type, 
            description, 
            status, 
            uploadedImages.length, 
            uploadedImages[0].url, 
            folderName, 
            user.id // created_by
        );

        if (!newGallery || newGallery === 0) {
            return res.status(500).json({ message: 'Error en el servidor al crear galería' });
        }

        console.log("Galería creada en BD con ID:", newGallery.insertId);

        const galleryImages = uploadedImages.map((img, index) => ({
            gallery_id: newGallery.insertId,
            original_name: img.originalName,
            storage_name: img.storageName,
            image_url: img.url,
            storage_path: img.path,
            is_primary: img.isPrimary,
            upload_order: index
        }));

        for (const img of galleryImages) {
            const result = await Gallery_images.createImage(
                img.gallery_id,
                img.original_name,
                img.storage_name,
                img.image_url,
                img.storage_path,
                img.is_primary,
                img.upload_order
            );
            
            if (!result || result.affectedRows === 0) {
                console.error('Error insertando imagen:', img.storage_name);
            } else {
                console.log("Imagen insertada en BD:", img.storage_name);
            }
        }

        Stats.addStat(user.id, 'admin', 'create', 'creó una nueva galería pública', 'complete').catch(err => console.error('Stats error:', err));

        console.log("Galería pública creada exitosamente");
        res.status(201).json({
            message: 'Galería pública creada exitosamente',
            data: {
                gallery: newGallery,
                images: uploadedImages,
                total_images: uploadedImages.length,
                folder: folderName
            }
        });

    } catch (err) {
        console.error('Error en createPublicGallery:', err);
        res.status(500).json({ message: 'Error del servidor: ' + err.message });
    }
},


getClientSelections: async (req, res) => {
    try {
        const user = req.session.user;
        if (!user || user.role !== 'admin') return res.status(401).json({ message: 'Acceso no autorizado' });

        const pool = require('../database/dbConnect');
        const [rows] = await pool.execute(`
            SELECT
                g.id AS gallery_id,
                g.title,
                g.service_type,
                g.client_id,
                u.first_name,
                u.last_name,
                u.email,
                COUNT(gi.id) AS selected_count,
                MAX(gi.updated_at) AS confirmed_at,
                ss.song_1,
                ss.song_2,
                ss.song_3,
                ss.let_admin_choose,
                ss.notes AS song_notes
            FROM galleries g
            JOIN users u ON g.client_id = u.id
            JOIN gallery_images gi ON g.id = gi.gallery_id AND gi.is_selected = 1
            LEFT JOIN song_selections ss ON ss.gallery_id = g.id AND ss.user_id = g.client_id
            GROUP BY g.id, g.title, g.service_type, g.client_id, u.first_name, u.last_name, u.email,
                     ss.song_1, ss.song_2, ss.song_3, ss.let_admin_choose, ss.notes
            ORDER BY confirmed_at DESC
        `);

        return res.status(200).json({ data: rows });
    } catch (err) {
        console.error('Error en getClientSelections:', err);
        return res.status(500).json({ message: 'Error interno del servidor' });
    }
},

getSelectionImages: async (req, res) => {
    try {
        const user = req.session.user;
        if (!user || user.role !== 'admin') return res.status(401).json({ message: 'Acceso no autorizado' });

        const { galleryId } = req.params;
        const images = await Gallery_images.getSelectedByGallery(galleryId);
        return res.status(200).json({ data: images });
    } catch (err) {
        console.error('Error en getSelectionImages:', err);
        return res.status(500).json({ message: 'Error interno del servidor' });
    }
},

downloadSelectionZip: async (req, res) => {
    try {
        const user = req.session.user;
        if (!user || user.role !== 'admin') return res.status(401).json({ message: 'Acceso no autorizado' });

        const { galleryId } = req.params;
        const images = await Gallery_images.getSelectedByGallery(galleryId);
        if (!images || images.length === 0) {
            return res.status(400).json({ success: false, message: 'No hay imágenes seleccionadas para descargar' });
        }

        const gallery = await Gallery.getGalleryById(galleryId);
        const safeTitle = (gallery?.title || 'seleccion').replace(/[^a-zA-Z0-9\-_ ]/g, '_');

        const archive = archiver('zip', { zlib: { level: 9 } });
        res.setHeader('Content-Disposition', `attachment; filename="${safeTitle}.zip"`);
        res.setHeader('Content-Type', 'application/zip');

        archive.on('error', (error) => {
            console.error('Error creando ZIP:', error);
            if (!res.headersSent) res.status(500).json({ success: false, message: 'Error al crear el archivo ZIP' });
        });

        archive.pipe(res);

        images.forEach((img, index) => {
            try {
                const cleanUrl = img.image_url.split('?')[0];
                const bucketName = bucket.name;
                const fileName = cleanUrl.substring(cleanUrl.indexOf(bucketName) + bucketName.length + 1);
                const file = bucket.file(fileName);
                const ext = fileName.split('.').pop() || 'jpg';
                const safeName = img.original_filename || `imagen_${index + 1}.${ext}`;
                archive.append(file.createReadStream(), { name: safeName });
            } catch (err) {
                console.error(`Error procesando imagen ${img.id}:`, err);
            }
        });

        archive.finalize();
        Stats.addStat(user.id, 'admin', 'download', `descargó ${images.length} fotos de la selección`, 'complete').catch(err => console.error('Stats error:', err));
    } catch (err) {
        console.error('Error en downloadSelectionZip:', err);
        if (!res.headersSent) res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
},

getAllComments: async (req, res) => {
    try {
        const user = req.session.user;
        if (!user || user.role !== 'admin') return res.status(401).json({ message: 'Acceso no autorizado' });
        const Comments = require('../moduls/Comments');
        const comments = await Comments.getAllForAdmin();
        return res.status(200).json({ success: true, data: comments });
    } catch (err) {
        console.error('Error en getAllComments:', err);
        return res.status(500).json({ message: 'Error interno del servidor' });
    }
},

markCommentSeen: async (req, res) => {
    try {
        const user = req.session.user;
        if (!user || user.role !== 'admin') return res.status(401).json({ message: 'Acceso no autorizado' });
        const { id } = req.params;
        const Comments = require('../moduls/Comments');
        const commentUserId = await Comments.getCommentUserId(id);
        await Comments.markAsSeen(id);
        const Stats = require('../moduls/Stats');
        Stats.addStat(user.id, 'admin', 'update', `marcó comentario #${id} como visto`, 'complete').catch(err => console.error('Stats error:', err));
        if (commentUserId) Notification.create(commentUserId, 'comment_seen', 'Tu comentario fue visto', 'El equipo de Pantone vio tu comentario en una foto de tu galería.').catch(err => console.error('Notif error:', err));
        return res.status(200).json({ success: true, message: 'Comentario marcado como visto' });
    } catch (err) {
        console.error('Error en markCommentSeen:', err);
        return res.status(500).json({ message: 'Error interno del servidor' });
    }
},

getAllRequests: async (req, res) => {
    try {
        const user = req.session.user;
        if (!user || user.role !== 'admin') return res.status(401).json({ message: 'Acceso no autorizado' });
        const General_requests = require('../moduls/General_requests');
        const requests = await General_requests.getAllForAdmin();
        return res.status(200).json({ success: true, data: requests });
    } catch (err) {
        console.error('Error en getAllRequests:', err);
        return res.status(500).json({ message: 'Error interno del servidor' });
    }
},

updateRequest: async (req, res) => {
    try {
        const user = req.session.user;
        if (!user || user.role !== 'admin') return res.status(401).json({ message: 'Acceso no autorizado' });
        const { id } = req.params;
        const { status, admin_response } = req.body;
        const General_requests = require('../moduls/General_requests');
        const reqUserId = await General_requests.getRequestUserId(id);
        await General_requests.updateRequest(id, status, admin_response);
        const Stats = require('../moduls/Stats');
        Stats.addStat(user.id, 'admin', 'update', `actualizó solicitud #${id} a "${status}"`, 'complete').catch(err => console.error('Stats error:', err));
        if (reqUserId && admin_response) Notification.create(reqUserId, 'request_response', 'Respuesta a tu solicitud', admin_response).catch(err => console.error('Notif error:', err));
        return res.status(200).json({ success: true, message: 'Solicitud actualizada' });
    } catch (err) {
        console.error('Error en updateRequest:', err);
        return res.status(500).json({ message: 'Error interno del servidor' });
    }
},

cancelSelection: async (req, res) => {
    try {
        const user = req.session.user;
        if (!user || user.role !== 'admin') return res.status(401).json({ message: 'Acceso no autorizado' });

        const { galleryId } = req.params;
        await Gallery_images.resetSelection(galleryId);
        await SongSelection.deleteByGallery(galleryId);

        const Stats = require('../moduls/Stats');
        Stats.addStat(user.id, 'admin', 'update', `canceló la selección de la galería ${galleryId}`, 'complete').catch(err => console.error('Stats error:', err));

        return res.status(200).json({ message: 'Selección cancelada correctamente' });
    } catch (err) {
        console.error('Error en cancelSelection:', err);
        return res.status(500).json({ message: 'Error interno del servidor' });
    }
},

updateVideo: async (req, res) => {
    try {
        const user = req.session.user;
        if (!user || user.role !== 'admin') return res.status(401).json({ message: 'Acceso no autorizado' });
        const { videoId } = req.params;
        const { title, description, estimated_delivery } = req.body;
        if (!title?.trim()) return res.status(400).json({ success: false, message: 'El título es obligatorio' });
        const result = await Video.update(videoId, { title: title.trim(), description: description?.trim() || '', estimated_delivery: estimated_delivery || null });
        if (!result) return res.status(404).json({ success: false, message: 'Video no encontrado' });
        res.json({ success: true, message: 'Video actualizado correctamente' });
    } catch (error) {
        console.error('Error updating video:', error);
        res.status(500).json({ success: false, message: 'Error al actualizar el video' });
    }
},

updateGallery: async (req, res) => {
    try {
        const user = req.session.user;
        if (!user || user.role !== 'admin') return res.status(401).json({ message: 'Acceso no autorizado' });
        const { galleryId } = req.params;
        const { title, description, status } = req.body;
        if (!title?.trim()) return res.status(400).json({ success: false, message: 'El título es obligatorio' });
        const result = await Gallery.update(galleryId, {
            title: title.trim(),
            description: description?.trim() || '',
            status: status || 'active'
        });
        if (!result) return res.status(404).json({ success: false, message: 'Galería no encontrada' });
        res.json({ success: true, message: 'Galería actualizada correctamente' });
    } catch (error) {
        console.error('Error en updateGallery:', error);
        res.status(500).json({ success: false, message: 'Error al actualizar la galería' });
    }
},

toggleGalleryStatus: async (req, res) => {
    try {
        const user = req.session.user;
        if (!user || user.role !== 'admin') return res.status(401).json({ message: 'Acceso no autorizado' });
        const { galleryId } = req.params;
        const { status } = req.body;
        if (!['active', 'inactive'].includes(status)) {
            return res.status(400).json({ success: false, message: 'Estado inválido' });
        }
        const result = await Gallery.updateStatus(galleryId, status);
        if (!result) return res.status(404).json({ success: false, message: 'Galería no encontrada' });
        res.json({ success: true, message: status === 'active' ? 'Galería activada' : 'Galería desactivada' });
    } catch (error) {
        console.error('Error en toggleGalleryStatus:', error);
        res.status(500).json({ success: false, message: 'Error al actualizar el estado de la galería' });
    }
},

getGalleryImages: async (req, res) => {
    try {
        const user = req.session.user;
        if (!user || user.role !== 'admin') return res.status(401).json({ message: 'Acceso no autorizado' });
        const { galleryId } = req.params;
        const images = await Gallery_images.getByGalleryId(galleryId);
        res.json({ success: true, data: images });
    } catch (error) {
        console.error('Error en getGalleryImages:', error);
        res.status(500).json({ success: false, message: 'Error al obtener las imágenes' });
    }
},

deleteGalleryImage: async (req, res) => {
    try {
        const user = req.session.user;
        if (!user || user.role !== 'admin') return res.status(401).json({ message: 'Acceso no autorizado' });
        const { imageId } = req.params;
        const result = await Gallery_images.deleteImage(imageId);
        if (!result) return res.status(404).json({ success: false, message: 'Imagen no encontrada' });
        res.json({ success: true, message: 'Imagen eliminada' });
    } catch (error) {
        console.error('Error en deleteGalleryImage:', error);
        res.status(500).json({ success: false, message: 'Error al eliminar la imagen' });
    }
},

addImagesToGallery: async (req, res) => {
    try {
        const user = req.session.user;
        if (!user || user.role !== 'admin') return res.status(401).json({ message: 'Acceso no autorizado' });
        if (!req.files || req.files.length === 0) return res.status(400).json({ success: false, message: 'No se enviaron imágenes' });
        const { galleryId } = req.params;
        const setFirstAsPrimary = req.body.isPrimary === 'true' || req.body.isPrimary === true;
        const gallery = await Gallery.getGalleryById(galleryId);
        if (!gallery) return res.status(404).json({ success: false, message: 'Galería no encontrada' });
        const folderName = gallery.folder_path || `gallery-${galleryId}`;
        let coverImageUrl = null;
        const results = await Promise.all(
            req.files.map(async (file, index) => {
                try {
                    const fileExtension = path.extname(file.originalname);
                    const uniqueFileName = `${uuidv4()}${fileExtension}`;
                    const isPrimary = setFirstAsPrimary && index === 0;
                    const uploadResult = await uploadFile(file.buffer, uniqueFileName, folderName, file.mimetype);
                    if (uploadResult.success) {
                        await Gallery_images.createImage(
                            parseInt(galleryId),
                            file.originalname,
                            uniqueFileName,
                            uploadResult.url,
                            uploadResult.path,
                            isPrimary,
                            isPrimary ? 0 : 999
                        );
                        if (isPrimary) coverImageUrl = uploadResult.url;
                        return true;
                    }
                    return false;
                } catch (fileError) {
                    console.error('Error procesando archivo:', fileError);
                    return false;
                }
            })
        );
        const added = results.filter(Boolean).length;
        if (added === 0) return res.status(500).json({ success: false, message: 'Error al subir las imágenes' });
        const allImages = await Gallery_images.getByGalleryId(galleryId);
        await Gallery.updatePhotosCount(galleryId, allImages.length);
        if (coverImageUrl) await Gallery.updateCoverImage(galleryId, coverImageUrl);
        res.json({ success: true, message: `${added} imagen(es) agregada(s)`, count: added, coverImageUrl });
    } catch (error) {
        console.error('Error en addImagesToGallery:', error);
        res.status(500).json({ success: false, message: 'Error al agregar las imágenes' });
    }
},

getAllReviews: async (req, res) => {
    try {
        const user = req.session.user;
        if (!user) return res.status(401).json({ message: 'Acceso denegado' });
        const reviews = await Reviews.getAllReviews(user.id);
        return res.status(200).json({ reviews });
    } catch (err) {
        console.error('Error en getAllReviews (admin):', err);
        return res.status(500).json({ message: 'Error interno del servidor' });
    }
},

deleteReview: async (req, res) => {
    try {
        const { id } = req.params;
        const result = await Reviews.deleteReview(id);
        if (!result) return res.status(404).json({ message: 'Reseña no encontrada' });
        return res.status(200).json({ message: 'Reseña eliminada correctamente' });
    } catch (err) {
        console.error('Error en deleteReview (admin):', err);
        return res.status(500).json({ message: 'Error interno del servidor' });
    }
},

getAllSongSelections: async (req, res) => {
    try {
        const user = req.session.user;
        if (!user || user.role !== 'admin') return res.status(401).json({ message: 'Acceso no autorizado' });
        const selections = await SongSelection.getAllForAdmin();
        return res.status(200).json({ data: selections });
    } catch (err) {
        console.error('Error en getAllSongSelections:', err);
        return res.status(500).json({ message: 'Error interno del servidor' });
    }
},

getNotifications: async (req, res) => {
    try {
        const user = req.session.user;
        if (!user) return res.status(401).json({ message: 'Acceso no autorizado' });
        const notifications = await Notification.getByUser(user.id);
        const unread = await Notification.getUnreadCount(user.id);
        return res.status(200).json({ notifications, unread });
    } catch (err) {
        console.error('Error en getNotifications (admin):', err);
        return res.status(500).json({ message: 'Error interno del servidor' });
    }
},

markNotificationRead: async (req, res) => {
    try {
        const user = req.session.user;
        if (!user) return res.status(401).json({ message: 'Acceso no autorizado' });
        const { id } = req.params;
        await Notification.markRead(id, user.id);
        return res.status(200).json({ success: true });
    } catch (err) {
        return res.status(500).json({ message: 'Error interno del servidor' });
    }
},

markAllNotificationsRead: async (req, res) => {
    try {
        const user = req.session.user;
        if (!user) return res.status(401).json({ message: 'Acceso no autorizado' });
        await Notification.markAllRead(user.id);
        return res.status(200).json({ success: true });
    } catch (err) {
        return res.status(500).json({ message: 'Error interno del servidor' });
    }
},

createGalleryMeta: async (req, res) => {
    try {
        const user = req.session.user;
        if (!user || user.role !== 'admin') return res.status(401).json({ message: 'Acceso no autorizado' });

        const { id, title, service, description, status = 'active' } = req.body;
        if (!id || !title || !service) {
            return res.status(400).json({ message: 'client_id, title y service_type son obligatorios' });
        }

        const client = await User.findOne(id);
        if (!client) return res.status(404).json({ message: 'Cliente no encontrado' });

        const safeClientName = `${client.first_name}${client.last_name}`
            .replace(/[^a-zA-Z0-9]/g, '-')
            .toLowerCase();
        const folderName = `${id}-${safeClientName}`;

        const newGallery = await Gallery.newGallery(
            id, title, service, description, status,
            0, '', folderName, user.id
        );

        if (!newGallery || !newGallery.insertId) {
            return res.status(500).json({ message: 'Error al crear la galería' });
        }

        res.status(201).json({
            message: 'Galería creada',
            data: { galleryId: newGallery.insertId, folderName }
        });
    } catch (err) {
        console.error('Error en createGalleryMeta:', err);
        res.status(500).json({ message: 'Error del servidor' });
    }
},

finalizeGallery: async (req, res) => {
    try {
        const user = req.session.user;
        if (!user || user.role !== 'admin') return res.status(401).json({ message: 'Acceso no autorizado' });

        const { galleryId } = req.params;
        const gallery = await Gallery.getGalleryById(galleryId);
        if (!gallery) return res.status(404).json({ message: 'Galería no encontrada' });

        const allImages = await Gallery_images.getByGalleryId(galleryId);
        await Gallery.updatePhotosCount(galleryId, allImages.length);

        Stats.addStat(user.id, 'admin', 'create', 'creó una nueva galería', 'complete').catch(err => console.error('Stats error:', err));
        Notification.create(
            parseInt(gallery.client_id),
            'gallery_created',
            '¡Nueva galería disponible!',
            `Se creó tu galería "${gallery.title}" con ${allImages.length} foto${allImages.length !== 1 ? 's' : ''}.`
        ).catch(err => console.error('Notif error:', err));

        res.json({ success: true, total_images: allImages.length });
    } catch (err) {
        console.error('Error en finalizeGallery:', err);
        res.status(500).json({ message: 'Error del servidor' });
    }
},

};

module.exports = adminController;