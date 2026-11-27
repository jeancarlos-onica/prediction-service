const ort = require("onnxruntime-node");
const path = require("path");
const fs = require("fs");

// Rutas de los archivos del modelo
const modelPath = path.join(
    __dirname, "../../modelo/modelo.onnx"
);

const normPath = path.join(
    __dirname, "../../modelo/normalizacion.json"
);

const MODEL_VERSION = "v1.0";

// Cargar parámetros de normalización
const norm = JSON.parse(
    fs.readFileSync(normPath, "utf8")
);

let session;

// Inicializar el modelo
async function initModel() {
    session = await ort.InferenceSession.create(modelPath);
    console.log("Modelo ONNX cargado correctamente");
}

// Indicar si el modelo está cargado
function isReady() {
    return session !== undefined;
}

// Obtener la versión del modelo
function getModelVersion() {
    return MODEL_VERSION;
}

// Obtener nombres de las características
function getFeatures() {
    return norm.features;
}

// Realizar predicción
async function predict(features) {

    // Validar entrada
    if (
        !Array.isArray(features) ||
        features.length !== norm.mean.length ||
        !features.every(v =>
            typeof v === "number" && Number.isFinite(v)
        )
    ) {
        const error = new Error(
            `Se esperan ${norm.mean.length} valores numéricos`
        );

        error.status = 400;
        throw error;
    }

    // Iniciar medición del tiempo
    const inicio = performance.now();

    // Normalizar las entradas
    const datos = features.map((valor, i) =>
        (valor - norm.mean[i]) / norm.scale[i]
    );

    // Construir tensor de entrada
    const tensor = new ort.Tensor(
        "float32",
        Float32Array.from(datos),
        [1, datos.length]
    );

    // Ejecutar inferencia
    const resultado = await session.run({
        [session.inputNames[0]]: tensor
    });

    // Calcular latencia
    const latencyMs = Number(
        (performance.now() - inicio).toFixed(2)
    );

    const prediction = resultado[session.outputNames[0]].data[0];

    // Devolver los valores
    return {
        prediction: prediction,
        latencyMs
    };
}

module.exports = {
    initModel,
    isReady,
    getModelVersion,
    getFeatures,
    predict
};
