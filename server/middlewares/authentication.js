const { verifyToken } = require("../helpers/jwt");
const { User } = require("../models");

async function authentication(req, res, next) {
  try {
    const { authorization } = req.headers;

    if (!authorization) {
      return res.status(401).json({ message: "Token tidak ditemukan" });
    }

    const token = authorization.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Format token tidak valid" });
    }

    const payload = verifyToken(token);
    const user = await User.findByPk(payload.id, {
      attributes: ["id", "email", "role"], // Jangan ambil password
    });

    if (!user) {
      return res.status(401).json({ message: "User tidak ditemukan" });
    }

    req.user = { id: user.id, email: user.email, role: user.role };
    next();
  } catch (err) {
    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Token tidak valid" });
    }
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token sudah kadaluarsa" });
    }
    res.status(401).json({ message: "Authentication gagal" });
  }
}

module.exports = { authentication };
