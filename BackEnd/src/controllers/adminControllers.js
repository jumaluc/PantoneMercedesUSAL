const User = require('../moduls/Users');

const adminController = {

    getAllClients: async (req, res) =>{

        console.log('ENTRO XD')
        const user = req.session.user;
        if(!user || user.role !== 'admin' )return res.status(401).json({message: 'Acceso no autorizado'});
        const allClients = await User.getAllClients();
        res.status(200).json({data: allClients})

    }



}

module.exports = adminController