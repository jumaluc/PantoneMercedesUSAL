const mysql = require("mysql2");

const db = mysql.createConnection({
  host: "127.0.0.1",      
  user: "root",           
  password: "usal2025",
  database: "pantoneMercedesDB" 
});

// Verificar conexión
db.connect(err => {
  if (err) {
    console.error("❌ Error conectando a MySQL:", err);
    return;
  }
  console.log("✅ Conectado a la base de datos MySQL");
});

module.exports = db;