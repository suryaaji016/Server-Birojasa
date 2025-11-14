const express = require("express");
const router = express.Router();
const ServiceFormController = require("../controllers/serviceFormController");

router.post("/", ServiceFormController.send);

module.exports = router;
