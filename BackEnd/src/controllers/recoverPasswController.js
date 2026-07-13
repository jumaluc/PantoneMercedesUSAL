const crypto = require("crypto");
const bcrypt = require("bcrypt");
const User = require('../moduls/Users');
const sendPasswordResetEmail = require("../utils/emailService.js");


const recoverPasswController = {

    forgot_password: async (req, res) => {
        try {
            const { email } = req.body;
            console.log(email);
            const result = await User.verifyEmail(email);
            if (!result) {
            return res.status(404).json({ message: "Email no encontrado" });
            }

            const id = result.id;
            const resetToken = crypto.randomInt(100000, 999999).toString();

            const affectedRows = await User.tokenSave(resetToken, id);
            if(affectedRows === 0)res.status(500).json({message : 'Error en el servidor'});

            const emailSent = await sendPasswordResetEmail(email, resetToken);

            if (!emailSent) {
            return res.status(500).json({ message: "Error al enviar el email" });
            }

            res.json({ message: "Email de recuperación enviado" });
        } catch (error) {
            console.error("Error en forgot-password:", error);
            res.status(500).json({ message: "Error del servidor" });
  }
    },
    verify_reset_code: async (req,res) =>{
          try {
            const { email, code } = req.body;
            
            const result = await User.verifyToken(email, code);

            if (!result) {
            return res.status(400).json({
                valid: false,
                message: "Código de recuperación incorrecto o expirado"
            });
            }
            else {
            const id = result.id;

            return res.status(200).json({
                valid: true,
                message: "Código de recuperación verificado con éxito",
                id: id
            });
            }

        } catch (error) {
            console.error("❌ Error en verify-reset-code:", error);
            return res.status(500).json({ 
            valid: false,
            message: "Error del servidor" 
            });
        }
    },
    reset_password: async (req, res) =>{
       try{
          const {email, idResetPassword, newPassword} = req.body;

          const hashedPassword = await bcrypt.hash(newPassword, 10);
          const result = await User.resetPassword(email, idResetPassword, hashedPassword);

          if (result === 1 ){
              return res.status(200).json({ message : "Contraseña actualizada correctamente"} )
          }
          else{
            return res.status(500).json({ message : "Error en el servidor"})
          }
       }
       catch(error){
         return res.status(500).json({ message : "Error en el servidor"})
       }
    }

}

module.exports = recoverPasswController;