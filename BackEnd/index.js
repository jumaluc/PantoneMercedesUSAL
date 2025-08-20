const express = require("express");
const cors = require("cors");
const crypto = require("crypto");
require("dotenv").config();

const { login, register, verifyEmail, tokenSave, verifyToken, resetPassword } = require("./modulo/db");
const sendPasswordResetEmail = require("./utils/emailService.js");

const app = express();
const PORT = 3000;
app.use(cors());
app.use(express.json());

// Rutas
app.get("/clientes", (req, res) => {
  db.query("SELECT * FROM Clientes", (err, results) => {
    if (err) {
      return res.status(500).json({ error: err });
    }
    res.json(results);
  });
});

app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const results = await login(email, password);

    if (results.length === 0) {
      return res.status(401).json({ message: "Credenciales incorrectas" });
    }
    res.json({ message: "Login exitoso", user: results[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error en la BD" });
  }
});

app.post("/api/register", async (req, res) => {
  const { firstName, lastName, cel, email, password, service } = req.body;

  try {
    const result = await register(firstName, lastName, cel, email, password, service);
    res.json({ message: "Registro exitoso", user: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error en la BD" });
  }
});

app.post("/api/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    const result = await verifyEmail(email);
    if (!result[0]) {
      return res.status(404).json({ message: "Email no encontrado" });
    }

    const id = result[0].id_cliente;
    const resetToken = crypto.randomInt(100000, 999999).toString();
    const resetTokenExpiry = Date.now() + 120000; // 2 minutos

    await tokenSave(resetToken, resetTokenExpiry, id);

    const emailSent = await sendPasswordResetEmail(email, resetToken);

    if (!emailSent) {
      return res.status(500).json({ message: "Error al enviar el email" });
    }

    res.json({ message: "Email de recuperación enviado" });
  } catch (error) {
    console.error("Error en forgot-password:", error);
    res.status(500).json({ message: "Error del servidor" });
  }
});

app.post("/api/verify-reset-code", async (req, res) => {
  try {
    const { email, code } = req.body;
    
    // ✅ 'result' ya es el array, no necesitas [result]
    const result = await verifyToken(email, code);
    
    console.log("🔍 Resultado de verifyToken:", result);
    
    if (result.length === 0) {
      // ✅ Cambiar 404 por 400 (Bad Request)
      return res.status(400).json({ 
        valid: false,
        message: "Código de recuperación incorrecto o expirado" 
      });
    }
    else {
      // ✅ result[0] para acceder al primer elemento del array
      const id_cliente = result[0].id_cliente;
      console.log("✅ ID del cliente:", id_cliente);
      
      return res.status(200).json({ 
        valid: true,
        message: "Código de recuperación verificado con éxito", 
        id: id_cliente 
      });
    }

  } catch (error) {
    console.error("❌ Error en verify-reset-code:", error);
    return res.status(500).json({ 
      valid: false,
      message: "Error del servidor" 
    });
  }
});

app.post("/api/reset-password", async (req, res) => {

  const {email, idResetPassword ,newPassword} = req.body;

  console.log(email, idResetPassword, newPassword)
  const result = await resetPassword(email, idResetPassword ,newPassword);

  if (result === 1 ){
      res.status(200).json({ message : "Contraseña actualizada correctamente"} )

  }
  else{
    res.status(500).json({ message : "Error en el servidor"})
  }

})


// Servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
