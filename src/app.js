const express = require("express");
const predictionRoutes = require("./routes/prediction.routes");

const app = express();

// Middleware para interpretar peticiones JSON
app.use(express.json());

// Registrar rutas
app.use("/", predictionRoutes);

module.exports = app;
