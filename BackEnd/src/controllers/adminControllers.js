const User = require('../moduls/Users');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const {  uploadFile,
  getFileUrls,
  deleteFile,
  checkCredentials} = require('../utils/googleStorageService')
const Gallery = require('../moduls/Galleries')
const Gallery_images = require('../moduls/Gallery_images')
const path = require('path');

const adminController = {

    getAllClients: async (req, res) =>{

        try{
            const user = req.session.user;
            if(!user || user.role !== 'admin' )return res.status(401).json({message: 'Acceso no autorizado'});
            const allClients = await User.getAllClients();
            res.status(200).json({data: allClients})
        }
        catch(error){console.log(error)}

    },
    createClient: async (req, res) => {

        try{
            const user = req.session.user;
            if(!user || user.role !== 'admin' )return res.status(401).json({message: 'Acceso no autorizado'});
            const {first_name, last_name, email, number, service, password} = req.body;
            const hashPassword = await bcrypt.hash(password, 10);
            const result = await User.registerUser(first_name, last_name, email, number, service, password);
            if(result === 0)return res.status(500).json({message : "Error en el servidor"});
            return res.status(200).json({message : 'Cliente creado correctamente'});
        }
        catch(error){console.log(error)}

    },
    updateClient: async (req, res) =>{
        try{

            const user = req.session.user;            

            if(!user || user.role !== 'admin' )return res.status(401).json({message: 'Acceso no autorizado'});
            const {id,first_name, last_name, email, number, service} = req.body;
            const result = await User.editProfile(id, first_name,last_name, email, number, service);
            if(result === 1){
                return res.status(200).json({ message : "Perfil actualizado correctamente", data: {
                    id: id,
                    first_name: first_name,
                    last_name: last_name,
                    service: service,
                    email:email,
                    number:number
                }})
            }
            else{
                return res.status(401).json({ message : "Error al actualizar "})
            }
        }
        catch(error){
            console.log(error)
        }
    },
    deleteClient: async (req, res) => {
        
        try{
            const user = req.session.user;
            if(!user || user.role !== 'admin' )return res.status(401).json({message: 'Acceso no autorizado'});
            const {clientId} = req.params;
            if (!clientId) {
            return res.status(400).json({ message: 'ID de cliente no proporcionado' });
        }
            const result = User.deleteClient(clientId);
            if(result === 0)return res.status(500).json({message : "Error en el servidor"});
            return res.status(200).json({message : 'Cliente eliminado Correctamente'});
        }
        catch(err){console.log(err)}


    },

createGallery: async (req, res) => {
    try {
        const user = req.session.user;
        if (!user || user.role !== 'admin') {return res.status(401).json({ message: 'Acceso no autorizado' });}
        if (!req.files || req.files.length === 0) {return res.status(400).json({ message: 'No se subieron imágenes' });}

        const { id, title, service, description, status = 'active' } = req.body;
        console.log("ENTRO AL CREATE GALLERY----------------------------------------")
        console.log("NORMAL INFO : ",id, title, service, description, status)

        if (!id || !title || !service) {
            return res.status(400).json({ 
                message: 'client_id, title y service_type son obligatorios' 
            });
        }
        const client = await User.findOne(id);
        if (!client) {return res.status(404).json({ message: 'Cliente no encontrado' });}

        console.log("CLIENTE : ",client)


        const safeClientName = `${client.first_name}${client.last_name}`
            .replace(/[^a-zA-Z0-9]/g, '-')
            .toLowerCase();
        const folderName = `${id}-${safeClientName}`;

        const uploadedImages = [];
        let photoCount = 0;

                for (const file of req.files) {
                    try {
                        // Generar nombre único con UUID y mantener la extensión original
                        const fileExtension = path.extname(file.originalname); // Obtener extensión (.jpg, .png, etc.)
                        const uniqueFileName = `${uuidv4()}${fileExtension}`;

                        // Determinar si es la imagen principal (la primera)
                        const isPrimary = photoCount === 0;

                        // Subir archivo a Google Cloud Storage
                        const uploadResult = await uploadFile(
                            file.buffer,
                            uniqueFileName,  // Usar el nombre único
                            folderName,
                            file.mimetype
                        );

                        if (uploadResult.success) {
                            uploadedImages.push({
                                originalName: file.originalname,
                                storageName: uniqueFileName,  // Guardar el nombre único
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

        const newGallery = await Gallery.newGallery(id, title, service, description, status, uploadedImages.length, uploadedImages[0].url, folderName,user.id )
        console.log( "NUEVA GALERIA ",newGallery)
        if(!newGallery || newGallery === 0)return res.status(500).json({message : 'Error en el servidor'})
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

        // Respuesta exitosa
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



    getAllGalleries: async (req, res) =>{

        try{  

        const user = req.session.user;
        if (!user || user.role !== 'admin') {return res.status(401).json({ message: 'Acceso no autorizado' });}

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
        if(!galleriesWithClients)return res.status(500).json({message: 'Error en el servidor'})
        return res.status(200).json(galleriesWithClients);
    }
    catch(err){console.log(err); return res.status(500).json({message: 'Error en el servidor'})}
    },

    deleteGallery: async (req, res) =>{


        try{
        const user = req.session.user;
        if (!user || user.role !== 'admin') {return res.status(401).json({ message: 'Acceso no autorizado' });}

        const {galleryId} = req.params;
        const allFilePath = await Gallery_images.getAllImagesPathGallery(galleryId)
        const resultDeleteGallery = await Gallery.deleteGallery(galleryId);

        for(const path of allFilePath){
            console.log("PATH : ",path.file_path)
            await deleteFile(path.file_path);
            
        };
        if(!resultDeleteGallery || resultDeleteGallery === 0)return res.status(500).json({message : 'Error al eliminar la galeria'});

        res.status(200).json({message : 'Galeria eliminada correctamente'});
        
            

        }
        catch(err){console.log(err)}

    }
        

}
module.exports = adminController