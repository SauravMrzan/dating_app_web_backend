import request from "supertest";
import app from "../app";

let adminToken: string;

const buildAdminCreateUserPayload = (overrides: Record<string, any> = {}) => {
  const timestamp = Date.now();
  return {
    fullName: "Test User",
    email: `admin-create-${timestamp}@example.com`,
    password: "Password123!",
    phone: "9812345678",
    gender: "Male",
    dateOfBirth: "2000-01-01",
    culture: "Newar",
    interestedIn: "Female",
    role: "user",
    ...overrides,
  };
};

describe("Admin - Create User Flow", () => {
  beforeAll(async () => {
    // Register an admin account with admin role
    const adminPayload = {
      fullName: "Admin User",
      email: `admin-${Date.now()}@example.com`,
      password: "AdminPass123!",
      phone: "9999999999",
      gender: "Male",
      dateOfBirth: "1990-01-01",
      culture: "Newar",
      interestedIn: "Female",
      role: "admin",
    };

    // Register admin with role specified
    const registerRes = await request(app)
      .post("/api/auth/register")
      .send(adminPayload);

    if (registerRes.status !== 201) {
      throw new Error(
        `Failed to register admin: ${JSON.stringify(registerRes.body)}`,
      );
    }

    // Login admin
    const loginRes = await request(app).post("/api/auth/login").send({
      email: adminPayload.email,
      password: adminPayload.password,
    });

    if (loginRes.status !== 200) {
      throw new Error(
        `Failed to login admin: ${JSON.stringify(loginRes.body)}`,
      );
    }

    adminToken = loginRes.body.token;
  });

  it("creates and retrieves users without 304 caching issues", async () => {
    // Create first user
    const payload1 = buildAdminCreateUserPayload();
    const createRes1 = await request(app)
      .post("/api/admin/users")
      .set("Authorization", `Bearer ${adminToken}`)
      .send(payload1);

    expect(createRes1.status).toBe(201);
    expect(createRes1.body.success).toBe(true);

    // Get users list - should return 200, not 304
    const getRes1 = await request(app)
      .get("/api/admin/users?page=1&limit=10")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(getRes1.status).toBe(200); // Not 304!
    expect(getRes1.body.success).toBe(true);
    expect(getRes1.body.users).toBeInstanceOf(Array);
    expect(getRes1.body.users.length).toBeGreaterThan(0);

    // Create another user
    const payload2 = buildAdminCreateUserPayload();
    const createRes2 = await request(app)
      .post("/api/admin/users")
      .set("Authorization", `Bearer ${adminToken}`)
      .send(payload2);

    expect(createRes2.status).toBe(201);

    // Get users list again with different sorting - should return 200, not 304
    const getRes2 = await request(app)
      .get(
        "/api/admin/users?page=1&limit=10&sortField=createdAt&sortOrder=desc",
      )
      .set("Authorization", `Bearer ${adminToken}`);

    expect(getRes2.status).toBe(200); // Not 304!
    expect(getRes2.body.success).toBe(true);
  });
});
