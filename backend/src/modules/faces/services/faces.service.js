const sharp = require("sharp");

async function detectFaceSignals(imagePath) {
  try {
    const metadata = await sharp(imagePath).metadata();
    const portraitBias = metadata.height && metadata.width && metadata.height > metadata.width ? 1 : 0.7;
    const megapixels = ((metadata.width || 0) * (metadata.height || 0)) / 1000000;
    const sizeConfidence = Math.min(1, Math.max(0.3, megapixels / 12));

    // TODO: Swap this heuristic with a local face detector backed by OpenCV cascade/DNN.
    // TODO: Add bride/groom detection once we have labeled wedding portrait data.
    return {
      faceDetected: portraitBias > 0.65,
      faceScore: Number((portraitBias * sizeConfidence * 100).toFixed(2)),
      smileScore: Number((portraitBias * 68).toFixed(2)),
      eyesOpenScore: Number((portraitBias * 72).toFixed(2)),
      faceCount: portraitBias > 0.8 ? 1 : 0,
    };
  } catch (error) {
    return {
      faceDetected: false,
      faceScore: 0,
      smileScore: 0,
      eyesOpenScore: 0,
      faceCount: 0,
      error: error.message,
    };
  }
}

module.exports = { detectFaceSignals };
