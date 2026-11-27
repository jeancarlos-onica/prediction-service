const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const PredictionSchema = new Schema({
    dataId: String,
    source: String,
    correlationId: String,
    features: { type: [Number], required: true },
    featureCount: { type: Number, required: true },
    prediction: { type: Number, required: true },
    latencyMs: Number,
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Prediction", PredictionSchema);
