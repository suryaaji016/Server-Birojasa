module.exports = {
  testEnvironment: "node",
  coveragePathIgnorePatterns: [
    "/node_modules/",
    "/migrations/",
    "/scripts/",
    "/uploads/",
    "/test/helpers/",
  ],
  testMatch: ["**/test/**/*.test.js"],
  collectCoverageFrom: [
    "controllers/**/*.js",
    "middlewares/**/*.js",
    "helpers/**/*.js",
    "services/**/*.js",
    "!services/whatsappClient.js", // Exclude WhatsApp client from coverage
    "!services/mailer.js", // Exclude mailer from coverage (requires external service)
  ],
  setupFilesAfterEnv: ["<rootDir>/test/setup.js"],
  testTimeout: 10000,
  verbose: true,
  forceExit: true,
  detectOpenHandles: true,
};
