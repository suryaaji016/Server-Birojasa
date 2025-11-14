require("dotenv").config({ path: ".env.test" });
const bcrypt = require("bcryptjs");
const { signToken, verifyToken } = require("../helpers/jwt");
const { createTestUser } = require("./helpers/testHelper");

describe("Helper Functions Tests", () => {
  describe("JWT Helper", () => {
    it("should generate valid JWT token", () => {
      const payload = { id: 1, email: "test@test.com" };
      const token = signToken(payload);

      expect(token).toBeDefined();
      expect(typeof token).toBe("string");
      expect(token.split(".")).toHaveLength(3); // JWT has 3 parts
    });

    it("should verify valid JWT token", () => {
      const payload = { id: 1, email: "test@test.com" };
      const token = signToken(payload);
      const decoded = verifyToken(token);

      expect(decoded).toBeDefined();
      expect(decoded).toHaveProperty("id", payload.id);
      expect(decoded).toHaveProperty("email", payload.email);
    });

    it("should throw error for invalid token", () => {
      expect(() => {
        verifyToken("invalid.token.here");
      }).toThrow();
    });
  });

  describe("Password Hashing", () => {
    it("should hash password correctly", async () => {
      const password = "testpassword123";
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      expect(hashedPassword).toBeDefined();
      expect(hashedPassword).not.toBe(password);
      expect(hashedPassword.length).toBeGreaterThan(password.length);
    });

    it("should verify correct password", async () => {
      const password = "testpassword123";
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const isMatch = await bcrypt.compare(password, hashedPassword);
      expect(isMatch).toBe(true);
    });

    it("should reject incorrect password", async () => {
      const password = "testpassword123";
      const wrongPassword = "wrongpassword";
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const isMatch = await bcrypt.compare(wrongPassword, hashedPassword);
      expect(isMatch).toBe(false);
    });
  });
});
