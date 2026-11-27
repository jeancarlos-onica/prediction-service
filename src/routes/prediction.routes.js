const express = require("express");
const controller = require("../controllers/prediction.controller");

const router = express.Router();

// Estado del servicio
router.get("/health", controller.health);
router.get("/ready", controller.ready);

// Consultar las características del modelo
router.get("/features", controller.getFeatures);

// Solicitar una predicción
router.post("/predictions", controller.predict);

module.exports = router;
