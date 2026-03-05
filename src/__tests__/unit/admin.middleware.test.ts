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

import { isAdmin, protect } from "../../middleware/admin.middleware";

const createRes = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("admin.middleware protect", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns 401 when authorization header is missing", async () => {
    const req: any = { headers: {} };
    const res = createRes();
    const next = jest.fn();

    await protect(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("returns 401 when token is invalid", async () => {
    verifyMock.mockImplementation(() => {
      throw new Error("invalid token");
    });

    const req: any = { headers: { authorization: "Bearer bad-token" } };
    const res = createRes();
    const next = jest.fn();

    await protect(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("returns 401 when decoded token does not contain id", async () => {
    verifyMock.mockReturnValue({});
    const req: any = { headers: { authorization: "Bearer token" } };
    const res = createRes();
    const next = jest.fn();

    await protect(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("returns 401 when user is not found", async () => {
    verifyMock.mockReturnValue({ id: "u1" });
    getUserByIdMock.mockResolvedValue(null);

    const req: any = { headers: { authorization: "Bearer token" } };
    const res = createRes();
    const next = jest.fn();

    await protect(req, res, next);

    expect(getUserByIdMock).toHaveBeenCalledWith("u1");
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("attaches user and calls next for valid token", async () => {
    const user = { _id: "u2", role: "admin" };
    verifyMock.mockReturnValue({ id: "u2" });
    getUserByIdMock.mockResolvedValue(user);

    const req: any = { headers: { authorization: "Bearer token" } };
    const res = createRes();
    const next = jest.fn();

    await protect(req, res, next);

    expect(req.user).toEqual(user);
    expect(next).toHaveBeenCalledTimes(1);
  });
});

describe("admin.middleware isAdmin", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns 401 when req.user is missing", async () => {
    const req: any = {};
    const res = createRes();
    const next = jest.fn();

    await isAdmin(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("returns 403 when user role is not admin", async () => {
    const req: any = { user: { role: "user" } };
    const res = createRes();
    const next = jest.fn();

    await isAdmin(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it("calls next when role is admin", async () => {
    const req: any = { user: { role: "admin" } };
    const res = createRes();
    const next = jest.fn();

    await isAdmin(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });
});
