const { pool } = require("../../../config/database");

async function createPhoto({
  eventId,
  fileName,
  originalPath,
  thumbnailPath,
  width,
  height,
  fileSize,
  capturedAt,
}) {
  const { rows } = await pool.query(
    `
      INSERT INTO photos (
        event_id,
        file_name,
        original_path,
        thumbnail_path,
        width,
        height,
        file_size,
        captured_at,
        status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'uploaded')
      RETURNING *
    `,
    [eventId, fileName, originalPath, thumbnailPath, width, height, fileSize, capturedAt],
  );

  return rows[0];
}

async function listPhotosForProcessing(eventId) {
  const { rows } = await pool.query(
    `
      SELECT *
      FROM photos
      WHERE event_id = $1
      ORDER BY created_at ASC
    `,
    [eventId],
  );

  return rows;
}

async function updatePhotoStatus(photoId, status) {
  await pool.query(`UPDATE photos SET status = $2 WHERE id = $1`, [photoId, status]);
}

async function listEventPhotos(eventId, filters = {}) {
  const values = [eventId];
  const whereClauses = ["p.event_id = $1"];
  let index = values.length + 1;

  if (filters.status) {
    whereClauses.push(`p.status = $${index}`);
    values.push(filters.status);
    index += 1;
  }

  if (filters.recommendation) {
    whereClauses.push(`ps.ai_recommendation = $${index}`);
    values.push(filters.recommendation);
    index += 1;
  }

  if (filters.isDuplicate === "true") {
    whereClauses.push(`p.duplicate_group_id IS NOT NULL`);
  }

  if (filters.isBlurry === "true") {
    whereClauses.push(`ps.sharpness_score < 28`);
  }

  if (filters.isSmiling === "true") {
    whereClauses.push(`ps.smile_score >= 55`);
  }

  if (filters.hasFace === "true") {
    whereClauses.push(`ps.face_score >= 40`);
  }

  const sortMap = {
    newest: "p.created_at DESC",
    sharpness: "ps.sharpness_score DESC NULLS LAST",
    smile: "ps.smile_score DESC NULLS LAST",
    overall: "ps.overall_score DESC NULLS LAST",
  };

  const sortKey = sortMap[filters.sortBy] || sortMap.overall;

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
        ps.ai_recommendation,
        dg.group_key,
        fs.id AS final_selection_id,
        CASE WHEN p.duplicate_group_id IS NOT NULL THEN true ELSE false END AS is_duplicate
      FROM photos p
      LEFT JOIN photo_scores ps ON ps.photo_id = p.id
      LEFT JOIN duplicate_groups dg ON dg.id = p.duplicate_group_id
      LEFT JOIN final_selections fs ON fs.photo_id = p.id
      WHERE ${whereClauses.join(" AND ")}
      ORDER BY ${sortKey}
    `,
    values,
  );

  return rows;
}

module.exports = {
  createPhoto,
  listEventPhotos,
  listPhotosForProcessing,
  updatePhotoStatus,
};
