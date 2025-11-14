// Test setup and configuration
const { sequelize } = require("../models");

// Setup before all tests
beforeAll(async () => {
  try {
    // Sync database in test mode (using SQLite)
    // Force true will drop and recreate tables
    await sequelize.sync({ force: true });
    console.log("✅ Test database synced");
  } catch (error) {
    console.error("❌ Database sync error:", error);
    throw error;
  }
});

// Cleanup after all tests
afterAll(async () => {
  try {
    await sequelize.close();
    console.log("✅ Database connection closed");
  } catch (error) {
    console.error("❌ Error closing database:", error);
  }
});

// Clear database between tests
afterEach(async () => {
  try {
    // Truncate all tables between tests
    const models = Object.keys(sequelize.models);
    for (const modelName of models) {
      await sequelize.models[modelName].destroy({
        where: {},
        truncate: true,
        force: true,
      });
    }
  } catch (error) {
    // Ignore errors during cleanup
    console.warn("Warning during cleanup:", error.message);
  }
});
