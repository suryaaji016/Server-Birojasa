const express = require("express");
const router = express.Router();
const BannerController = require("../controllers/bannerController");
const multer = require("multer");
const path = require("path");
const { authentication } = require("../middlewares/authentication");
const { adminOnly } = require("../middlewares/authorization");

// 📁 konfigurasi multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/banners"),
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + path.extname(file.originalname);
    cb(null, uniqueName);
  },
});
const upload = multer({ storage });

// 🧩 ROUTES
// ✅ Public — semua boleh lihat banner
router.get("/", BannerController.getAll);

// 🔒 Protected — hanya admin login boleh upload & hapus
router.use(authentication);
router.use(adminOnly);

router.post("/", upload.single("image"), BannerController.upload);
router.delete("/:id", BannerController.delete);

module.exports = router;
