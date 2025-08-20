const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: "127.0.0.1",      
  user: "root",           
  password: "usal2025",
  database: "pantoneMercedesDB" 
});

async function login(email, password) {
  const query = "SELECT * FROM Clientes WHERE mail = ? AND contraseña = ?";
  const [rows] = await pool.query(query, [email, password]);
  return rows;
}

async function register(firstName, lastName, cel, email, password, service) {
  const query = "INSERT INTO Clientes (nombre, apellido, telefono, mail, contraseña, servicio) VALUES (?, ?, ?, ?, ?, ?)";
  const [result] = await pool.query(query, [firstName, lastName, cel, email, password, service]);
  return result;
}

async function verifyEmail(email){

  const query = "SELECT id_cliente FROM Clientes WHERE mail = ?";
  const [result] = await pool.query(query, [email]);
  return result;
}

async function tokenSave(resetToken, resetTokenExpiry, id) {
  
  const query = "UPDATE clientes SET resetToken=?, resetTokenExpiry=? WHERE id_cliente=?";
  const [result] = await pool.query(query, [resetToken, resetTokenExpiry, id]);
  return result;

}

async function verifyToken(email, resetToken){
try{

  const query = 'SELECT id_cliente FROM clientes WHERE mail = ?  and resetToken = ? ' ;
  const [result] = await pool.query(query, [email, resetToken]);
  return result;
}
catch(error){
      console.error("Error en verifyToken:", error);
      throw error;
}

}

module.exports = { pool, login, register, verifyEmail, tokenSave, verifyToken };