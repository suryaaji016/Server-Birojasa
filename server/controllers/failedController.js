const fs = require("fs");
const path = require("path");
const { appendForm } = require("../helpers/formQueue");

const FAILED_PATH = path.join(__dirname, "..", "uploads", "failedForms.jsonl");

class FailedController {
  static list(req, res) {
    try {
      if (!fs.existsSync(FAILED_PATH)) return res.json([]);
      const lines = fs
        .readFileSync(FAILED_PATH, "utf8")
        .split("\n")
        .filter(Boolean);
      const items = lines.map((l) => {
        try {
          return JSON.parse(l);
        } catch (e) {
          return { raw: l };
        }
      });
      res.json(items);
    } catch (err) {
      res
        .status(500)
        .json({ message: "Failed to read failed forms", error: String(err) });
    }
  }

  static async requeue(req, res) {
    try {
      const { index } = req.body; // index in the failed list
      if (!fs.existsSync(FAILED_PATH))
        return res.status(404).json({ message: "No failed forms" });
      const lines = fs
        .readFileSync(FAILED_PATH, "utf8")
        .split("\n")
        .filter(Boolean);
      if (index < 0 || index >= lines.length)
        return res.status(400).json({ message: "Invalid index" });
      const item = lines[index];
      // append to pending queue
      await appendForm(JSON.parse(item));
      // remove item from failed file
      lines.splice(index, 1);
      fs.writeFileSync(
        FAILED_PATH,
        lines.join("\n") + (lines.length ? "\n" : ""),
        "utf8"
      );
      res.json({ message: "Requeued" });
    } catch (err) {
      res
        .status(500)
        .json({ message: "Failed to requeue", error: String(err) });
    }
  }
}

module.exports = FailedController;
