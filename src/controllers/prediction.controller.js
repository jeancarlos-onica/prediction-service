const predictionService = require("../services/prediction.service");
const Prediction = require("../models/prediction.model");

// Comprobar que el servicio está en funcionamiento
function health(req, res) {
    res.json({
        status: "ok",
        service: "prediction-service"
    });
}

// Comprobar que el modelo está cargado y se pueden hacer predicciones
function ready(req, res) {
    if (!predictionService.isReady()) {
        return res.status(503).json({
            ready: false,
            modelVersion: predictionService.getModelVersion(),
            message: "Model is not ready"
        });
    }

    res.json({
        ready: true,
        modelVersion: predictionService.getModelVersion()
    });
}

// Consultar características
function getFeatures(req, res) {
    res.json({
        features: predictionService.getFeatures()
    });
}

// Procesar petición de predicción
async function predict(req, res) {
    try {
        const { features, meta = {} } = req.body || {};

        const { prediction, latencyMs } =
                await predictionService.predict(features);

        // Guardar la predicción en MongoDB
        const guardada = await Prediction.create({
            dataId: meta.dataId,
            source: meta.source,
            correlationId: meta.correlationId,
            features: features,
            featureCount: features.length,
            prediction: prediction,
            latencyMs: latencyMs
        });

        res.status(201).json({
            predictionId: guardada._id,
            prediction: prediction,
            timestamp: guardada.timestamp,
            latencyMs: latencyMs
        });

    } catch (error) {
        console.error(error);

        res.status(error.status || 500).json({
            error: error.status === 400
                ? error.message
                : "Error al ejecutar la predicción"
        });
    }
}

module.exports = {
    health,
    ready,
    getFeatures,
    predict
};
