const { pool } = require("../../../config/database");

async function upsertPhotoScore({
  photoId,
  sharpnessScore,
  brightnessScore,
  faceScore,
  smileScore,
  eyesOpenScore,
  compositionScore,
  duplicateScore,
  overallScore,
  aiRecommendation,
  modelVersion,
}) {
  const { rows } = await pool.query(
    `
      INSERT INTO photo_scores (
        photo_id,
        sharpness_score,
        brightness_score,
        face_score,
        smile_score,
        eyes_open_score,
        composition_score,
        duplicate_score,
        overall_score,
        ai_recommendation,
        model_version
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      ON CONFLICT (photo_id)
      DO UPDATE SET
        sharpness_score = EXCLUDED.sharpness_score,
        brightness_score = EXCLUDED.brightness_score,
        face_score = EXCLUDED.face_score,
        smile_score = EXCLUDED.smile_score,
        eyes_open_score = EXCLUDED.eyes_open_score,
        composition_score = EXCLUDED.composition_score,
        duplicate_score = EXCLUDED.duplicate_score,
        overall_score = EXCLUDED.overall_score,
        ai_recommendation = EXCLUDED.ai_recommendation,
        model_version = EXCLUDED.model_version
      RETURNING *
    `,
    [
      photoId,
      sharpnessScore,
      brightnessScore,
      faceScore,
      smileScore,
      eyesOpenScore,
      compositionScore,
      duplicateScore,
      overallScore,
      aiRecommendation,
      modelVersion,
    ],
  );

  return rows[0];
}

module.exports = { upsertPhotoScore };
