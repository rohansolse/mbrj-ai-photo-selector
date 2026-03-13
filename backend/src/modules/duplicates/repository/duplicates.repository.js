const { pool } = require("../../../config/database");

async function createOrGetGroup({ eventId, groupKey }) {
  const { rows } = await pool.query(
    `
      INSERT INTO duplicate_groups (event_id, group_key)
      VALUES ($1, $2)
      ON CONFLICT (event_id, group_key)
      DO UPDATE SET group_key = EXCLUDED.group_key
      RETURNING *
    `,
    [eventId, groupKey],
  );

  return rows[0];
}

async function assignPhotoToGroup(photoId, groupId) {
  await pool.query(`UPDATE photos SET duplicate_group_id = $2 WHERE id = $1`, [photoId, groupId]);
}

async function listGroupsForEvent(eventId) {
  const { rows } = await pool.query(
    `
      SELECT
        dg.id,
        dg.event_id,
        dg.group_key,
        dg.created_at,
        COUNT(p.id) AS photo_count,
        COALESCE(
          JSON_AGG(
            JSON_BUILD_OBJECT(
              'id', p.id,
              'file_name', p.file_name,
              'thumbnail_path', p.thumbnail_path,
              'status', p.status
            )
            ORDER BY p.created_at
          ) FILTER (WHERE p.id IS NOT NULL),
          '[]'::json
        ) AS photos
      FROM duplicate_groups dg
      LEFT JOIN photos p ON p.duplicate_group_id = dg.id
      WHERE dg.event_id = $1
      GROUP BY dg.id
      ORDER BY dg.created_at DESC
    `,
    [eventId],
  );

  return rows;
}

module.exports = { assignPhotoToGroup, createOrGetGroup, listGroupsForEvent };
