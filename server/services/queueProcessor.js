const { processQueue } = require("../workers/retryPendingForms");

let intervalId = null;

function start(intervalMs = 2000) {
  if (intervalId) return;
  intervalId = setInterval(async () => {
    try {
      const result = await processQueue();
      if (result && result.processed) {
        console.log(`Queue processed: ${result.processed}`);
      }
    } catch (err) {
      console.error("Queue processor error:", err);
    }
  }, intervalMs);
  console.log("Background queue processor started (every", intervalMs, "ms)");
}

function stop() {
  if (!intervalId) return;
  clearInterval(intervalId);
  intervalId = null;
}

module.exports = { start, stop };
