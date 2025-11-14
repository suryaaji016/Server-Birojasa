const jwt = require("jsonwebtoken");
const { User } = require("../../models");

// Create test user
const createTestUser = async (userData = {}) => {
  const defaultUser = {
    email: "test@admin.com",
    password: "password123", // Will be hashed by User model hook
    role: "admin",
  };

  const user = { ...defaultUser, ...userData };

  // Don't hash here - let the model hook do it
  return await User.create(user);
};

// Generate JWT token for testing
const generateTestToken = (userId, email = "test@admin.com") => {
  return jwt.sign(
    { id: userId, email },
    process.env.JWT_SECRET || "test_secret",
    { expiresIn: "1h" }
  );
};

// Mock file upload
const mockFile = (filename = "test.jpg", mimetype = "image/jpeg") => {
  return {
    fieldname: "image",
    originalname: filename,
    encoding: "7bit",
    mimetype: mimetype,
    destination: "uploads/test",
    filename: `test_${Date.now()}_${filename}`,
    path: `uploads/test/test_${Date.now()}_${filename}`,
    size: 12345,
  };
};

module.exports = {
  createTestUser,
  generateTestToken,
  mockFile,
};
