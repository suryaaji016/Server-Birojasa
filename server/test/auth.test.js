require("dotenv").config({ path: ".env.test" });
const request = require("supertest");
const app = require("../app");
const { User } = require("../models");
const { createTestUser, generateTestToken } = require("./helpers/testHelper");

describe("User Authentication Tests", () => {
  describe("POST /users/register", () => {
    it("should register a new admin user with valid unique code", async () => {
      const response = await request(app).post("/users/register").send({
        email: "newadmin@test.com",
        password: "password123",
        kodeUnik: "@Vinno1Jaya2",
      });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("message");
      expect(response.body).toHaveProperty("email", "newadmin@test.com");
    });

    it("should reject registration with invalid unique code", async () => {
      const response = await request(app).post("/users/register").send({
        email: "newadmin@test.com",
        password: "password123",
        kodeUnik: "wrongcode",
      });

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty("message");
    });

    it("should reject registration with duplicate email", async () => {
      await createTestUser({ email: "duplicate@test.com" });

      const response = await request(app).post("/users/register").send({
        email: "duplicate@test.com",
        password: "password123",
        kodeUnik: "@Vinno1Jaya2",
      });

      expect(response.status).toBe(400);
    });

    it("should reject registration with missing fields", async () => {
      const response = await request(app).post("/users/register").send({
        email: "incomplete@test.com",
      });

      expect(response.status).toBe(400);
    });
  });

  describe("POST /users/login", () => {
    beforeEach(async () => {
      // Create test user with known password
      await createTestUser({
        email: "login@test.com",
        password: "password123",
      });
    });

    it("should login with valid credentials", async () => {
      const response = await request(app).post("/users/login").send({
        email: "login@test.com",
        password: "password123",
        kodeUnik: "@Vinno1Jaya2",
      });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("access_token");
    });

    it("should reject login with invalid password", async () => {
      const response = await request(app).post("/users/login").send({
        email: "login@test.com",
        password: "wrongpassword",
        kodeUnik: "@Vinno1Jaya2",
      });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty("message");
    });

    it("should reject login with non-existent email", async () => {
      const response = await request(app).post("/users/login").send({
        email: "nonexistent@test.com",
        password: "password123",
        kodeUnik: "@Vinno1Jaya2",
      });

      expect(response.status).toBe(401);
    });

    it("should reject login with missing credentials", async () => {
      const response = await request(app).post("/users/login").send({
        email: "login@test.com",
      });

      expect(response.status).toBe(400);
    });

    it("should reject login with invalid unique code", async () => {
      const response = await request(app).post("/users/login").send({
        email: "login@test.com",
        password: "password123",
        kodeUnik: "wrongcode",
      });

      expect(response.status).toBe(403);
    });
  });
});
