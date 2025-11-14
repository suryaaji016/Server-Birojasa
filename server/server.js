require("dotenv").config();
const app = require("./app");
const PORT = process.env.PORT || 3000;

// Simple server startup without Sequelize
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log("📊 Environment:", process.env.NODE_ENV || "development");
});
