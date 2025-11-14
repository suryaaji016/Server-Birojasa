const express = require("express");
const router = express.Router();
const PartnerController = require("../controllers/partnerController");
const multer = require("multer");
const path = require("path");
const { authentication } = require("../middlewares/authentication");

// Konfigurasi multer khusus untuk partners
const fs = require("fs");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(process.cwd(), "uploads", "partners");
    try {
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      cb(null, dir);
    } catch (err) {
      cb(err);
    }
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + path.extname(file.originalname);
    cb(null, uniqueName);
  },
});
const upload = multer({ storage });

router.get("/", PartnerController.getAll);
// hanya admin (authentication) boleh tambah / hapus
router.post(
  "/",
  authentication,
  upload.single("logo"),
  PartnerController.create
);
router.put(
  "/:id",
  authentication,
  upload.single("logo"),
  PartnerController.update
);
router.delete("/:id", authentication, PartnerController.remove);

module.exports = router;
