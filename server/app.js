const express = require("express");
const cors = require("cors");
const app = express();
const reviewRoutes = require("./routes/review");
const serviceRoutes = require("./routes/serviceForm");
const bannerRoutes = require("./routes/banner");
const userRoutes = require("./routes/user");
const partnerRoutes = require("./routes/partner");
const configServices = require("./routes/configServices");

// CORS configuration - hanya izinkan dari domain tertentu
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "https://vinnojaya.web.app",
  "https://vinnojaya.firebaseapp.com",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin) return callback(null, true);

      if (allowedOrigins.indexOf(origin) === -1) {
        const msg =
          "The CORS policy for this site does not allow access from the specified Origin.";
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json({ limit: "10mb" })); // Batasi ukuran payload
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.get("/", (req, res) => res.send("🚗 Biro Jasa API Ready!"));

// Serve static files with CORS headers
app.use(
  "/uploads",
  (req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Cross-Origin-Resource-Policy", "cross-origin");
    next();
  },
  express.static("uploads")
);

app.use("/users", userRoutes); // ✅ register & login admin
app.use("/reviews", reviewRoutes);
app.use("/service", serviceRoutes);
app.use("/banners", bannerRoutes);
app.use("/partners", partnerRoutes);
app.use("/config", configServices);

module.exports = app;
