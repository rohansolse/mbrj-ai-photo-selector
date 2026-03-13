const { pool } = require("../../../config/database");

async function createEvent({ eventName, eventType }) {
  const query = `
    INSERT INTO events (event_name, event_type)
    VALUES ($1, $2)
    RETURNING id, event_name, event_type, created_at
  `;

  const { rows } = await pool.query(query, [eventName, eventType]);
  return rows[0];
}

async function getEventById(eventId) {
  const { rows } = await pool.query(
    `
      SELECT id, event_name, event_type, created_at
      FROM events
      WHERE id = $1
    `,
    [eventId],
  );

  return rows[0] || null;
}

async function listEvents() {
  const { rows } = await pool.query(`
    SELECT
      e.id,
      e.event_name,
      e.event_type,
      e.created_at,
      COUNT(p.id) AS total_photos
    FROM events e
    LEFT JOIN photos p ON p.event_id = e.id
    GROUP BY e.id
    ORDER BY e.created_at DESC
  `);

  return rows;
}

module.exports = { createEvent, getEventById, listEvents };
