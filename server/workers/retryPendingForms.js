const fs = require("fs");
const path = require("path");
const { appendForm } = require("../helpers/formQueue");
const { sendMail } = require("../services/mailer");

const QUEUE_PATH = path.join(__dirname, "..", "uploads", "pendingForms.jsonl");
const FAILED_PATH = path.join(__dirname, "..", "uploads", "failedForms.jsonl");
const MAX_RETRY = parseInt(process.env.MAX_RETRY_ATTEMPTS || "3", 10);

async function processQueue() {
  if (!fs.existsSync(QUEUE_PATH)) return { processed: 0 };
  const lines = fs.readFileSync(QUEUE_PATH, "utf8").split("\n").filter(Boolean);
  if (!lines.length) return { processed: 0 };

  const remaining = [];
  const failed = [];
  let processed = 0;
  // using email transporter, no socket init required

  // process in concurrent batches to speed up
  const BATCH_SIZE = parseInt(process.env.QUEUE_BATCH_SIZE || "5", 10);
  for (let i = 0; i < lines.length; i += BATCH_SIZE) {
    const batch = lines.slice(i, i + BATCH_SIZE);
    const promises = batch.map(async (line) => {
      try {
        const item = JSON.parse(line);
        item._attempts = item._attempts ? Number(item._attempts) : 0;
        // route to email address per branch
        const to =
          (item.cabang && process.env[`EMAIL_${item.cabang.toUpperCase()}`]) ||
          process.env.EMAIL_DEFAULT;
        if (!to) {
          failed.push(
            Object.assign({}, item, { error: "No routing for cabang/email" })
          );
          return;
        }
        const subject = `Permintaan Layanan Baru: ${item.nama || "unknown"}`;
        // tolerate older queued items which may use 'service' key instead of 'layanan'
        const serviceName = item.layanan || item.service || "-";
        // include category (no checklist/persyaratan)
        const textBody = `Permintaan layanan dari ${item.nama || "unknown"}
NoTelp: ${item.noTelp || "-"}
Kategori: ${item.category || "-"}
Layanan: ${serviceName}
Daerah: ${item.daerah || "-"}
Asal: ${item.asal || "-"}
Tujuan: ${item.tujuan || "-"}
NoPolisi: ${item.noPolisi || "-"}
Cabang: ${item.cabang || "-"}`;
        const htmlBody = `
          <h3>Permintaan Layanan Baru dari Website Biro Jasa</h3>
          <p><strong>Nama:</strong> ${item.nama || "-"}</p>
          <p><strong>NoTelp:</strong> ${item.noTelp || "-"}</p>
          <p><strong>Kategori:</strong> ${item.category || "-"}</p>
          <p><strong>Layanan:</strong> ${serviceName}</p>
          <p><strong>Daerah:</strong> ${item.daerah || "-"}</p>
          <p><strong>Asal:</strong> ${item.asal || "-"}</p>
          <p><strong>Tujuan:</strong> ${item.tujuan || "-"}</p>
          <p><strong>NoPolisi:</strong> ${item.noPolisi || "-"}</p>
          <p><strong>Cabang:</strong> ${item.cabang || "-"}</p>
        `;
        try {
          await sendMail(to, subject, textBody, htmlBody);
          processed++;
        } catch (sendErr) {
          item._attempts = (item._attempts || 0) + 1;
          if (item._attempts >= MAX_RETRY) {
            item._error = String(sendErr);
            failed.push(item);
          } else {
            remaining.push(JSON.stringify(item));
          }
        }
      } catch (err) {
        failed.push({ raw: line, error: String(err) });
      }
    });

    await Promise.all(promises);
    // small delay between batches to avoid flooding
    await new Promise((r) => setTimeout(r, 100));
  }

  // overwrite queue with remaining lines
  fs.writeFileSync(
    QUEUE_PATH,
    remaining.join("\n") + (remaining.length ? "\n" : ""),
    "utf8"
  );
  // append failed items to failedForms.jsonl
  if (failed.length) {
    const lines = failed.map((i) =>
      typeof i === "string" ? i : JSON.stringify(i)
    );
    fs.appendFileSync(FAILED_PATH, lines.join("\n") + "\n", "utf8");
  }
  return { processed };
}

if (require.main === module) {
  processQueue()
    .then((res) => {
      console.log("Processed:", res.processed);
      process.exit(0);
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = { processQueue };
