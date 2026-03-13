const fs = require("fs/promises");
const path = require("path");
const sharp = require("sharp");
const { v4: uuidv4 } = require("uuid");

const { env } = require("../../../config/env");
const imagesRepository = require("../../images/repository/images.repository");
const { ensureDir, getEventUploadPaths } = require("../../../utils/fileSystem");

async function persistUploadedFiles({ eventId, files }) {
  const eventPaths = getEventUploadPaths(env.uploadRoot, eventId);
  await Promise.all([
    ensureDir(eventPaths.baseDir),
    ensureDir(eventPaths.originalsDir),
    ensureDir(eventPaths.thumbnailsDir),
  ]);

  const created = [];

  for (const file of files) {
    const ext = path.extname(file.originalname).toLowerCase() || ".jpg";
    const fileId = uuidv4();
    const fileName = `${fileId}${ext}`;
    const thumbName = `${fileId}.jpg`;
    const originalPath = path.join(eventPaths.originalsDir, fileName);
    const thumbnailPath = path.join(eventPaths.thumbnailsDir, thumbName);
    const storedOriginalPath = path.posix.join("events", String(eventId), "originals", fileName);
    const storedThumbnailPath = path.posix.join("events", String(eventId), "thumbnails", thumbName);

    await fs.writeFile(originalPath, file.buffer);

    const metadata = await sharp(file.buffer, { failOn: "none" }).metadata();
    const normalizedWidth =
      metadata.orientation && [5, 6, 7, 8].includes(metadata.orientation)
        ? metadata.height || 0
        : metadata.width || 0;
    const normalizedHeight =
      metadata.orientation && [5, 6, 7, 8].includes(metadata.orientation)
        ? metadata.width || 0
        : metadata.height || 0;

    await sharp(file.buffer, { failOn: "none" })
      .rotate()
      .resize(env.thumbnailWidth, env.thumbnailHeight, {
        fit: "inside",
        withoutEnlargement: true,
      })
      .flatten({ background: "#f6f1e8" })
      .jpeg({ quality: 82 })
      .toFile(thumbnailPath);

    const photo = await imagesRepository.createPhoto({
      eventId,
      fileName: file.originalname,
      originalPath: storedOriginalPath,
      thumbnailPath: storedThumbnailPath,
      width: normalizedWidth,
      height: normalizedHeight,
      fileSize: file.size,
      capturedAt: metadata.exif ? new Date() : null,
    });

    created.push(photo);
  }

  return {
    eventId,
    uploadedCount: created.length,
    photos: created,
    status: "uploaded",
  };
}

module.exports = { persistUploadedFiles };
