import request from "supertest";
import app from "../../app";

let emailCounter = 0;

const buildRegistrationPayload = (overrides: Record<string, any> = {}) => {
  emailCounter += 1;
  return {
    fullName: "Integration User",
    email: `integration${emailCounter}@example.com`,
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

describe("App + Auth integration", () => {
  it("GET / returns API live message", async () => {
    const res = await request(app).get("/");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it("GET /api/auth/options returns option lists", async () => {
    const res = await request(app).get("/api/auth/options");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.cultures).toEqual(expect.arrayContaining(["Newar"]));
    expect(res.body.data.genders).toEqual(
      expect.arrayContaining(["Male", "Female"]),
    );
  });

  it("registers a user successfully", async () => {
    const payload = buildRegistrationPayload();
    const res = await request(app).post("/api/auth/register").send(payload);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.email).toBe(payload.email);
  });

  it("rejects duplicate email registration", async () => {
    const payload = buildRegistrationPayload({ email: "duplicate@example.com" });

    await request(app).post("/api/auth/register").send(payload);
    const res = await request(app).post("/api/auth/register").send(payload);

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });

  it("rejects registration with invalid email", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send(buildRegistrationPayload({ email: "bad-email" }));

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("rejects registration when interestedIn is missing", async () => {
    const { interestedIn, ...payload } = buildRegistrationPayload();

    const res = await request(app).post("/api/auth/register").send(payload);

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("rejects registration with invalid culture", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send(buildRegistrationPayload({ culture: "UnknownCulture" }));

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("logs in a registered user", async () => {
    const payload = buildRegistrationPayload({
      email: "login.success@example.com",
      password: "Password123!",
    });

    await request(app).post("/api/auth/register").send(payload);

    const res = await request(app).post("/api/auth/login").send({
      email: payload.email,
      password: payload.password,
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
  });

  it("rejects login with wrong password", async () => {
    const payload = buildRegistrationPayload({ email: "login.wrong@example.com" });
    await request(app).post("/api/auth/register").send(payload);

    const res = await request(app).post("/api/auth/login").send({
      email: payload.email,
      password: "WrongPassword123!",
    });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it("rejects login for unknown user", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "unknown@example.com",
      password: "Password123!",
    });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it("rejects login with missing email", async () => {
    const res = await request(app).post("/api/auth/login").send({
      password: "Password123!",
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("rejects /whoami without token", async () => {
    const res = await request(app).get("/api/auth/whoami");
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it("returns /whoami profile with valid token", async () => {
    const payload = buildRegistrationPayload({
      email: "whoami@example.com",
      fullName: "Who Am I",
    });

    await request(app).post("/api/auth/register").send(payload);
    const loginRes = await request(app).post("/api/auth/login").send({
      email: payload.email,
      password: payload.password,
    });

    const res = await request(app)
      .get("/api/auth/whoami")
      .set("Authorization", `Bearer ${loginRes.body.token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.email).toBe(payload.email);
  });

  it("sanitizes non-email text fields in register payload", async () => {
    const payload = buildRegistrationPayload({
      fullName: "<script>alert(1)</script>",
      email: "sanitize@example.com",
    });

    const res = await request(app).post("/api/auth/register").send(payload);

    expect(res.status).toBe(201);
    expect(res.body.data.fullName).toContain("&lt;script&gt;");
  });
});
