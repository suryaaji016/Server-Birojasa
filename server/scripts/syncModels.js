require("dotenv").config();
const db = require("../models");

async function sync() {
  try {
    console.log("Syncing models to DB (development)...");
    await db.sequelize.sync({ alter: true });
    console.log("✅ Models synced.");
    process.exit(0);
  } catch (err) {
    console.error("Failed to sync models:", err);
    process.exit(1);
  }
}

sync();
