const express = require("express");
const cors = require("cors");
const db = require("./modulo/db"); 
const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());

//RUTAS

app.get("/clientes", (req, res) => {
  db.query("SELECT * FROM Clientes", (err, results) => {
    if (err) {
      return res.status(500).json({ error: err });
    }
    res.json(results);
  });
});

//SERVER

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
