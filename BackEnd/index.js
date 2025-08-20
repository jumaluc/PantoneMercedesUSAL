const express = require("express");
const cors = require("cors");
const {login, register} = require("./modulo/db"); 
const app = express();
const PORT = 3000;

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

app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const results = await login(email, password);

    console.log("RESULTS:", results);

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

  const {firstName, lastName, cel, email, password} = req.body;

  try{
    const result = await register(firstName, lastName, cel, email, password);
    console.log("Registro exitoso:", result);
    res.json({ message: "Registro exitoso", user: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error en la BD" });
  }

});

//SERVER

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
