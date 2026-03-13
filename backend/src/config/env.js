const path = require("path");

const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 4000),
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:4200",
  databaseUrl:
    process.env.DATABASE_URL ||
    "postgresql://postgres:postgres@localhost:5432/mbrj_ai_photo_selector",
  uploadRoot: process.env.UPLOAD_ROOT || path.resolve(__dirname, "../../uploads/events"),
  thumbnailWidth: Number(process.env.THUMBNAIL_WIDTH || 480),
  thumbnailHeight: Number(process.env.THUMBNAIL_HEIGHT || 320),
  shortlistPercentage: Number(process.env.SHORTLIST_PERCENTAGE || 0.1),
  shortlistMaxCount: Number(process.env.SHORTLIST_MAX_COUNT || 100),
  tfModelPath: process.env.TF_MODEL_PATH || "",
  aiModelVersion: process.env.AI_MODEL_VERSION || "v1-placeholder",
};

module.exports = { env };
