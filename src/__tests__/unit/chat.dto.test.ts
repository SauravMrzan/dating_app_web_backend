import { ChatDTO } from "../../dtos/chat.dto";

describe("ChatDTO", () => {
  it("accepts valid payload", () => {
    const parsed = ChatDTO.safeParse({
      toUserId: "user-1",
      message: "Hello there",
    });
    expect(parsed.success).toBe(true);
  });

  it("rejects empty toUserId", () => {
    const parsed = ChatDTO.safeParse({
      toUserId: "",
      message: "Hello",
    });
    expect(parsed.success).toBe(false);
  });

  it("rejects empty message", () => {
    const parsed = ChatDTO.safeParse({
      toUserId: "user-2",
      message: "",
    });
    expect(parsed.success).toBe(false);
  });

  it("rejects message longer than 1000 chars", () => {
    const parsed = ChatDTO.safeParse({
      toUserId: "user-3",
      message: "a".repeat(1001),
    });
    expect(parsed.success).toBe(false);
  });

  it("accepts message at 1000 char boundary", () => {
    const parsed = ChatDTO.safeParse({
      toUserId: "user-4",
      message: "a".repeat(1000),
    });
    expect(parsed.success).toBe(true);
  });
});
