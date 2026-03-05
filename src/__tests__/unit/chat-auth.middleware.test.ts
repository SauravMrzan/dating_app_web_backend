const findOneMock = jest.fn();

jest.mock("../../models/match.model", () => ({
  MatchModel: {
    findOne: (...args: any[]) => findOneMock(...args),
  },
}));

import { chatAuthMiddleware } from "../../middleware/chat-auth.middleware";

const createRes = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("chatAuthMiddleware", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns 400 when recipient user id is missing", async () => {
    const req: any = { user: { _id: "u1" }, body: {}, params: {} };
    const res = createRes();
    const next = jest.fn();

    await chatAuthMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(next).not.toHaveBeenCalled();
  });

  it("returns 403 when no mutual match exists", async () => {
    findOneMock.mockResolvedValue(null);

    const req: any = { user: { _id: "u1" }, body: { toUserId: "u2" }, params: {} };
    const res = createRes();
    const next = jest.fn();

    await chatAuthMiddleware(req, res, next);

    expect(findOneMock).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it("calls next when a mutual match exists", async () => {
    findOneMock.mockResolvedValue({ _id: "m1" });

    const req: any = { user: { _id: "u1" }, body: { toUserId: "u2" }, params: {} };
    const res = createRes();
    const next = jest.fn();

    await chatAuthMiddleware(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });

  it("uses params.friendId as fallback recipient", async () => {
    findOneMock.mockResolvedValue({ _id: "m2" });

    const req: any = { user: { _id: "u1" }, body: {}, params: { friendId: "u3" } };
    const res = createRes();
    const next = jest.fn();

    await chatAuthMiddleware(req, res, next);

    expect(findOneMock).toHaveBeenCalledWith(
      expect.objectContaining({
        $or: expect.arrayContaining([
          expect.objectContaining({ toUser: "u3" }),
        ]),
      }),
    );
    expect(next).toHaveBeenCalledTimes(1);
  });

  it("returns 500 when database call throws", async () => {
    findOneMock.mockRejectedValue(new Error("db error"));

    const req: any = { user: { _id: "u1" }, body: { toUserId: "u2" }, params: {} };
    const res = createRes();
    const next = jest.fn();

    await chatAuthMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(next).not.toHaveBeenCalled();
  });
});
