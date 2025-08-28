const User = require('../moduls/Users')

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
    }


}

module.exports = userController;