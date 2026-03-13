const multer = require("multer");

const { httpError } = require("../../../utils/httpError");

const allowedMimeTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

const uploadMiddleware = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024,
    files: 500,
  },
  fileFilter: (_req, file, callback) => {
    if (!allowedMimeTypes.has(file.mimetype)) {
      callback(httpError(400, `Unsupported file type: ${file.mimetype}`));
      return;
    }

    callback(null, true);
  },
});

module.exports = { uploadMiddleware };
