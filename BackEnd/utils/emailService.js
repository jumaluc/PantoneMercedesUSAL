const createTransporter = require("../config/emailConfig");

const sendPasswordResetEmail = async (email, resetToken) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Recuperación de Contraseña - Pantone Mercedes",
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <h2>Recuperación de Contraseña</h2>
          <p>Tu código de verificación es:</p>
          <h1 style="color:#FF8C00; letter-spacing:5px;">${resetToken}</h1>
          <p>Este código expirará en <strong>2 minutos</strong>.</p>
        </div>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log("📧 Email enviado:", result.messageId);
    return true;
  } catch (error) {
    console.error("❌ Error enviando email:", error);
    return false;
  }
};

module.exports = sendPasswordResetEmail;
