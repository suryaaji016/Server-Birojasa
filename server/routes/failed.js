const express = require("express");
const router = express.Router();
const FailedController = require("../controllers/failedController");

router.get("/", FailedController.list);
router.post("/requeue", FailedController.requeue);

module.exports = router;
