const fs = require("fs");
const path = require("path");
const { processQueue } = require("../workers/retryPendingForms");

const QUEUE_PATH = path.join(__dirname, "..", "uploads", "pendingForms.jsonl");

class QueueController {
  static async list(req, res) {
    try {
      if (!fs.existsSync(QUEUE_PATH)) return res.json([]);
      const lines = fs
        .readFileSync(QUEUE_PATH, "utf8")
        .split("\n")
        .filter(Boolean);
      const items = lines.map((l) => JSON.parse(l));
      res.json(items);
    } catch (err) {
      res
        .status(500)
        .json({ message: "Failed to read queue", error: String(err) });
    }
  }

  static async retry(req, res) {
    try {
      const result = await processQueue();
      res.json(result);
    } catch (err) {
      res
        .status(500)
        .json({ message: "Failed to process queue", error: String(err) });
    }
  }
}

module.exports = QueueController;
