const User = require('../moduls/Users');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const authController = {

    login: async (req, res) =>{

        try{
            const {email, password} = req.body;
            //HACER PREVIA VERIFICACION
            const result = await User.equalPassword(email) || false;
            if(!result)return res.status(401).json({message : 'Credenciales Incorrectas'});
            const validPassword = await bcrypt.compare(password, result.password) || false;
            if(!validPassword){
                return res.status(401).json({message : 'Credenciales Incorrectas'});
            }
            const token = jwt.sign({id: result.id, role: result.role }, process.env.SECRET_WEB_TOKEN, {
                    expiresIn: '1h'
                });
                return res
                .cookie('access_token', token, {
                    httpOnly: true,
                    sameSite: 'strict',
                    maxAge: 1000 * 60 * 60
                })
                .status(200).json({role: result.role})
            }
        catch(error){
            return res.status(500).json({message : 'Error en el servidor'});
        }
    },

    register: async (req, res) =>{

        try{
            const {first_name, last_name, email, number, service, password} = req.body;
            //HACER PREVIA VERIFICACION
            const hashPassword = await bcrypt.hash(password, 10);
            console.log("BODY REGISTER", req.body)
            console.log("PASSWORD : ",hashPassword)
            const result = await User.registerUser(first_name, last_name, email, number, service, hashPassword);
            console.log("RESULTADO DEL REGISTRO : ",result)
            if(result === 0)return res.status(500).json({message : 'Error en el servidor'});
            res.status(200).send(req.body)
        }
        catch(error){
            res.status(500).json({message : 'Error en el servidor'})
        }
        
    },
    me: async (req, res) => {
        try{
            const data = req.session.user;
            if(!data)return res.status(401).json({message: 'Acceso denegado'});
            return res.status(200).json({role: data.role})
        }
        catch(error){

        }
    },
    logout: async (req, res) => {
        try{
            const data = req.session.user;
            if(!data) return res.status(401).json({message : 'Acceso denegado'})
            res.clearCookie('access_token').status(200).json({message : 'Logout Exitoso'});
        }
        catch(error){

        }
    } 


}

module.exports = authController;