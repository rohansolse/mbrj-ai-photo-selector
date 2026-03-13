require("dotenv").config();

const path = require("path");
const sharp = require("sharp");

const { pool } = require("../config/database");
const { env } = require("../config/env");
const { ensureDir, resolveUploadPath } = require("./fileSystem");

async function regenerate() {
  const eventId = process.argv[2] || null;
  const values = [];
  let whereClause = "";

  if (eventId) {
    values.push(eventId);
    whereClause = "WHERE event_id = $1";
  }

  const { rows } = await pool.query(
    `
      SELECT id, original_path, thumbnail_path
      FROM photos
      ${whereClause}
      ORDER BY created_at ASC
    `,
    values,
  );

  for (const photo of rows) {
    const sourcePath = resolveUploadPath(photo.original_path);
    const targetPath = resolveUploadPath(photo.thumbnail_path);
    const metadata = await sharp(sourcePath, { failOn: "none" }).metadata();
    const normalizedWidth =
      metadata.orientation && [5, 6, 7, 8].includes(metadata.orientation)
        ? metadata.height || 0
        : metadata.width || 0;
    const normalizedHeight =
      metadata.orientation && [5, 6, 7, 8].includes(metadata.orientation)
        ? metadata.width || 0
        : metadata.height || 0;

    await ensureDir(path.dirname(targetPath));
    await sharp(sourcePath, { failOn: "none" })
      .rotate()
      .resize(env.thumbnailWidth, env.thumbnailHeight, {
        fit: "inside",
        withoutEnlargement: true,
      })
      .flatten({ background: "#f6f1e8" })
      .jpeg({ quality: 82 })
      .toFile(targetPath);

    await pool.query(`UPDATE photos SET width = $2, height = $3 WHERE id = $1`, [
      photo.id,
      normalizedWidth,
      normalizedHeight,
    ]);

    console.log(`Regenerated thumbnail for photo ${photo.id}`);
  }

  await pool.end();
}

regenerate().catch(async (error) => {
  console.error("Failed to regenerate thumbnails", error);
  await pool.end();
  process.exitCode = 1;
});
