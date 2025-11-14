require("dotenv").config();
const { sendMail } = require("../services/mailer");

async function main() {
  try {
    const TO = process.env.TEST_EMAIL || process.env.EMAIL_DEFAULT;
    if (!TO) throw new Error("No TEST_EMAIL or EMAIL_DEFAULT set");
    const res = await sendMail(
      TO,
      "Test Email from Biro Jasa",
      "Ini test email dari server"
    );
    console.log("Email sent:", res && res.messageId ? "ok" : res);
    process.exit(0);
  } catch (err) {
    console.error("Error sending test email:", err);
    process.exit(1);
  }
}

main();
