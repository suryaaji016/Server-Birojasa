const express = require("express");
const router = express.Router();
const BannerController = require("../controllers/bannerController");
const multer = require("multer");
const path = require("path");

// 📁 Konfigurasi Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/banners"),
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + path.extname(file.originalname);
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

// Endpoint
router.get("/", BannerController.getAll);
router.post("/", upload.single("image"), BannerController.upload);
router.delete("/:id", BannerController.delete);

module.exports = router;
