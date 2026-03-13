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

    await sharp(file.buffer, { failOn: "none" })
      .resize(env.thumbnailWidth, env.thumbnailHeight, {
        fit: "cover",
        position: "attention",
      })
      .jpeg({ quality: 82 })
      .toFile(thumbnailPath);

    const photo = await imagesRepository.createPhoto({
      eventId,
      fileName: file.originalname,
      originalPath: storedOriginalPath,
      thumbnailPath: storedThumbnailPath,
      width: metadata.width || 0,
      height: metadata.height || 0,
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
