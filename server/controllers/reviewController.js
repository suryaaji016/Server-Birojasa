const { Review } = require("../models");
const fs = require("fs");
const path = require("path");

class ReviewController {
  static async getAll(req, res) {
    try {
      const data = await Review.findAll({ order: [["id", "DESC"]] });
      res.json(data);
    } catch (error) {
      res.status(500).json({ message: "Internal Server Error" });
    }
  }

  static async create(req, res) {
    try {
      const { name, message } = req.body;
      // multer for reviews stores files under uploads/reviews
      const imageUrl = req.file
        ? `/uploads/reviews/${req.file.filename}`
        : null;
      const newReview = await Review.create({ name, message, imageUrl });
      res.status(201).json(newReview);
    } catch (error) {
      res.status(500).json({ message: "Internal Server Error" });
    }
  }

  static async delete(req, res) {
    try {
      const { id } = req.params;
      const review = await Review.findByPk(id);
      if (!review) return res.status(404).json({ message: "Not found" });
      // delete file from disk if exists
      if (review.imageUrl) {
        const imagePath = path.join(__dirname, "../", review.imageUrl);
        if (fs.existsSync(imagePath)) {
          try {
            fs.unlinkSync(imagePath);
          } catch (e) {
            // ignore unlink errors
          }
        }
      }

      await review.destroy();
      res.json({ message: "Review deleted" });
    } catch (error) {
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
}

module.exports = ReviewController;
