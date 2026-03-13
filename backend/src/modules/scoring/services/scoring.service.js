const { analyzeImage } = require("../../images/services/opencv.service");
const { detectFaceSignals } = require("../../faces/services/faces.service");
const { scoreImageQuality } = require("./tensorflow.service");
const { computeOverallScore } = require("../../../utils/weights");

function decideRecommendation({
  sharpnessScore,
  brightnessScore,
  duplicateScore,
  overallScore,
  faceScore,
  smileScore,
  eyesOpenScore,
}) {
  if (sharpnessScore < 28) {
    return "rejected";
  }

  if (brightnessScore < 30 || brightnessScore > 92) {
    return "rejected";
  }

  if (duplicateScore >= 45) {
    return "needs_manual_review";
  }

  if (faceScore > 40 && smileScore > 50 && eyesOpenScore > 55 && overallScore >= 72) {
    return "shortlisted";
  }

  if (overallScore >= 70) {
    return "shortlisted";
  }

  return "needs_manual_review";
}

async function scorePhoto(photo, duplicateContext = {}) {
  const [imageAnalysis, faceSignals, modelOutput] = await Promise.all([
    analyzeImage(photo.original_path),
    detectFaceSignals(photo.original_path),
    scoreImageQuality(photo.original_path),
  ]);

  const duplicateInfo = duplicateContext[photo.id] || {
    isDuplicate: false,
    groupSize: 1,
  };

  const duplicatePenalty = duplicateInfo.isDuplicate ? Math.min(25, duplicateInfo.groupSize * 8) : 0;
  const blurPenalty = imageAnalysis.sharpnessScore < 25 ? 25 : 0;

  const overallScore = computeOverallScore({
    sharpnessScore: imageAnalysis.sharpnessScore,
    brightnessScore: imageAnalysis.brightnessScore,
    faceScore: Math.max(faceSignals.faceScore, modelOutput.aestheticScore * 0.5),
    smileScore: faceSignals.smileScore,
    eyesOpenScore: faceSignals.eyesOpenScore,
    compositionScore: imageAnalysis.compositionScore,
    duplicatePenalty,
    blurPenalty,
  });

  const recommendation = decideRecommendation({
    sharpnessScore: imageAnalysis.sharpnessScore,
    brightnessScore: imageAnalysis.brightnessScore,
    duplicateScore: duplicatePenalty,
    overallScore,
    faceScore: faceSignals.faceScore,
    smileScore: faceSignals.smileScore,
    eyesOpenScore: faceSignals.eyesOpenScore,
  });

  return {
    sharpnessScore: imageAnalysis.sharpnessScore,
    brightnessScore: imageAnalysis.brightnessScore,
    faceScore: faceSignals.faceScore,
    smileScore: faceSignals.smileScore,
    eyesOpenScore: faceSignals.eyesOpenScore,
    compositionScore: imageAnalysis.compositionScore,
    duplicateScore: duplicatePenalty,
    overallScore,
    aiRecommendation: recommendation,
    modelVersion: modelOutput.modelVersion,
    modelConfidence: modelOutput.confidence,
    qualityScore: modelOutput.aestheticScore,
  };
}

module.exports = { scorePhoto };
