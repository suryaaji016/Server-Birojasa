const express = require("express");
const router = express.Router();
const ReviewController = require("../controllers/reviewController");
const multer = require("multer");
const path = require("path");

// 📸 konfigurasi multer untuk simpan foto review
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/reviews"),
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + path.extname(file.originalname);
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

// ROUTES
router.get("/", ReviewController.getAll);
router.post("/", upload.single("image"), ReviewController.create);
router.delete("/:id", ReviewController.delete);

module.exports = router;
