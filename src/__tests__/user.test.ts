import request from "supertest";
import app from "../app";

describe("User Management", () => {
  it("creates a user", async () => {
    const res = await request(app).post("/api/auth/register").send({
      fullName: "Test User",
      email: "test@example.com",
      password: "Password123!",
      phone: "9812345678",
      gender: "Male",
      dateOfBirth: "2000-01-01",
      culture: "Newar",
      interestedIn: "Female",
      role: "user",
    });
    expect(res.status).toBe(201);
  });
});
