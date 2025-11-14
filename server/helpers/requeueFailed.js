const fs = require("fs");
const path = require("path");
const PENDING = path.join(__dirname, "..", "uploads", "pendingForms.jsonl");
const FAILED = path.join(__dirname, "..", "uploads", "failedForms.jsonl");

function requeueFailed() {
  if (!fs.existsSync(FAILED)) return 0;
  const lines = fs.readFileSync(FAILED, "utf8").split("\n").filter(Boolean);
  if (!lines.length) return 0;
  // append to pending
  fs.appendFileSync(PENDING, lines.join("\n") + "\n", "utf8");
  // clear failed file
  fs.writeFileSync(FAILED, "", "utf8");
  return lines.length;
}

module.exports = { requeueFailed };
