// controllers/adminControllers.js
const User = require('../moduls/Users');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const { uploadFile, getFileUrls, deleteFile, checkCredentials, uploadVideoToGCS} = require('../utils/googleStorageService');
const Gallery = require('../moduls/Galleries');
const Gallery_images = require('../moduls/Gallery_images');
const path = require('path');
const AdminLog = require('../moduls/AdminLog');
const Video = require('../moduls/Video')
const Stats = require('../moduls/Stats')
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
            const stats = await Stats.addStat(req.session.user.id, 'admin', 'create', 'creó un nuevo cliente', 'complete');
            if(!stats || stats < 1)return res.status(500).json({message: 'Error en el servidor'})
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
                        const stats = await Stats.addStat(req.session.user.id, 'admin', 'update', 'actualizó un cliente', 'complete');
            if(!stats || stats < 1)return res.status(500).json({message: 'Error en el servidor'})
            if (result === 1) {
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
                        const stats = await Stats.addStat(req.session.user.id, 'admin', 'delete', 'eliminó un cliente', 'complete');
            if(!stats || stats < 1)return res.status(500).json({message: 'Error en el servidor'})
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
            const stats = await Stats.addStat(req.session.user.id, 'admin', 'create', 'creó una nueva galería', 'complete');
            if(!stats || stats < 1)return res.status(500).json({message: 'Error en el servidor'})
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
            const stats = await Stats.addStat(req.session.user.id, 'admin', 'delete', 'eliminó una galería', 'complete');
            if(!stats || stats < 1)return res.status(500).json({message: 'Error en el servidor'})
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
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No se recibió ningún archivo de video'
        });
      }
      console.log("++++++++++++++++++++++++ ENTRO AL CREATE VIDEO")
      const { client_id, title, description, service_type, estimated_delivery, status, progress } = req.body;
      console.log(req.body);
      if (!client_id || !title) {
        return res.status(400).json({
          success: false,
          message: 'Cliente y título son obligatorios'
        });
      }

      const videoUploadResult = await uploadVideoToGCS(req.file, 'videos', client_id);

      const videoData = {
        user_id: parseInt(client_id),
        title: title.trim(),
        description : description.trim(),
        estimated_delivery: estimated_delivery || null,
        status: status || 'waiting_selection',
        video_url: videoUploadResult.url,
        file_name: videoUploadResult.fileName,
        original_filename: req.file.originalname,
        file_size: req.file.size,
        format: req.file.mimetype,
        created_by: user.id,
        progress : progress,
      };
      console.log("VIDEO DATA EN EL CONTROLLER : ", videoData)

      const newVideo = await Video.create(videoData);
            const stats = await Stats.addStat(req.session.user.id, 'admin', 'create', 'creó un nuevo video', 'complete');
            if(!stats || stats < 1)return res.status(500).json({message: 'Error en el servidor'})
      res.status(201).json({
        success: true,
        message: 'Video creado y subido correctamente',
        data: {
          video: newVideo,
          uploadInfo: {
            url: videoUploadResult.url,
            size: videoUploadResult.size,
            originalName: videoUploadResult.originalName
          }
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
                  const stats = await Stats.addStat(req.session.user.id, 'admin', 'update', 'actualizó status de video', 'complete');
            if(!stats || stats < 1)return res.status(500).json({message: 'Error en el servidor'})
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

  updateVideoProgress: async (req, res) => {
    try {
      const user = req.session.user;
      if (!user || user.role !== 'admin') {
        return res.status(401).json({ message: 'Acceso no autorizado' });
      }
      console.log("ENTRO AL UPDATE ------------", req.params, req.body)
      const { videoId } = req.params;
      const { progress } = req.body;

      const result = await Video.updateProgress(videoId, parseInt(progress));
                  const stats = await Stats.addStat(req.session.user.id, 'admin', 'update', 'actualizó progreso de video', 'complete');
            if(!stats || stats < 1)return res.status(500).json({message: 'Error en el servidor'})
      if (result > 0) {
        res.json({
          success: true,
          message: 'Progreso del video actualizado'
        });
      } else {
        res.status(404).json({
          success: false,
          message: 'Video no encontrado'
        });
      }

    } catch (error) {
      console.error('Error updating video progress:', error);
      res.status(500).json({
        success: false,
        message: 'Error al actualizar el progreso'
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
                  const stats = await Stats.addStat(req.session.user.id, 'admin', 'delete', 'eliminó un video', 'complete');
            if(!stats || stats < 1)return res.status(500).json({message: 'Error en el servidor'})
      if (result) {
        res.json({
          success: true,
          message: 'Video eliminado correctamente'
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
}



};

module.exports = adminController;