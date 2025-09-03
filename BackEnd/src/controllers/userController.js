const User = require('../moduls/Users')
const Gallery = require('../moduls/Galleries')
const Gallery_images = require('../moduls/Gallery_images');
const { all } = require('../routes/userRoutes');
const userController = {

    editProfile: async (req, res) => {

        try{
            const user = req.session.user;
            if(!user)return res.status(403).json({message:'Acceso no valido'});
            console.log("BODY: ", req.body)
            const {id, first_name, last_name, email, number, service} = req.body;
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
        catch(error){res.status(500).json({message : "Error en el servidor"})}

    }
    ,
    getUser: async (req, res) => {

        try{
            const user = req.session.user;
            if(!user)return res.status(401).json({message: "Acceso denagado"});
            const recentUser = await User.getUser(user.id);
            console.log(recentUser)
            res.status(200).json({data: recentUser});
        }
        catch(error){

        }
    },

getGallery: async (req, res) => {
    try {
        console.log("+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++")
        const user = req.session.user;
        if (!user) return res.status(401).json({ message: "Acceso denegado" });
        
        const userInfo = await User.getUser(user.id);
        if (!userInfo) return res.status(404).json({ message: "Usuario no encontrado" });
        
        const [getGalleryID] = await Gallery.getID(user.id);
        if (!getGalleryID) return res.status(404).json({ message: "No se encontraron galerías" });
        
        console.log("ID DE LA GALERIA---: ",getGalleryID.id)
        const allGalleryImages = await Gallery_images.getAllGalleryImages(getGalleryID.id);
        
        console.log("GALERIAS FOTOS : ",allGalleryImages)

        return res.status(200).json({ 
            data: {
                user: userInfo,
                galleries: getGalleryID, 
                images: allGalleryImages || []
            }
        });

    } catch (err) {
        console.error('Error en getGallery:', err);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
}

}

module.exports = userController;