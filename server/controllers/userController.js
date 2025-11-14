const { User } = require("../models");
const bcrypt = require("bcryptjs");
const { signToken } = require("../helpers/jwt");

class UserController {
  static async register(req, res) {
    try {
      const { email, password, kodeUnik } = req.body;

      console.log("📝 Register attempt:", {
        email,
        hasPassword: !!password,
        hasKodeUnik: !!kodeUnik,
      });

      // Validasi kode unik dari environment variable
      const ADMIN_CODE = process.env.ADMIN_UNIQUE_CODE || "@Vinno1Jaya2";
      console.log("🔑 Expected admin code:", ADMIN_CODE);
      console.log("🔑 Received admin code:", kodeUnik);

      if (kodeUnik !== ADMIN_CODE) {
        console.log("❌ Invalid admin code");
        return res.status(403).json({ message: "Kode unik tidak valid" });
      }

      // Validasi input
      if (!email || !password) {
        console.log("❌ Missing email or password");
        return res
          .status(400)
          .json({ message: "Email dan password harus diisi" });
      }

      if (password.length < 6) {
        console.log("❌ Password too short");
        return res.status(400).json({ message: "Password minimal 6 karakter" });
      }

      const user = await User.create({ email, password, role: "admin" });
      console.log("✅ User registered successfully:", user.email);
      res.status(201).json({ message: "User registered", email: user.email });
    } catch (err) {
      console.error("❌ Register error:", err);
      if (err.name === "SequelizeUniqueConstraintError") {
        return res.status(400).json({ message: "Email sudah terdaftar" });
      }
      res.status(400).json({ message: "Failed to register user" });
    }
  }

  static async login(req, res) {
    try {
      const { email, password, kodeUnik } = req.body;

      // Validasi kode unik dari environment variable
      const ADMIN_CODE = process.env.ADMIN_UNIQUE_CODE || "@Vinno1Jaya2";
      if (kodeUnik !== ADMIN_CODE) {
        return res.status(403).json({ message: "Kode unik tidak valid" });
      }

      // Validasi input
      if (!email || !password) {
        return res
          .status(400)
          .json({ message: "Email dan password harus diisi" });
      }

      const user = await User.findOne({ where: { email } });

      if (!user || !bcrypt.compareSync(password, user.password)) {
        return res.status(401).json({ message: "Email atau password salah" });
      }

      const access_token = signToken({ id: user.id, email: user.email });
      res.json({ access_token });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Login failed" });
    }
  }

  static async profile(req, res) {
    try {
      const user = await User.findByPk(req.user.id, {
        attributes: ["id", "email", "role"],
      });
      res.json(user);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch profile" });
    }
  }
}

module.exports = UserController;
