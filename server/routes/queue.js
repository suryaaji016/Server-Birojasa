const express = require("express");
const router = express.Router();
const QueueController = require("../controllers/queueController");

router.get("/", QueueController.list);
router.post("/retry", QueueController.retry);

module.exports = router;
