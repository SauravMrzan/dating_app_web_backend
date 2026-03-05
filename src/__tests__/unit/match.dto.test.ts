import { SwipeDTO } from "../../dtos/match.dto";

describe("SwipeDTO", () => {
  it("accepts like status", () => {
    const parsed = SwipeDTO.safeParse({ toUserId: "u1", status: "like" });
    expect(parsed.success).toBe(true);
  });

  it("accepts dislike status", () => {
    const parsed = SwipeDTO.safeParse({ toUserId: "u2", status: "dislike" });
    expect(parsed.success).toBe(true);
  });

  it("rejects invalid status", () => {
    const parsed = SwipeDTO.safeParse({ toUserId: "u3", status: "superlike" });
    expect(parsed.success).toBe(false);
  });

  it("rejects missing toUserId", () => {
    const parsed = SwipeDTO.safeParse({ status: "like" });
    expect(parsed.success).toBe(false);
  });
});
