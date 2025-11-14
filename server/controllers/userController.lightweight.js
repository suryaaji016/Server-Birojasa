/**
 * LIGHTWEIGHT USER CONTROLLER - Without Sequelize (uses raw pg client)
 * Upload this as userController.js if Sequelize causes out of memory
 */

const { Pool } = require("pg");
const bcrypt = require("bcryptjs");
const { signToken } = require("../helpers/jwt");

// Create PostgreSQL connection pool
const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    "postgresql://postgres:X0Rmraq4AMndQJYb@db.xpnfbhrmgtxmcamrpxnp.supabase.co:5432/postgres",
  ssl: {
    rejectUnauthorized: false,
  },
  max: 2,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

class UserController {
  static async register(req, res) {
    const client = await pool.connect();

    try {
      const { email, password, kodeUnik } = req.body;

      console.log("📝 Register attempt:", {
        email,
        hasPassword: !!password,
        hasKodeUnik: !!kodeUnik,
      });

      // Validasi kode unik
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

      // Check if email already exists
      const checkQuery = 'SELECT id FROM "Users" WHERE email = $1';
      const checkResult = await client.query(checkQuery, [email]);

      if (checkResult.rows.length > 0) {
        console.log("❌ Email already exists");
        return res.status(400).json({ message: "Email sudah terdaftar" });
      }

      // Hash password
      const hashedPassword = bcrypt.hashSync(password, 10);

      // Insert new user
      const insertQuery = `
        INSERT INTO "Users" (email, password, role, "createdAt", "updatedAt")
        VALUES ($1, $2, $3, NOW(), NOW())
        RETURNING id, email, role
      `;
      const insertResult = await client.query(insertQuery, [
        email,
        hashedPassword,
        "admin",
      ]);

      const user = insertResult.rows[0];
      console.log("✅ User registered successfully:", user.email);

      res.status(201).json({
        message: "User registered",
        email: user.email,
      });
    } catch (err) {
      console.error("❌ Register error:", err.message);
      console.error("Stack:", err.stack);
      res
        .status(400)
        .json({ message: "Failed to register user", error: err.message });
    } finally {
      client.release();
    }
  }

  static async login(req, res) {
    const client = await pool.connect();

    try {
      const { email, password, kodeUnik } = req.body;

      // Validasi kode unik
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

      // Find user
      const query = 'SELECT * FROM "Users" WHERE email = $1';
      const result = await client.query(query, [email]);

      if (result.rows.length === 0) {
        return res.status(401).json({ message: "Email atau password salah" });
      }

      const user = result.rows[0];

      // Check password
      if (!bcrypt.compareSync(password, user.password)) {
        return res.status(401).json({ message: "Email atau password salah" });
      }

      // Generate token
      const access_token = signToken({ id: user.id, email: user.email });
      res.json({ access_token });
    } catch (err) {
      console.error("❌ Login error:", err);
      res.status(500).json({ message: "Login failed" });
    } finally {
      client.release();
    }
  }

  static async profile(req, res) {
    const client = await pool.connect();

    try {
      const query =
        'SELECT id, email, role, "createdAt" FROM "Users" WHERE id = $1';
      const result = await client.query(query, [req.user.id]);

      if (result.rows.length === 0) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json(result.rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to get profile" });
    } finally {
      client.release();
    }
  }
}

module.exports = UserController;
