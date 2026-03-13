const { asyncHandler } = require("../../../utils/asyncHandler");
const { httpError } = require("../../../utils/httpError");
const eventRepository = require("../repository/events.repository");
const uploadService = require("../../upload/services/upload.service");
const jobsService = require("../../jobs/services/jobs.service");
const imagesRepository = require("../../images/repository/images.repository");
const duplicatesRepository = require("../../duplicates/repository/duplicates.repository");
const selectionRepository = require("../../selection/repository/selection.repository");
const { env } = require("../../../config/env");
const { getEventUploadPaths, removeDir } = require("../../../utils/fileSystem");

const createEvent = asyncHandler(async (req, res) => {
  const { eventName, eventType } = req.body;

  if (!eventName || !eventType) {
    throw httpError(400, "eventName and eventType are required");
  }

  const event = await eventRepository.createEvent({ eventName, eventType });
  res.status(201).json(event);
});

const listEvents = asyncHandler(async (_req, res) => {
  const events = await eventRepository.listEvents();
  res.json(events);
});

const deleteEvent = asyncHandler(async (req, res) => {
  const { eventId } = req.params;
  const event = await eventRepository.getEventById(eventId);

  if (!event) {
    throw httpError(404, "Event not found");
  }

  await eventRepository.deleteEvent(eventId);

  const { baseDir } = getEventUploadPaths(env.uploadRoot, eventId);
  await removeDir(baseDir);

  res.status(204).send();
});

const uploadPhotos = asyncHandler(async (req, res) => {
  const { eventId } = req.params;
  const event = await eventRepository.getEventById(eventId);

  if (!event) {
    throw httpError(404, "Event not found");
  }

  if (!req.files || req.files.length === 0) {
    throw httpError(400, "At least one image is required");
  }

  const result = await uploadService.persistUploadedFiles({
    eventId,
    files: req.files,
  });

  res.status(202).json(result);
});

const processEvent = asyncHandler(async (req, res) => {
  const { eventId } = req.params;
  const event = await eventRepository.getEventById(eventId);

  if (!event) {
    throw httpError(404, "Event not found");
  }

  const job = await jobsService.enqueueEventProcessing(eventId);
  res.status(202).json(job);
});

const getEventPhotos = asyncHandler(async (req, res) => {
  const { eventId } = req.params;
  const photos = await imagesRepository.listEventPhotos(eventId, req.query);
  res.json(photos);
});

const getShortlistedPhotos = asyncHandler(async (req, res) => {
  const { eventId } = req.params;
  const photos = await selectionRepository.listShortlistedPhotos(eventId);
  res.json(photos);
});

const getRejectedPhotos = asyncHandler(async (req, res) => {
  const { eventId } = req.params;
  const photos = await selectionRepository.listRejectedPhotos(eventId);
  res.json(photos);
});

const getDuplicateGroups = asyncHandler(async (req, res) => {
  const { eventId } = req.params;
  const groups = await duplicatesRepository.listGroupsForEvent(eventId);
  res.json(groups);
});

const getEventSummary = asyncHandler(async (req, res) => {
  const { eventId } = req.params;
  const summary = await selectionRepository.getEventSummary(eventId);
  res.json(summary);
});

module.exports = {
  createEvent,
  deleteEvent,
  getDuplicateGroups,
  getEventPhotos,
  getEventSummary,
  getRejectedPhotos,
  getShortlistedPhotos,
  listEvents,
  processEvent,
  uploadPhotos,
};
