const imagesRepository = require("../../images/repository/images.repository");
const scoringRepository = require("../../scoring/repository/scoring.repository");
const { scorePhoto } = require("../../scoring/services/scoring.service");
const { buildDuplicateContext } = require("../../duplicates/services/duplicates.service");
const { applySelectionDecisions } = require("../../selection/services/selection.service");
const { resolveUploadPath } = require("../../../utils/fileSystem");

const jobs = new Map();

function buildJobId(eventId) {
  return `event-${eventId}-${Date.now()}`;
}

async function processEvent(jobId, eventId) {
  const job = jobs.get(jobId);

  try {
    job.status = "processing";
    const photos = await imagesRepository.listPhotosForProcessing(eventId);
    const photosWithPaths = photos.map((photo) => ({
      ...photo,
      original_path: resolveUploadPath(photo.original_path),
      thumbnail_path: resolveUploadPath(photo.thumbnail_path),
    }));
    const duplicateContext = await buildDuplicateContext(eventId, photosWithPaths);
    let processedCount = 0;

    for (const photo of photosWithPaths) {
      await imagesRepository.updatePhotoStatus(photo.id, "processing");
      const score = await scorePhoto(photo, duplicateContext);
      await scoringRepository.upsertPhotoScore({
        photoId: photo.id,
        ...score,
      });
      await imagesRepository.updatePhotoStatus(photo.id, "scored");
      processedCount += 1;
      job.progress = Math.round((processedCount / Math.max(1, photos.length)) * 80);
    }

    const selectionResult = await applySelectionDecisions(eventId);
    job.status = "completed";
    job.progress = 100;
    job.result = selectionResult;
  } catch (error) {
    job.status = "failed";
    job.error = error.message;
  }
}

async function enqueueEventProcessing(eventId) {
  const jobId = buildJobId(eventId);
  const job = {
    id: jobId,
    eventId,
    progress: 0,
    status: "queued",
    createdAt: new Date().toISOString(),
  };

  jobs.set(jobId, job);
  setImmediate(() => {
    processEvent(jobId, eventId);
  });

  return job;
}

function getJob(jobId) {
  return jobs.get(jobId) || null;
}

module.exports = { enqueueEventProcessing, getJob };
