const express = require("express");
const router = express.Router();
const ServiceConfigController = require("../controllers/serviceConfigController");
const { authentication } = require("../middlewares/authentication");

router.get("/services", ServiceConfigController.getConfig);
// put protected
router.put("/services", authentication, ServiceConfigController.updateConfig);

module.exports = router;
