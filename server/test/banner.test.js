require("dotenv").config({ path: ".env.test" });
const request = require("supertest");
const app = require("../app");
const { Banner } = require("../models");
const { createTestUser, generateTestToken } = require("./helpers/testHelper");

describe("Banner API Tests", () => {
  let adminToken;
  let adminUser;

  beforeEach(async () => {
    adminUser = await createTestUser();
    adminToken = generateTestToken(adminUser.id, adminUser.email);
  });

  describe("GET /banners", () => {
    it("should return all banners", async () => {
      await Banner.bulkCreate([
        { imageUrl: "/uploads/banners/image1.jpg" },
        { imageUrl: "/uploads/banners/image2.jpg" },
      ]);

      const response = await request(app).get("/banners");

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(2);
    });

    it("should return empty array when no banners exist", async () => {
      const response = await request(app).get("/banners");

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(0);
    });
  });

  describe("DELETE /banners/:id (Admin)", () => {
    it("should delete an existing banner", async () => {
      const banner = await Banner.create({
        imageUrl: "/uploads/banners/delete.jpg",
      });

      const response = await request(app)
        .delete(`/banners/${banner.id}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(200);

      const deletedBanner = await Banner.findByPk(banner.id);
      expect(deletedBanner).toBeNull();
    });

    it("should return 404 when deleting non-existent banner", async () => {
      const response = await request(app)
        .delete("/banners/99999")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
    });

    it("should reject deletion without authentication", async () => {
      const banner = await Banner.create({
        imageUrl: "/uploads/banners/test.jpg",
      });

      const response = await request(app).delete(`/banners/${banner.id}`);

      expect(response.status).toBe(401);
    });
  });
});
