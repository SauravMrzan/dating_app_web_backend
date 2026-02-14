import request from "supertest";
import app from "../app";

describe("Admin Flow", () => {
  it("rejects request without token", async () => {
    const res = await request(app).get("/api/admin/users?page=1&limit=10");
    expect(res.status).toBe(401);
  });

  it("rejects request with invalid token", async () => {
    const res = await request(app)
      .get("/api/admin/users?page=1&limit=10")
      .set("Authorization", "Bearer invalidtoken");
    expect(res.status).toBe(401);
  });
});
