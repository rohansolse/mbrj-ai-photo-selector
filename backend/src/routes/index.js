const express = require("express");

const eventRoutes = require("../modules/events/routes/events.routes");
const photoRoutes = require("../modules/selection/routes/photos.routes");

const router = express.Router();

router.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

router.use("/events", eventRoutes);
router.use("/photos", photoRoutes);

module.exports = router;
