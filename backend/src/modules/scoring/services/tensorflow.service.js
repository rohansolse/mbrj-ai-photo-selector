const sharp = require("sharp");

const { env } = require("../../../config/env");

let tf;
try {
  tf = require("@tensorflow/tfjs-node");
} catch (_error) {
  tf = null;
}

let cachedModel;

async function loadModel() {
  if (!tf || !env.tfModelPath) {
    return null;
  }

  if (!cachedModel) {
    cachedModel = await tf.loadLayersModel(`file://${env.tfModelPath}`);
  }

  return cachedModel;
}

async function scoreImageQuality(imagePath) {
  const metadata = await sharp(imagePath).metadata();
  const model = await loadModel();

  if (!tf || !model) {
    // TODO: Plug in a custom wedding aesthetic model trained on in-house curated selections.
    const fallbackScore = Math.min(100, Math.max(35, (((metadata.width || 0) * (metadata.height || 0)) / 1000000) * 8));
    return {
      aestheticScore: Number(fallbackScore.toFixed(2)),
      confidence: 0.34,
      modelVersion: env.aiModelVersion,
    };
  }

  const buffer = await sharp(imagePath)
    .resize(224, 224, { fit: "cover" })
    .removeAlpha()
    .raw()
    .toBuffer();

  const tensor = tf.tensor3d(new Uint8Array(buffer), [224, 224, 3]).expandDims(0).div(255);
  const prediction = model.predict(tensor);
  const values = await prediction.data();
  tensor.dispose();
  prediction.dispose();

  return {
    aestheticScore: Number((values[0] * 100).toFixed(2)),
    confidence: Number((values[1] || 0.5).toFixed(2)),
    modelVersion: env.aiModelVersion,
  };
}

module.exports = { scoreImageQuality };
