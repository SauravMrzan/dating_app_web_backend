const selectMock = jest.fn();
const findByIdMock = jest.fn();

jest.mock("../../models/user.model", () => ({
  UserModel: {
    findById: (...args: any[]) => findByIdMock(...args),
  },
}));

import { profileCompletionMiddleware } from "../../middleware/profile-completion.middleware";

const createRes = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("profileCompletionMiddleware", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    findByIdMock.mockReturnValue({
      select: (...args: any[]) => selectMock(...args),
    });
  });

  it("returns 404 when user is not found", async () => {
    selectMock.mockResolvedValue(null);

    const req: any = { user: { _id: "u1" } };
    const res = createRes();
    const next = jest.fn();

    await profileCompletionMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(next).not.toHaveBeenCalled();
  });

  it("returns 400 when photos are missing", async () => {
    selectMock.mockResolvedValue({ photos: [], bio: "Some valid bio" });

    const req: any = { user: { _id: "u2" } };
    const res = createRes();
    const next = jest.fn();

    await profileCompletionMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(next).not.toHaveBeenCalled();
  });

  it("returns 400 when bio is missing", async () => {
    selectMock.mockResolvedValue({ photos: ["uploads/1.png"], bio: "" });

    const req: any = { user: { _id: "u3" } };
    const res = createRes();
    const next = jest.fn();

    await profileCompletionMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(next).not.toHaveBeenCalled();
  });

  it("calls next when profile is complete", async () => {
    selectMock.mockResolvedValue({
      photos: ["uploads/1.png"],
      bio: "This is a complete profile bio",
    });

    const req: any = { user: { _id: "u4" } };
    const res = createRes();
    const next = jest.fn();

    await profileCompletionMiddleware(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });

  it("returns 500 when model lookup throws", async () => {
    selectMock.mockRejectedValue(new Error("db failed"));

    const req: any = { user: { _id: "u5" } };
    const res = createRes();
    const next = jest.fn();

    await profileCompletionMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(next).not.toHaveBeenCalled();
  });
});
