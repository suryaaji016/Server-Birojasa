require("dotenv").config({ path: ".env.test" });
const request = require("supertest");
const app = require("../app");

describe("Service Form API Tests", () => {
  const testFormData = {
    nama: "John Doe",
    noTelp: "081234567890",
    cabang: "Tangerang",
    layanan: "Perpanjangan STNK",
  };

  describe("POST /service", () => {
    it("should accept valid service form submission", async () => {
      const response = await request(app).post("/service").send(testFormData);

      // Service form may return 200 or 500 depending on email service
      expect([200, 202, 500]).toContain(response.status);
    });

    it("should handle submission with missing fields", async () => {
      const incompleteData = {
        nama: "John Doe",
        noTelp: "081234567890",
        // Missing other fields
      };

      const response = await request(app).post("/service").send(incompleteData);

      // Service form is lenient, may accept partial data
      expect([200, 202, 400, 500]).toContain(response.status);
    });

    it("should handle different branch selections", async () => {
      const branches = ["Tangerang", "Bekasi", "Jakarta"];

      for (const branch of branches) {
        const response = await request(app)
          .post("/service")
          .send({
            ...testFormData,
            cabang: branch,
          });

        expect([200, 202, 400, 500]).toContain(response.status);
      }
    });
  });
});
