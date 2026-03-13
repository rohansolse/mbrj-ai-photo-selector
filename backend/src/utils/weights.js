const V1_SCORING_WEIGHTS = {
  sharpness: 0.35,
  brightness: 0.15,
  facePortrait: 0.2,
  smileEyes: 0.15,
  composition: 0.15,
};

function clampScore(value) {
  return Math.max(0, Math.min(100, Number(value || 0)));
}

function computeOverallScore({
  sharpnessScore,
  brightnessScore,
  faceScore,
  smileScore,
  eyesOpenScore,
  compositionScore,
  duplicatePenalty = 0,
  blurPenalty = 0,
}) {
  const facePortrait = clampScore(faceScore);
  const smileEyes = (clampScore(smileScore) + clampScore(eyesOpenScore)) / 2;
  const weighted =
    clampScore(sharpnessScore) * V1_SCORING_WEIGHTS.sharpness +
    clampScore(brightnessScore) * V1_SCORING_WEIGHTS.brightness +
    facePortrait * V1_SCORING_WEIGHTS.facePortrait +
    smileEyes * V1_SCORING_WEIGHTS.smileEyes +
    clampScore(compositionScore) * V1_SCORING_WEIGHTS.composition;

  return clampScore(weighted - duplicatePenalty - blurPenalty);
}

module.exports = { V1_SCORING_WEIGHTS, clampScore, computeOverallScore };
