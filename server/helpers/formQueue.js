const fs = require("fs");
const path = require("path");

const QUEUE_PATH = path.join(__dirname, "..", "uploads", "pendingForms.jsonl");

function ensureQueueDir() {
  const dir = path.dirname(QUEUE_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

async function appendForm(form) {
  return new Promise((resolve, reject) => {
    try {
      ensureQueueDir();
      const line = JSON.stringify(form) + "\n";
      fs.appendFile(QUEUE_PATH, line, (err) => {
        if (err) return reject(err);
        resolve();
      });
    } catch (e) {
      reject(e);
    }
  });
}

module.exports = { appendForm };
