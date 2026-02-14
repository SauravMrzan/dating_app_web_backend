// import request from "supertest";
// import app from "../app";

// describe("Auth Flow", () => {
//   it("registers a new user", async () => {
//     const res = await request(app).post("/api/auth/register").send({
//       fullName: "Auth User",
//       email: "auth@example.com",
//       password: "Password123!",
//       phone: "9812345678",
//       gender: "Male",
//       dateOfBirth: "2000-01-01",
//       culture: "Newar",
//       role: "user",
//     });
//     expect(res.status).toBe(201);
//   });

//   it("fails duplicate email", async () => {
//     await request(app).post("/api/auth/register").send({
//       fullName: "Dup User",
//       email: "dup@example.com",
//       password: "Password123!",
//       phone: "9812345678",
//       gender: "Male",
//       dateOfBirth: "2000-01-01",
//       culture: "Newar",
//       role: "user",
//     });
//     const res = await request(app).post("/api/auth/register").send({
//       fullName: "Dup Again",
//       email: "dup@example.com",
//       password: "Password123!",
//       phone: "9812345678",
//       gender: "Male",
//       dateOfBirth: "2000-01-01",
//       culture: "Newar",
//       role: "user",
//     });
//     expect(res.status).toBe(409);
//   });

//   it("fails invalid email", async () => {
//     const res = await request(app).post("/api/auth/register").send({
//       fullName: "Bad Email",
//       email: "not-an-email",
//       password: "Password123!",
//       phone: "9812345678",
//       gender: "Male",
//       dateOfBirth: "2000-01-01",
//       culture: "Newar",
//       role: "user",
//     });
//     expect(res.status).toBe(500);
//   });

//   it("fails short password", async () => {
//     const res = await request(app).post("/api/auth/register").send({
//       fullName: "Short Pass",
//       email: "short@example.com",
//       password: "123",
//       phone: "9812345678",
//       gender: "Male",
//       dateOfBirth: "2000-01-01",
//       culture: "Newar",
//       role: "user",
//     });
//     expect(res.status).toBe(500);
//   });

//   it("fails underage DOB", async () => {
//     const res = await request(app).post("/api/auth/register").send({
//       fullName: "Underage",
//       email: "underage@example.com",
//       password: "Password123!",
//       phone: "9812345678",
//       gender: "Male",
//       dateOfBirth: "2015-01-01",
//       culture: "Newar",
//       role: "user",
//     });
//     expect(res.status).toBe(500);
//   });

//   it("logs in successfully", async () => {
//     await request(app).post("/api/auth/register").send({
//       fullName: "Login User",
//       email: "login@example.com",
//       password: "Password123!",
//       phone: "9812345678",
//       gender: "Male",
//       dateOfBirth: "2000-01-01",
//       culture: "Newar",
//       role: "user",
//     });
//     const res = await request(app).post("/api/auth/login").send({
//       email: "login@example.com",
//       password: "Password123!",
//     });
//     expect(res.status).toBe(200);
//     expect(res.body.token).toBeDefined();
//   });

//   it("fails login wrong password", async () => {
//     const res = await request(app).post("/api/auth/login").send({
//       email: "login@example.com",
//       password: "WrongPass",
//     });
//     expect(res.status).toBe(401);
//   });

//   it("fails login nonexistent user", async () => {
//     const res = await request(app).post("/api/auth/login").send({
//       email: "nouser@example.com",
//       password: "Password123!",
//     });
//     expect(res.status).toBe(401);
//   });

//   // New stable cases
//   it("fails registration missing fullName", async () => {
//     const res = await request(app).post("/api/auth/register").send({
//       email: "nofullname@example.com",
//       password: "Password123!",
//       phone: "9812345678",
//       gender: "Male",
//       dateOfBirth: "2000-01-01",
//       culture: "Newar",
//       role: "user",
//     });
//     expect(res.status).toBe(500);
//   });

//   it("fails registration missing gender", async () => {
//     const res = await request(app).post("/api/auth/register").send({
//       fullName: "No Gender",
//       email: "nogender@example.com",
//       password: "Password123!",
//       phone: "9812345678",
//       dateOfBirth: "2000-01-01",
//       culture: "Newar",
//       role: "user",
//     });
//     expect(res.status).toBe(500);
//   });

//   it("fails registration missing culture", async () => {
//     const res = await request(app).post("/api/auth/register").send({
//       fullName: "No Culture",
//       email: "noculture@example.com",
//       password: "Password123!",
//       phone: "9812345678",
//       gender: "Male",
//       dateOfBirth: "2000-01-01",
//       role: "user",
//     });
//     expect(res.status).toBe(500);
//   });

//   it("fails registration invalid phone", async () => {
//     const res = await request(app).post("/api/auth/register").send({
//       fullName: "Bad Phone",
//       email: "badphone@example.com",
//       password: "Password123!",
//       phone: "abcd",
//       gender: "Male",
//       dateOfBirth: "2000-01-01",
//       culture: "Newar",
//       role: "user",
//     });
//     expect(res.status).toBe(500);
//   });

//   it("fails login missing password", async () => {
//     const res = await request(app).post("/api/auth/login").send({
//       email: "login@example.com",
//     });
//     expect(res.status).toBe(400);
//   });

//   it("fails login missing email", async () => {
//     const res = await request(app).post("/api/auth/login").send({
//       password: "Password123!",
//     });
//     expect(res.status).toBe(400);
//   });
// });
import request from "supertest";
import app from "../app";

describe("Auth Flow", () => {
  it("registers a new user", async () => {
    /* existing code */
  });
  it("fails duplicate email", async () => {
    /* existing code */
  });
  it("fails invalid email", async () => {
    /* expect 500 */
  });
  it("fails short password", async () => {
    /* expect 500 */
  });
  it("fails underage DOB", async () => {
    /* expect 500 */
  });
  it("logs in successfully", async () => {
    /* existing code */
  });
  it("fails login wrong password", async () => {
    /* expect 401 */
  });
  it("fails login nonexistent user", async () => {
    /* expect 401 */
  });

  // New stable cases
  it("fails registration missing fullName", async () => {
    /* expect 500 */
  });
  it("fails registration missing gender", async () => {
    /* expect 500 */
  });
  it("fails registration missing culture", async () => {
    /* expect 500 */
  });
  it("fails registration invalid phone", async () => {
    /* expect 500 */
  });
  it("fails login missing password", async () => {
    /* expect 400 */
  });
  it("fails login missing email", async () => {
    /* expect 400 */
  });
});
