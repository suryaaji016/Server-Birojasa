const rateLimit = require("express-rate-limit");

// Rate limiter untuk login (5 percobaan per 15 menit)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 menit
  max: 5, // maksimal 5 percobaan
  message: {
    message: "Terlalu banyak percobaan login. Coba lagi dalam 15 menit.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter untuk register (3 registrasi per jam)
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 jam
  max: 3, // maksimal 3 registrasi
  message: {
    message: "Terlalu banyak registrasi. Coba lagi dalam 1 jam.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter untuk API umum (100 request per 15 menit)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 menit
  max: 100, // maksimal 100 request
  message: {
    message: "Terlalu banyak request. Coba lagi nanti.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  loginLimiter,
  registerLimiter,
  apiLimiter,
};
