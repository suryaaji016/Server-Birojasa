const fs = require("fs");
const path = require("path");

// Use __dirname so path resolves correctly regardless of process.cwd()
const CONFIG_PATH = path.join(__dirname, "..", "config", "services.json");

class ServiceConfigController {
  static getConfig(req, res) {
    try {
      if (!fs.existsSync(CONFIG_PATH)) return res.status(200).json([]);
      const raw = fs.readFileSync(CONFIG_PATH, "utf8");
      try {
        const data = JSON.parse(raw);
        return res.status(200).json(data);
      } catch (parseErr) {
        console.error("services.json parse error:", parseErr);
        // return empty array instead of 500 to allow frontend to fallback
        return res.status(200).json([]);
      }
    } catch (err) {
      console.error("Failed to read services config:", err);
      res.status(500).json({ message: "Gagal membaca konfigurasi layanan" });
    }
  }

  static updateConfig(req, res) {
    try {
      const payload = req.body;
      if (!Array.isArray(payload))
        return res.status(400).json({ message: "Payload harus berupa array" });
      // write file
      fs.writeFileSync(CONFIG_PATH, JSON.stringify(payload, null, 2), "utf8");
      res
        .status(200)
        .json({ message: "Konfigurasi layanan berhasil diperbarui" });
    } catch (err) {
      console.error("Failed to write services config:", err);
      res.status(500).json({ message: "Gagal menyimpan konfigurasi layanan" });
    }
  }
}

module.exports = ServiceConfigController;
