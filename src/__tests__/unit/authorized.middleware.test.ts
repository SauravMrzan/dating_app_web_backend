const getUserByIdMock = jest.fn();
const verifyMock = jest.fn();

jest.mock("jsonwebtoken", () => ({
  __esModule: true,
  default: {
    verify: (...args: any[]) => verifyMock(...args),
  },
  verify: (...args: any[]) => verifyMock(...args),
}));

jest.mock("../../repositories/user.repository", () => ({
  UserRepository: jest.fn().mockImplementation(() => ({
    getUserById: (...args: any[]) => getUserByIdMock(...args),
  })),
}));

import { authorizedMiddleware } from "../../middleware/authorized.middleware";

const createRes = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("authorizedMiddleware", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns 401 when authorization header is missing", async () => {
    const req: any = { headers: {} };
    const res = createRes();
    const next = jest.fn();

    await authorizedMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.any(String) }),
    );
    expect(next).not.toHaveBeenCalled();
  });

  it("returns 401 when bearer token is empty", async () => {
    const req: any = { headers: { authorization: "Bearer " } };
    const res = createRes();
    const next = jest.fn();

    await authorizedMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("returns jwt-specific message for JsonWebTokenError", async () => {
    verifyMock.mockImplementation(() => {
      const err: any = new Error("jwt malformed");
      err.name = "JsonWebTokenError";
      throw err;
    });

    const req: any = { headers: { authorization: "Bearer bad" } };
    const res = createRes();
    const next = jest.fn();

    await authorizedMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: "Invalid or Malformed Token" }),
    );
  });

  it("returns 401 when decoded payload has no id", async () => {
    verifyMock.mockReturnValue({});

    const req: any = { headers: { authorization: "Bearer token" } };
    const res = createRes();
    const next = jest.fn();

    await authorizedMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("returns 401 when user does not exist", async () => {
    verifyMock.mockReturnValue({ id: "u1" });
    getUserByIdMock.mockResolvedValue(null);

    const req: any = { headers: { authorization: "Bearer token" } };
    const res = createRes();
    const next = jest.fn();

    await authorizedMiddleware(req, res, next);

    expect(getUserByIdMock).toHaveBeenCalledWith("u1");
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it("attaches user and calls next for valid token", async () => {
    const user = { _id: "u2", role: "user" };
    verifyMock.mockReturnValue({ id: "u2" });
    getUserByIdMock.mockResolvedValue(user);

    const req: any = { headers: { authorization: "Bearer good-token" } };
    const res = createRes();
    const next = jest.fn();

    await authorizedMiddleware(req, res, next);

    expect(req.user).toEqual(user);
    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });

  it("returns custom error message on generic error", async () => {
    verifyMock.mockImplementation(() => {
      throw new Error("boom");
    });

    const req: any = { headers: { authorization: "Bearer x" } };
    const res = createRes();
    const next = jest.fn();

    await authorizedMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: "boom" }),
    );
  });
});
