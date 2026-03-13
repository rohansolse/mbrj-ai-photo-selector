const express = require("express");

const controller = require("../controllers/events.controller");
const { uploadMiddleware } = require("../../upload/services/upload.middleware");

const router = express.Router();

router.get("/", controller.listEvents);
router.post("/", controller.createEvent);
router.post("/:eventId/upload", uploadMiddleware.array("photos", 500), controller.uploadPhotos);
router.post("/:eventId/process", controller.processEvent);
router.get("/:eventId/photos", controller.getEventPhotos);
router.get("/:eventId/shortlisted", controller.getShortlistedPhotos);
router.get("/:eventId/rejected", controller.getRejectedPhotos);
router.get("/:eventId/duplicates", controller.getDuplicateGroups);
router.get("/:eventId/summary", controller.getEventSummary);

module.exports = router;
