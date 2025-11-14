const { Banner } = require("../models");
const fs = require("fs");
const path = require("path");

class BannerController {
  static async getAll(req, res) {
    try {
      const banners = await Banner.findAll({ order: [["id", "DESC"]] });
      res.json(banners);
    } catch (err) {
      res.status(500).json({ message: "Internal Server Error" });
    }
  }

  static async upload(req, res) {
    try {
      if (!req.file)
        return res.status(400).json({ message: "No file uploaded" });

      const newBanner = await Banner.create({
        imageUrl: `/uploads/banners/${req.file.filename}`,
      });

      res.status(201).json(newBanner);
    } catch (err) {
      res.status(500).json({ message: "Upload failed" });
    }
  }

  static async delete(req, res) {
    try {
      const { id } = req.params;
      const banner = await Banner.findByPk(id);
      if (!banner) return res.status(404).json({ message: "Banner not found" });

      const imagePath = path.join(__dirname, "../", banner.imageUrl);
      if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);

      await banner.destroy();
      res.json({ message: "Banner deleted successfully" });
    } catch (err) {
      res.status(500).json({ message: "Delete failed" });
    }
  }
}

module.exports = BannerController;
