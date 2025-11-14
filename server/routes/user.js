const express = require("express");
const router = express.Router();
const UserController = require("../controllers/userController");
const { authentication } = require("../middlewares/authentication");

router.post("/register", UserController.register);
router.post("/login", UserController.login);
router.get("/profile", authentication, UserController.profile);

module.exports = router;
