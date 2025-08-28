const express = require('express');

const app = require('./app');

const PORT = 3000;
require("dotenv").config();


app.listen(PORT, () => {
  console.log(`🚀 Servidor original corriendo en http://localhost:${PORT}`);
});
