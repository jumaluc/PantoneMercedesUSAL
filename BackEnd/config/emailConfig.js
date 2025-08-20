const nodemailer = require("nodemailer");
require("dotenv").config();

const createTransporter = () => {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER, // tu email
      pass: process.env.EMAIL_PASS  // tu contraseña de aplicación
    }
  });
};

module.exports = createTransporter;
