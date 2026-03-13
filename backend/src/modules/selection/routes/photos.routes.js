const express = require("express");

const controller = require("../controllers/photos.controller");

const router = express.Router();

router.patch("/:photoId/select", controller.selectPhoto);
router.patch("/:photoId/reject", controller.rejectPhoto);
router.patch("/:photoId/unselect", controller.unselectPhoto);

module.exports = router;
