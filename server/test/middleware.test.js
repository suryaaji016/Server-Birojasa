require("dotenv").config({ path: ".env.test" });
const jwt = require("jsonwebtoken");
const { authentication } = require("../middlewares/authentication");
const { createTestUser, generateTestToken } = require("./helpers/testHelper");

describe("Middleware Tests", () => {
  describe("Authentication Middleware", () => {
    let mockReq, mockRes, mockNext;

    beforeEach(() => {
      mockReq = {
        headers: {},
      };
      mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      mockNext = jest.fn();
    });

    it("should authenticate valid token", async () => {
      const user = await createTestUser();
      const token = generateTestToken(user.id, user.email);

      mockReq.headers.authorization = `Bearer ${token}`;

      await authentication(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockReq.user).toBeDefined();
      expect(mockReq.user).toHaveProperty("id", user.id);
    });

    it("should reject missing token", async () => {
      await authentication(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalled();
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should reject invalid token", async () => {
      mockReq.headers.authorization = "Bearer invalid_token";

      await authentication(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should reject expired token", async () => {
      const user = await createTestUser();
      const expiredToken = jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET || "test_secret",
        { expiresIn: "0s" } // Expired immediately
      );

      mockReq.headers.authorization = `Bearer ${expiredToken}`;

      // Wait a moment to ensure expiration
      await new Promise((resolve) => setTimeout(resolve, 100));

      await authentication(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should handle malformed authorization header", async () => {
      mockReq.headers.authorization = "InvalidFormat";

      await authentication(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockNext).not.toHaveBeenCalled();
    });
  });
});
