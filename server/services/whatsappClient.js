const {
  default: makeWASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  delay,
} = require("@whiskeysockets/baileys");
const pino = require("pino");
const path = require("path");
const fs = require("fs");
const qrcode = require("qrcode-terminal");

const logger = pino({ level: process.env.DEBUG ? "debug" : "info" });
const { EventEmitter } = require("events");
const events = new EventEmitter();

const sessionDir = path.join(__dirname, "..", "session");
if (!fs.existsSync(sessionDir)) fs.mkdirSync(sessionDir, { recursive: true });

// state and saveCreds will be initialized inside initSocket (awaited)
let saveCreds = null;
let state = null;

let sock = null;
let isReady = false;

async function initSocket() {
  if (sock) return sock;
  const { version } = await fetchLatestBaileysVersion();

  // initialize auth state
  const auth = await useMultiFileAuthState(sessionDir);
  state = auth.state;
  saveCreds = auth.saveCreds;

  sock = makeWASocket({ logger, auth: state, version });

  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect, qr } = update;
    if (qr) {
      // print QR for scanning on first run
      qrcode.generate(qr, { small: true });
      logger.info("QR code generated in terminal");
    }
    if (connection === "close") {
      logger.info(
        "connection closed, reconnecting...",
        lastDisconnect?.error?.output || lastDisconnect
      );
      sock = null;
      isReady = false;
      try {
        events.emit("disconnected");
      } catch (e) {}
      // reconnect after short delay
      setTimeout(() => initSocket().catch((e) => logger.error(e)), 2000);
    } else if (connection === "open") {
      logger.info("WhatsApp connection open");
      isReady = true;
      try {
        events.emit("ready");
      } catch (e) {}
    }
  });

  sock.ev.on("creds.update", () => saveCreds());

  return sock;
}

// wait until the socket reports ready (user object present and open connection)
async function waitUntilReady(timeout = 15000) {
  const start = Date.now();
  while (!(isReady && sock && sock.user) && Date.now() - start < timeout) {
    // small sleep
    await delay(200);
  }
  if (!(isReady && sock && sock.user))
    throw new Error("WhatsApp client not ready");
}

function normalizeNumber(toNumber) {
  if (!toNumber) return "";
  // strip non digits and plus
  let s = String(toNumber).replace(/[^0-9+]/g, "");
  if (s.startsWith("+")) s = s.slice(1);
  // Indonesian local numbers often start with 0 -> replace with 62
  if (s.startsWith("0")) s = "62" + s.slice(1);
  // if starts with '8' (missing leading zero), assume local mobile and prefix 62
  if (s.startsWith("8")) s = "62" + s;
  return s;
}

async function sendWhatsApp(toNumber, text) {
  try {
    // ensure numbers are in E.164 without whitespace and with country code
    const to = normalizeNumber(toNumber || "");
    if (!to) throw new Error("Invalid destination number");

    const client = await initSocket();
    // wait for client to be ready (has user id / open connection)
    await waitUntilReady(15000);

    const message = { text };
    const jid = to.includes("@s.whatsapp.net") ? to : `${to}@s.whatsapp.net`;
    const res = await client.sendMessage(jid, message);
    return res;
  } catch (err) {
    throw err;
  }
}

module.exports = { initSocket, sendWhatsApp };

// export events for other modules to listen for ready/disconnected
module.exports.events = events;
