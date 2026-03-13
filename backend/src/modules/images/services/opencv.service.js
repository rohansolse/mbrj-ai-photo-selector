const sharp = require("sharp");

let cv;
try {
  // Optional dependency. The service falls back to Sharp-based heuristics if OpenCV is unavailable.
  cv = require("opencv4nodejs");
} catch (_error) {
  cv = null;
}

function mapVarianceToScore(variance) {
  return Math.max(0, Math.min(100, variance / 15));
}

function mapBrightnessToScore(mean) {
  const target = 128;
  const distance = Math.abs(mean - target);
  return Math.max(0, 100 - distance * 0.8);
}

function mapCompositionToScore({ width, height }) {
  if (!width || !height) {
    return 0;
  }

  const aspectRatio = width / height;
  const ratioDistance = Math.abs(aspectRatio - 1.5);
  return Math.max(25, 100 - ratioDistance * 45);
}

async function analyzeImage(imagePath) {
  if (cv) {
    const mat = cv.imread(imagePath);
    const gray = mat.bgrToGray();
    const laplacian = gray.laplacian(cv.CV_64F);
    const { stddev, mean } = cv.meanStdDev(laplacian);
    const variance = Math.pow(stddev.at(0, 0), 2);
    const brightnessMean = gray.mean().w;
    const metadata = await sharp(imagePath).metadata();

    return {
      blurVariance: variance,
      sharpnessScore: Number(mapVarianceToScore(variance).toFixed(2)),
      brightnessScore: Number(mapBrightnessToScore(brightnessMean).toFixed(2)),
      width: metadata.width || 0,
      height: metadata.height || 0,
      orientation: (metadata.width || 0) >= (metadata.height || 0) ? "landscape" : "portrait",
      compositionScore: Number(
        mapCompositionToScore({ width: metadata.width, height: metadata.height }).toFixed(2),
      ),
    };
  }

  const stats = await sharp(imagePath).greyscale().stats();
  const metadata = await sharp(imagePath).metadata();
  const brightnessMean = stats.channels[0]?.mean || 0;
  const variance = stats.channels[0]?.stdev ? Math.pow(stats.channels[0].stdev, 2) : 0;

  return {
    blurVariance: variance,
    sharpnessScore: Number(mapVarianceToScore(variance).toFixed(2)),
    brightnessScore: Number(mapBrightnessToScore(brightnessMean).toFixed(2)),
    width: metadata.width || 0,
    height: metadata.height || 0,
    orientation: (metadata.width || 0) >= (metadata.height || 0) ? "landscape" : "portrait",
    compositionScore: Number(
      mapCompositionToScore({ width: metadata.width, height: metadata.height }).toFixed(2),
    ),
  };
}

module.exports = { analyzeImage };
