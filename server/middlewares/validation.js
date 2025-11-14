// Middleware untuk validasi input
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password) => {
  return password && password.length >= 6;
};

const validateServiceForm = (req, res, next) => {
  const { nama, noHP, layanan, cabang } = req.body;

  if (!nama || nama.trim().length === 0) {
    return res.status(400).json({ message: "Nama harus diisi" });
  }

  if (!noHP || noHP.trim().length === 0) {
    return res.status(400).json({ message: "Nomor HP harus diisi" });
  }

  // Validasi format nomor HP (hanya angka, 10-13 digit)
  const phoneRegex = /^[0-9]{10,13}$/;
  if (!phoneRegex.test(noHP.replace(/\s/g, ""))) {
    return res.status(400).json({ message: "Format nomor HP tidak valid" });
  }

  if (!layanan) {
    return res.status(400).json({ message: "Layanan harus dipilih" });
  }

  if (!cabang) {
    return res.status(400).json({ message: "Cabang harus dipilih" });
  }

  next();
};

const sanitizeInput = (input) => {
  if (typeof input !== "string") return input;
  // Hapus karakter berbahaya
  return input
    .replace(/[<>]/g, "") // Hapus < dan >
    .trim();
};

module.exports = {
  validateEmail,
  validatePassword,
  validateServiceForm,
  sanitizeInput,
};
