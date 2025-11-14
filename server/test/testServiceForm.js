require("dotenv").config();
const { sendMail } = require("../services/mailer");

async function testServiceFormEmail() {
  try {
    console.log("[Test] Starting service form email test...");

    // Simulate form data
    const formData = {
      nama: "Test User Email",
      noTelp: "081234567890",
      layanan: "Perpanjangan STNK",
      daerah: "Jakarta",
      cabang: "Jakarta",
      asal: "Jakarta Selatan",
      tujuan: "Polda Metro",
      noPolisi: "B1234XYZ",
    };

    // Get email based on cabang (same logic as controller)
    const EMAIL_DEFAULT = process.env.EMAIL_DEFAULT;
    const EMAIL_JAKARTA = process.env.EMAIL_JAKARTA;
    const toEmail = EMAIL_JAKARTA || EMAIL_DEFAULT;

    console.log("[Test] Sending to:", toEmail);

    // Build email body (same as controller)
    const parts = [];
    parts.push("Permintaan Layanan Baru dari Website Biro Jasa");
    if (formData.nama) parts.push(`Nama: ${formData.nama}`);
    if (formData.noTelp) parts.push(`No. Telp: ${formData.noTelp}`);
    if (formData.layanan) parts.push(`Layanan: ${formData.layanan}`);
    if (formData.daerah) parts.push(`Daerah: ${formData.daerah}`);
    if (formData.asal) parts.push(`Asal: ${formData.asal}`);
    if (formData.tujuan) parts.push(`Tujuan: ${formData.tujuan}`);
    if (formData.noPolisi) parts.push(`No. Polisi: ${formData.noPolisi}`);
    if (formData.cabang) parts.push(`Cabang: ${formData.cabang}`);
    parts.push("---");
    parts.push("Balas pesan ini untuk menindaklanjuti.");
    const body = parts.join("\n");

    console.log("[Test] Email body:\n", body);

    // Send email
    const result = await sendMail(
      toEmail,
      `Permintaan Layanan: ${formData.nama}`,
      body
    );

    console.log("[Test] ✅ Email sent successfully!");
    console.log("[Test] MessageId:", result.messageId);
    console.log("[Test] Please check inbox:", toEmail);
  } catch (error) {
    console.error("[Test] ❌ Error:", error);
    process.exit(1);
  }
}

testServiceFormEmail();
