const { env } = require("../../../config/env");
const selectionRepository = require("../repository/selection.repository");

async function applySelectionDecisions(eventId) {
  const ranked = await selectionRepository.getRankedPhotos(eventId);
  const shortlistCount = ranked.length
    ? Math.min(env.shortlistMaxCount, Math.max(1, Math.ceil(ranked.length * env.shortlistPercentage)))
    : 0;

  const duplicateWinners = new Set();
  const shortlistedIds = new Set();

  for (const photo of ranked) {
    const isRejected = photo.ai_recommendation === "rejected";
    if (isRejected) {
      await selectionRepository.updatePhotoStatus(photo.id, "rejected");
      continue;
    }

    if (photo.duplicate_group_id) {
      if (duplicateWinners.has(photo.duplicate_group_id)) {
        await selectionRepository.updatePhotoStatus(photo.id, "rejected");
        continue;
      }

      duplicateWinners.add(photo.duplicate_group_id);
    }

    if (shortlistedIds.size < shortlistCount && photo.ai_recommendation !== "rejected") {
      shortlistedIds.add(photo.id);
      await selectionRepository.updatePhotoStatus(photo.id, "shortlisted");
      continue;
    }

    await selectionRepository.updatePhotoStatus(photo.id, "needs_manual_review");
  }

  // TODO: Add edited-vs-raw workflow awareness so RAW keepers can be promoted separately.
  // TODO: Add Lightroom/export integration once final selection output contracts are defined.
  return {
    shortlistCount,
    shortlistedIds: Array.from(shortlistedIds),
  };
}

async function manualSelectPhoto({ eventId, photoId, selectedBy, source }) {
  await selectionRepository.updatePhotoStatus(photoId, "shortlisted");
  return selectionRepository.saveFinalSelection({ eventId, photoId, selectedBy, source });
}

async function manualRejectPhoto(photoId) {
  await selectionRepository.rejectPhoto(photoId);
  return { photoId, status: "rejected" };
}

module.exports = { applySelectionDecisions, manualRejectPhoto, manualSelectPhoto };
