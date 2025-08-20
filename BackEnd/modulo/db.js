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

async function register(firstName, lastName, cel, email, password) {
  const query = "INSERT INTO Clientes (nombre, apellido, telefono, mail, contraseña) VALUES (?, ?, ?, ?, ?)";
  const [result] = await pool.query(query, [firstName, lastName, cel, email, password]);
  return result;
}

module.exports = { pool, login, register };