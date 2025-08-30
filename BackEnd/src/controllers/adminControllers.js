const User = require('../moduls/Users');
const bcrypt = require('bcrypt');

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

    }



}

module.exports = adminController