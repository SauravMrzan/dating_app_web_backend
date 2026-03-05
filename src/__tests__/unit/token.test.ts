import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../../config";
import { generateResetToken, verifyResetToken } from "../../utils/token";

describe("token utils", () => {
  it("generates a token string", () => {
    const token = generateResetToken("user-1");
    expect(typeof token).toBe("string");
  });

  it("generates a JWT-like string with three segments", () => {
    const token = generateResetToken("user-2");
    expect(token.split(".")).toHaveLength(3);
  });

  it("verifies a generated token and returns id", () => {
    const token = generateResetToken("abc123");
    const decoded = verifyResetToken(token);
    expect(decoded.id).toBe("abc123");
  });

  it("throws for malformed token", () => {
    expect(() => verifyResetToken("not-a-token")).toThrow();
  });

  it("throws for token signed with wrong secret", () => {
    const token = jwt.sign({ id: "user-3" }, "wrong-secret", {
      expiresIn: "15m",
    });
    expect(() => verifyResetToken(token)).toThrow();
  });

  it("produces token payload that includes id", () => {
    const token = generateResetToken("payload-user");
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    expect(decoded.id).toBe("payload-user");
  });
});
