const { asyncHandler } = require("../../../utils/asyncHandler");
const { httpError } = require("../../../utils/httpError");
const selectionService = require("../services/selection.service");
const { pool } = require("../../../config/database");

async function resolvePhoto(photoId) {
  const { rows } = await pool.query(`SELECT id, event_id FROM photos WHERE id = $1`, [photoId]);
  return rows[0] || null;
}

const selectPhoto = asyncHandler(async (req, res) => {
  const { photoId } = req.params;
  const photo = await resolvePhoto(photoId);

  if (!photo) {
    throw httpError(404, "Photo not found");
  }

  const result = await selectionService.manualSelectPhoto({
    eventId: photo.event_id,
    photoId,
    selectedBy: req.body.selectedBy || "user",
    source: req.body.source || "manual",
  });

  res.json(result);
});

const rejectPhoto = asyncHandler(async (req, res) => {
  const { photoId } = req.params;
  const photo = await resolvePhoto(photoId);

  if (!photo) {
    throw httpError(404, "Photo not found");
  }

  const result = await selectionService.manualRejectPhoto(photoId);
  res.json(result);
});

const unselectPhoto = asyncHandler(async (req, res) => {
  const { photoId } = req.params;
  const photo = await resolvePhoto(photoId);

  if (!photo) {
    throw httpError(404, "Photo not found");
  }

  const result = await selectionService.manualUnselectPhoto(photoId);
  res.json(result);
});

module.exports = { rejectPhoto, selectPhoto, unselectPhoto };
