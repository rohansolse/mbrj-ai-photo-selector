const { pool } = require("../../../config/database");

async function saveFinalSelection({ eventId, photoId, selectedBy = "user", source = "manual" }) {
  const { rows } = await pool.query(
    `
      INSERT INTO final_selections (event_id, photo_id, selected_by, source)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (photo_id)
      DO UPDATE SET selected_by = EXCLUDED.selected_by, source = EXCLUDED.source
      RETURNING *
    `,
    [eventId, photoId, selectedBy, source],
  );

  return rows[0];
}

async function rejectPhoto(photoId) {
  await pool.query(
    `
      UPDATE photos
      SET status = 'rejected'
      WHERE id = $1
    `,
    [photoId],
  );
}

async function shortlistPhoto(photoId) {
  await pool.query(
    `
      UPDATE photos
      SET status = 'shortlisted'
      WHERE id = $1
    `,
    [photoId],
  );
}

async function listShortlistedPhotos(eventId) {
  const { rows } = await pool.query(
    `
      SELECT
        p.*,
        ps.sharpness_score,
        ps.brightness_score,
        ps.face_score,
        ps.smile_score,
        ps.eyes_open_score,
        ps.composition_score,
        ps.duplicate_score,
        ps.overall_score,
        ps.ai_recommendation
      FROM photos p
      LEFT JOIN photo_scores ps ON ps.photo_id = p.id
      WHERE p.event_id = $1
        AND p.status = 'shortlisted'
      ORDER BY ps.overall_score DESC NULLS LAST
    `,
    [eventId],
  );

  return rows;
}

async function listRejectedPhotos(eventId) {
  const { rows } = await pool.query(
    `
      SELECT
        p.*,
        ps.sharpness_score,
        ps.brightness_score,
        ps.face_score,
        ps.smile_score,
        ps.eyes_open_score,
        ps.composition_score,
        ps.duplicate_score,
        ps.overall_score,
        ps.ai_recommendation
      FROM photos p
      LEFT JOIN photo_scores ps ON ps.photo_id = p.id
      WHERE p.event_id = $1
        AND p.status = 'rejected'
      ORDER BY ps.overall_score ASC NULLS LAST
    `,
    [eventId],
  );

  return rows;
}

async function getEventSummary(eventId) {
  const { rows } = await pool.query(
    `
      SELECT
        e.id AS event_id,
        e.event_name,
        e.event_type,
        COALESCE((
          SELECT COUNT(*)
          FROM photos p
          WHERE p.event_id = e.id
        ), 0) AS total_uploaded,
        COALESCE((
          SELECT COUNT(*)
          FROM photos p
          WHERE p.event_id = e.id
            AND p.status = 'shortlisted'
        ), 0) AS shortlisted_count,
        COALESCE((
          SELECT COUNT(*)
          FROM photos p
          WHERE p.event_id = e.id
            AND p.status = 'rejected'
        ), 0) AS rejected_count,
        COALESCE((
          SELECT COUNT(*)
          FROM duplicate_groups dg
          WHERE dg.event_id = e.id
        ), 0) AS duplicate_groups_count,
        COALESCE((
          SELECT ROUND(AVG(ps.overall_score), 2)
          FROM photos p
          LEFT JOIN photo_scores ps ON ps.photo_id = p.id
          WHERE p.event_id = e.id
        ), 0) AS average_score,
        COALESCE((
          SELECT MAX(ps.overall_score)
          FROM photos p
          LEFT JOIN photo_scores ps ON ps.photo_id = p.id
          WHERE p.event_id = e.id
        ), 0) AS top_score,
        COALESCE((
          SELECT JSON_BUILD_OBJECT(
            'under50', COUNT(*) FILTER (WHERE ps.overall_score < 50),
            'fiftyToSeventy', COUNT(*) FILTER (WHERE ps.overall_score >= 50 AND ps.overall_score < 70),
            'seventyToEightyFive', COUNT(*) FILTER (WHERE ps.overall_score >= 70 AND ps.overall_score < 85),
            'eightyFivePlus', COUNT(*) FILTER (WHERE ps.overall_score >= 85)
          )
          FROM photos p
          LEFT JOIN photo_scores ps ON ps.photo_id = p.id
          WHERE p.event_id = e.id
        ), '{}'::json) AS score_distribution
      FROM events e
      WHERE e.id = $1
    `,
    [eventId],
  );

  return rows[0] || null;
}

async function getRankedPhotos(eventId) {
  const { rows } = await pool.query(
    `
      SELECT
        p.id,
        p.event_id,
        p.status,
        p.duplicate_group_id,
        ps.overall_score,
        ps.ai_recommendation
      FROM photos p
      LEFT JOIN photo_scores ps ON ps.photo_id = p.id
      WHERE p.event_id = $1
      ORDER BY ps.overall_score DESC NULLS LAST, p.created_at ASC
    `,
    [eventId],
  );

  return rows;
}

async function updatePhotoStatus(photoId, status) {
  await pool.query(`UPDATE photos SET status = $2 WHERE id = $1`, [photoId, status]);
}

module.exports = {
  getEventSummary,
  getRankedPhotos,
  listRejectedPhotos,
  listShortlistedPhotos,
  rejectPhoto,
  saveFinalSelection,
  shortlistPhoto,
  updatePhotoStatus,
};
