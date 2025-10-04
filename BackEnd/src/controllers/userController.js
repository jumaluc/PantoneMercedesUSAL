const User = require('../moduls/Users');
const Gallery = require('../moduls/Galleries');
const Gallery_images = require('../moduls/Gallery_images');
const { storage, bucket } = require('../utils/googleStorageService');
const archiver = require('archiver');
const Comments = require('../moduls/Comments')
const General_requests = require('../moduls/General_requests');
const { getAllVideosById } = require('../moduls/Client_videos');
const Video = require('../moduls/Video');
const userController = {

    editProfile: async (req, res) => {
        try {
            const user = req.session.user;
            if (!user) return res.status(403).json({ message: 'Acceso no valido' });
            
            const { id, first_name, last_name, email, number, service } = req.body;
            const result = await User.editProfile(id, first_name, last_name, email, number, service);

            if (result === 1) {
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
                const images = await Gallery_images.getByGalleryId(gallery.id);
                return {
                    gallery: gallery,
                    images: images || []
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
        
        if (result) {
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
    if(!response || response < 0)return req.status(500).json({message : "Error en el servidor"});

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
 }



}

;

module.exports = userController;