const User = require('../moduls/Users');
const Gallery = require('../moduls/Galleries');
const Gallery_images = require('../moduls/Gallery_images');
const { storage, bucket } = require('../utils/googleStorageService');
const archiver = require('archiver');
const Comments = require('../moduls/Comments')
const General_requests = require('../moduls/General_requests');
const { getAllVideosById } = require('../moduls/Client_videos');
const Video = require('../moduls/Video');
const Stats = require('../moduls/Stats');
const SongSelection = require('../moduls/SongSelection');
const Reviews = require('../moduls/Reviews');
const Notification = require('../moduls/Notification');
const userController = {

    editProfile: async (req, res) => {
        try {
            const user = req.session.user;
            if (!user) return res.status(403).json({ message: 'Acceso no valido' });
            
            const { id, first_name, last_name, email, number, service } = req.body;
            const result = await User.editProfile(id, first_name, last_name, email, number, service);
            Stats.addStat(req.session.user.id, 'client', 'edit', 'edicion del perfil', 'complete').catch(err => console.error('Stats error:', err));
            if (result === 1) {
                Notification.create(user.id, 'profile_updated', 'Perfil actualizado', 'Tus datos de perfil se guardaron correctamente.').catch(err => console.error('Notif error:', err));

                return res.status(200).json({
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
                return res.status(401).json({ message: "Error al actualizar" });
            }
        } catch (error) {
            console.error('Error en editProfile:', error);
            res.status(500).json({ message: "Error en el servidor" });
        }
    },

    getUser: async (req, res) => {
        try {
            const user = req.session.user;
            if (!user) return res.status(401).json({ message: "Acceso denegado" });
            
            const recentUser = await User.getUser(user.id);
            res.status(200).json({ data: recentUser });
        } catch (error) {
            console.error('Error en getUser:', error);
            res.status(500).json({ message: "Error en el servidor" });
        }
    },

getGallery: async (req, res) => {
    try {
        const user = req.session.user;
        if (!user) return res.status(401).json({ message: "Acceso denegado" });
        
        const userInfo = await User.getUser(user.id);
        if (!userInfo) return res.status(404).json({ message: "Usuario no encontrado" });
        
        // Cambiar para obtener todas las galerías (array)
        const galleries = await Gallery.getByClientId(user.id);
        if (!galleries || galleries.length === 0) {
            return res.status(404).json({ message: "No se encontraron galerías" });
        }
        
        // Obtener imágenes para cada galería
        const galleriesWithImages = await Promise.all(
            galleries.map(async (gallery) => {
                const images = await Gallery_images.getByGalleryIdWithSelection(gallery.id);
                const selectionLocked = images.some(img => img.is_selected === 1);
                return {
                    gallery: gallery,
                    images: images || [],
                    selection_locked: selectionLocked
                };
            })
        );

        return res.status(200).json({
            data: galleriesWithImages
        });

    } catch (err) {
        console.error('Error en getGallery:', err);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
},

downloadSingleImage: async (req, res) => {
  try {
    const user = req.session.user;
    if (!user) return res.status(401).json({ message: "Acceso denegado" });

    const { imageUrl, filename } = req.body;
    if (!imageUrl) {
      return res.status(400).json({ error: "URL de imagen no proporcionada" });
    }

    console.log("URL recibida:", imageUrl);

    // 1. Limpiar querystring si la URL está firmada
    const cleanUrl = imageUrl.split("?")[0];

    // 2. Sacar el bucket name del path
    const bucketName = bucket.name; // "pantone-almacen-imagenes"
    const indexStart = cleanUrl.indexOf(bucketName);
    if (indexStart === -1) {
      return res.status(400).json({ error: "URL no pertenece al bucket configurado" });
    }

    // 3. Obtener el object path
    const fileName = cleanUrl.substring(indexStart + bucketName.length + 1);
    console.log("File name (object path):", fileName);

    // Verificar existencia
    const file = bucket.file(fileName);
    const [exists] = await file.exists();
    if (!exists) {
      console.log("Archivo no existe en bucket:", fileName);
      return res.status(404).json({ error: "Imagen no encontrada" });
    }

    // Nombre seguro para descarga
    const safeFilename = encodeURIComponent(filename || fileName.split("/").pop() || "image");
    res.setHeader("Content-Disposition", `attachment; filename="${safeFilename}"`);

    // Obtener content-type real
    const [metadata] = await file.getMetadata();
    res.setHeader("Content-Type", metadata.contentType || "application/octet-stream");

    // Pipe directo al response
    const readStream = file.createReadStream();
    readStream.on("error", (error) => {
      console.error("Error streaming file:", error);
      if (!res.headersSent) {
        res.status(500).json({ error: "Error al descargar la imagen" });
      }
    });

    readStream.pipe(res);
    Stats.addStat(req.session.user.id, 'client', 'download', 'descargó 1 foto', 'complete').catch(err => console.error('Stats error:', err));
  } catch (error) {
    console.error("Error en downloadSingleImage:", error);
    if (!res.headersSent) {
      res.status(500).json({ error: "Error interno del servidor" });
    }
  }
},


downloadImages: async (req, res) => {
  try {
    const user = req.session.user;
    if (!user) return res.status(401).json({ message: "Acceso denegado" });
    
    const { imageUrls } = req.body;

    if (!imageUrls || imageUrls.length === 0) {
      return res.status(400).json({ error: 'No hay imágenes para descargar' });
    }

    const archive = archiver('zip', { zlib: { level: 9 } });

    res.setHeader('Content-Disposition', 'attachment; filename="galeria.zip"');
    res.setHeader('Content-Type', 'application/zip');

    archive.on('error', (error) => {
      console.error('Error creando ZIP:', error);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Error al crear el archivo ZIP' });
      }
    });

    archive.pipe(res);

    // Agregar cada imagen al ZIP sin promesas innecesarias
imageUrls.forEach((imageUrl, index) => {
  if (!imageUrl) return;
  try {
    const cleanUrl = imageUrl.split('?')[0]; // quitar query
    const bucketName = bucket.name;
    const fileName = cleanUrl.substring(cleanUrl.indexOf(bucketName) + bucketName.length + 1);

    const file = bucket.file(fileName);
    const safeName = `imagen_${index + 1}.${fileName.split('.').pop() || 'jpg'}`;
    archive.append(file.createReadStream(), { name: safeName });
    
  } catch (err) {
    console.error(`Error procesando ${imageUrl}:`, err);
  }
});

    // Ahora sí cerrar el ZIP
    archive.finalize();
    Stats.addStat(req.session.user.id, 'client', 'download', 'descargó ' + imageUrls.length + ' fotos', 'complete').catch(err => console.error('Stats error:', err));
  } catch (error) {
    console.error('Error en downloadImages:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
},

confirmSelection: async (req, res) => {
    try {
        const user = req.session.user;
        if (!user) return res.status(401).json({ message: "Acceso denegado" });
        
        const { imageIds } = req.body;

        if (!imageIds || imageIds.length === 0) {
            return res.status(400).json({ error: 'No hay imágenes para confirmar' });
        }

        // Aquí va la lógica para actualizar la base de datos
        // Por ejemplo:
        const result = await Gallery_images.updateSelectionStatus(imageIds, true);
        Stats.addStat(req.session.user.id, 'client', 'confirm selection', 'confirmó selección de ' + imageIds.length + ' fotos', 'complete').catch(err => console.error('Stats error:', err));
        if (result) {
            const userData = await User.getUser(user.id);
            const clientName = userData ? `${userData.first_name} ${userData.last_name}` : 'Un cliente';
            Notification.createForAllAdmins('selection_confirmed', 'Selección de fotos confirmada', `${clientName} confirmó su selección de ${imageIds.length} foto${imageIds.length !== 1 ? 's' : ''}.`).catch(err => console.error('Notif error:', err));
            res.status(200).json({
                message: `Se confirmaron ${imageIds.length} imágenes correctamente`,
                confirmedCount: imageIds.length
            });
        } else {
            res.status(500).json({ error: 'Error al actualizar la base de datos' });
        }

    } catch (error) {
        console.error('Error en confirmSelection:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
},

addComment : async (req,res) => {
  try {
    const user = req.session.user;
    if(!user) return res.status(404).json({message : "Acceso denegado"});
    
    console.log("ENTRO AL ADDCOMMENT")
    const {gallery_id, comment, image_id} = req.body;
    const userId = user.id;
    
    const commentId = await Comments.addComment(userId, gallery_id, comment, image_id);

    if(!commentId) return res.status(500).json({message : "Error en el servidor"});
    Stats.addStat(req.session.user.id, 'client', 'comment', 'comentó una foto', 'complete').catch(err => console.error('Stats error:', err));
    const commenter = await User.getUser(user.id);
    const commenterName = commenter ? `${commenter.first_name} ${commenter.last_name}` : 'Un cliente';
    Notification.createForAllAdmins('new_comment', 'Nuevo comentario en una foto', `${commenterName} dejó un comentario en una imagen de su galería.`).catch(err => console.error('Notif error:', err));
    return res.status(200).json({
      message: "Comentario agregado correctamente", 
      commentId: commentId // Cambia esto para que coincida con el frontend
    });

  }
  catch(err) {
    console.log(err);
    return res.status(500).json({message: "Error interno del servidor"});
  }
},
getImageComments: async(req,res) => {

  try{
    const user = req.session.user;
    if(!user) return res.status(404).json({message : "Acceso denegado"});
    console.log( "ENTRO ")
    const {image_id} = req.query; 
    const comments = await Comments.getImageComments(image_id);

    if(!comments) return res.status(500).json({message : "Error en el servidor"});

    console.log("COMENTARIOS : ",comments)

    return res.status(200).json({comments})


  }
  catch(err){console.log(err)}
},

deleteImageComment: async (req, res) => {
  try {
    const user = req.session.user;
    if (!user) return res.status(404).json({ message: "Acceso denegado" });

    const { commentId } = req.body;

    // Elimina la desestructuración [result] ya que no es necesaria
    const result = await Comments.deleteImageComment(commentId);

    if (!result || result === 0) return res.status(500).json({ message: "Error en el servidor o comentario no encontrado" });
    Stats.addStat(req.session.user.id, 'client', 'comment', 'eliminó un comentario', 'complete').catch(err => console.error('Stats error:', err));
    return res.status(200).json({ message: "Comentario eliminado correctamente" }); // Cambiado a status 200 y json()

  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
},

updateImageComment: async (req, res) => {
  try {
    const user = req.session.user;
    if (!user) return res.status(404).json({ message: "Acceso denegado" });
    
    const { comment_id, comment } = req.body;

    console.log("COMENTARIO ID -------------------------------------------------------------");
    console.log(comment_id);
    console.log(comment);

    const result = await Comments.updateImageComment(comment_id, comment);
    console.log(result)
    if (!result || result === 0) return res.status(500).json({ message: "Error en el servidor o comentario no encontrado" });
    Stats.addStat(req.session.user.id, 'client', 'comment', 'editó un comentario', 'complete').catch(err => console.error('Stats error:', err));
    return res.status(200).json({ 
      message: "Comentario actualizado correctamente",
      affectedRows: result 
    });

  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
},

getMyComments: async (req,res) =>{

  try{
    const user = req.session.user;
    if (!user) return res.status(404).json({ message: "Acceso denegado" });

    const idUser = req.session.user.id;


    const comments = await Comments.getMyComments(idUser);
    if(!comments) return res.status(500).json({message : "Error en el servidor"});
    return res.status(200).json({comments});

  }
  catch(err){console.log(err)};
},

createRequest: async (req, res) =>{
  try{
    console.log("ENTRO AL CREATE REQUESTS ----------------------------")
    const user = req.session.user;
    if (!user) return res.status(404).json({ message: "Acceso denegado" });
    const {type, subject, message, priority} = req.body;

    const idUser = req.session.user.id;
    const response = await General_requests.createRequest(idUser, type, subject, message, priority);
    if(!response || response < 0) return res.status(500).json({message : "Error en el servidor"});
    Stats.addStat(req.session.user.id, 'client', 'request', 'escribió una solicitud', 'complete').catch(err => console.error('Stats error:', err));
    const requester = await User.getUser(user.id);
    const requesterName = requester ? `${requester.first_name} ${requester.last_name}` : 'Un cliente';
    Notification.createForAllAdmins('new_request', 'Nueva solicitud recibida', `${requesterName} envió una nueva solicitud: "${subject}".`).catch(err => console.error('Notif error:', err));
    return res.status(200).json({message : "Solicitud creada correctamente"});

  }
  catch(err){console.log(err)}
},


 getMyRequests: async(req,res) =>{
  try{
        const user = req.session.user;
        if (!user) return res.status(404).json({ message: "Acceso denegado" });
        const id = req.session.user.id;
        const requests = await General_requests.getMyRequests(id);
        if(!requests) return res.status(500).json({message : "Error en el servidor"});

        console.log(requests)
        return res.status(200).json({requests})

  }
       catch(err){console.log(err)}
 },

 getMyVideos: async (req, res) =>{
    try{
        const user = req.session.user;
        if (!user) return res.status(404).json({ message: "Acceso denegado" });
        const id = req.session.user.id;

        const videos = await Video.getMyVideos(id);

        if(!videos) return res.status(500).json( {message : "Error al recuperar tus videos"})

          console.log(videos)
        return res.status(200).json({videos})

  }
       catch(err){console.log(err)}
 },

downloadVideo: async (req, res) => {
    try {
        const user = req.session.user;
        if (!user) return res.status(401).json({ message: 'Acceso denegado' });

        const { videoId } = req.params;
        const videos = await Video.getById(videoId);
        const video = videos?.[0];

        if (!video || video.user_id !== user.id)
            return res.status(403).json({ message: 'Sin acceso a este video' });

        if (video.status !== 'completed')
            return res.status(400).json({ message: 'El video aún no está disponible' });

        const videoUrl = video.video_url;
        const cleanUrl = videoUrl.split('?')[0];
        const safeFilename = encodeURIComponent(video.original_filename || `video_${videoId}.mp4`);
        res.setHeader('Content-Disposition', `attachment; filename="${safeFilename}"`);

        if (cleanUrl.includes(bucket.name)) {
            const fileName = cleanUrl.substring(cleanUrl.indexOf(bucket.name) + bucket.name.length + 1);
            const file = bucket.file(fileName);
            const [exists] = await file.exists();
            if (!exists) return res.status(404).json({ error: 'Video no encontrado en el servidor' });
            const [metadata] = await file.getMetadata();
            res.setHeader('Content-Type', metadata.contentType || 'video/mp4');
            file.createReadStream().on('error', () => {
                if (!res.headersSent) res.status(500).json({ error: 'Error al transmitir el video' });
            }).pipe(res);
        } else {
            const https = require('https');
            const http = require('http');
            const protocol = videoUrl.startsWith('https') ? https : http;
            res.setHeader('Content-Type', 'video/mp4');
            protocol.get(videoUrl, (videoRes) => {
                videoRes.pipe(res);
            }).on('error', () => {
                if (!res.headersSent) res.status(500).json({ error: 'Error al descargar el video' });
            });
        }
    } catch (err) {
        console.error('Error en downloadVideo:', err);
        if (!res.headersSent) res.status(500).json({ message: 'Error interno del servidor' });
    }
},

submitReview: async (req, res) => {
    try {
        const user = req.session.user;
        if (!user) return res.status(401).json({ message: 'Acceso denegado' });

        const { rating, message } = req.body;
        if (!rating || rating < 1 || rating > 5) return res.status(400).json({ message: 'El puntaje debe ser entre 1 y 5' });
        if (!message || !message.trim()) return res.status(400).json({ message: 'El mensaje es requerido' });

        await Reviews.submitReview(user.id, rating, message.trim());
        Stats.addStat(user.id, 'client', 'review', 'dejó una reseña', 'complete').catch(err => console.error('Stats error:', err));
        const reviewer = await User.getUser(user.id);
        const reviewerName = reviewer ? `${reviewer.first_name} ${reviewer.last_name}` : 'Un cliente';
        Notification.createForAllAdmins('new_review', 'Nueva reseña recibida', `${reviewerName} dejó una reseña con ${rating} estrella${rating !== 1 ? 's' : ''}.`).catch(err => console.error('Notif error:', err));
        return res.status(200).json({ message: 'Reseña guardada correctamente' });
    } catch (err) {
        console.error('Error en submitReview:', err);
        return res.status(500).json({ message: 'Error interno del servidor' });
    }
},

getMyReview: async (req, res) => {
    try {
        const user = req.session.user;
        if (!user) return res.status(401).json({ message: 'Acceso denegado' });
        const review = await Reviews.getMyReview(user.id);
        return res.status(200).json({ review });
    } catch (err) {
        console.error('Error en getMyReview:', err);
        return res.status(500).json({ message: 'Error interno del servidor' });
    }
},

getAllReviews: async (req, res) => {
    try {
        const user = req.session.user;
        if (!user) return res.status(401).json({ message: 'Acceso denegado' });
        const reviews = await Reviews.getAllReviews(user.id);
        return res.status(200).json({ reviews });
    } catch (err) {
        console.error('Error en getAllReviews:', err);
        return res.status(500).json({ message: 'Error interno del servidor' });
    }
},

toggleLike: async (req, res) => {
    try {
        const user = req.session.user;
        if (!user) return res.status(401).json({ message: 'Acceso denegado' });
        const { id } = req.params;
        const action = await Reviews.toggleLike(user.id, id);
        return res.status(200).json({ action });
    } catch (err) {
        console.error('Error en toggleLike:', err);
        return res.status(500).json({ message: 'Error interno del servidor' });
    }
},

cancelSelection: async (req, res) => {
    try {
        const user = req.session.user;
        if (!user) return res.status(401).json({ message: 'Acceso denegado' });

        const { galleryId } = req.body;
        if (!galleryId) return res.status(400).json({ message: 'galleryId es requerido' });

        const galleries = await Gallery.getByClientId(user.id);
        const isOwner = galleries && galleries.some(g => g.id === parseInt(galleryId));
        if (!isOwner) return res.status(403).json({ message: 'No tienes permiso para cancelar esta selección' });

        await Gallery_images.resetSelection(galleryId);
        await SongSelection.deleteByGallery(galleryId);
        Stats.addStat(user.id, 'client', 'update', `canceló su selección de la galería ${galleryId}`, 'complete').catch(err => console.error('Stats error:', err));

        return res.status(200).json({ message: 'Selección cancelada. Ya podés volver a seleccionar tus fotos.' });
    } catch (err) {
        console.error('Error en cancelSelection:', err);
        return res.status(500).json({ message: 'Error interno del servidor' });
    }
},

saveSongSelection: async (req, res) => {
    try {
        const user = req.session.user;
        if (!user) return res.status(401).json({ message: 'Acceso denegado' });

        const { galleryId, songs, letAdminChoose, notes } = req.body;
        if (!galleryId) return res.status(400).json({ message: 'galleryId es requerido' });

        const galleries = await Gallery.getByClientId(user.id);
        const isOwner = galleries && galleries.some(g => g.id === parseInt(galleryId));
        if (!isOwner) return res.status(403).json({ message: 'No tienes permiso para esta galería' });

        await SongSelection.save(galleryId, user.id, songs || [], letAdminChoose, notes);
        Stats.addStat(user.id, 'client', 'songs', 'guardó selección de canciones', 'complete').catch(err => console.error('Stats error:', err));

        return res.status(200).json({ message: 'Canciones guardadas correctamente' });
    } catch (err) {
        console.error('Error en saveSongSelection:', err);
        return res.status(500).json({ message: 'Error interno del servidor' });
    }
},

getSongSelection: async (req, res) => {
    try {
        const user = req.session.user;
        if (!user) return res.status(401).json({ message: 'Acceso denegado' });

        const { gallery_id } = req.query;
        if (!gallery_id) return res.status(400).json({ message: 'gallery_id es requerido' });

        const selection = await SongSelection.getByGalleryAndUser(gallery_id, user.id);
        return res.status(200).json({ selection });
    } catch (err) {
        console.error('Error en getSongSelection:', err);
        return res.status(500).json({ message: 'Error interno del servidor' });
    }
},

getNotifications: async (req, res) => {
    try {
        const user = req.session.user;
        if (!user) return res.status(401).json({ message: 'Acceso denegado' });
        const notifications = await Notification.getByUser(user.id);
        const unread = await Notification.getUnreadCount(user.id);
        return res.status(200).json({ notifications, unread });
    } catch (err) {
        return res.status(500).json({ message: 'Error interno del servidor' });
    }
},

markNotificationRead: async (req, res) => {
    try {
        const user = req.session.user;
        if (!user) return res.status(401).json({ message: 'Acceso denegado' });
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
        if (!user) return res.status(401).json({ message: 'Acceso denegado' });
        await Notification.markAllRead(user.id);
        return res.status(200).json({ success: true });
    } catch (err) {
        return res.status(500).json({ message: 'Error interno del servidor' });
    }
}

}

;

module.exports = userController;