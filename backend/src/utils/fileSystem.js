const fs = require("fs/promises");
const path = require("path");

const { env } = require("../config/env");

async function ensureDir(dirPath) {
  await fs.mkdir(dirPath, { recursive: true });
}

async function removeDir(dirPath) {
  await fs.rm(dirPath, { recursive: true, force: true });
}

function getEventUploadPaths(uploadRoot, eventId) {
  const baseDir = path.resolve(uploadRoot, String(eventId));
  return {
    baseDir,
    originalsDir: path.join(baseDir, "originals"),
    thumbnailsDir: path.join(baseDir, "thumbnails"),
  };
}

function resolveUploadPath(storedPath) {
  return path.resolve(env.uploadRoot, "..", storedPath);
}

module.exports = { ensureDir, getEventUploadPaths, removeDir, resolveUploadPath };
