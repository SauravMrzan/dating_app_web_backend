import { CreateUserDTO, LoginUserDTO, updateUserDTO } from "../../dtos/auth.dto";

const buildValidCreatePayload = (overrides: Record<string, any> = {}) => ({
  email: "test@example.com",
  password: "Password123!",
  fullName: "Test User",
  phone: "9812345678",
  gender: "Male",
  dateOfBirth: "2000-01-01",
  culture: "Newar",
  interestedIn: "Female",
  ...overrides,
});

describe("CreateUserDTO", () => {
  it("parses a valid payload", () => {
    const parsed = CreateUserDTO.safeParse(buildValidCreatePayload());
    expect(parsed.success).toBe(true);
  });

  it("defaults role to user", () => {
    const parsed = CreateUserDTO.parse(buildValidCreatePayload());
    expect(parsed.role).toBe("user");
  });

  it("defaults preferredCulture to empty array", () => {
    const parsed = CreateUserDTO.parse(buildValidCreatePayload());
    expect(parsed.preferredCulture).toEqual([]);
  });

  it("defaults minPreferredAge and maxPreferredAge", () => {
    const parsed = CreateUserDTO.parse(buildValidCreatePayload());
    expect(parsed.minPreferredAge).toBe(18);
    expect(parsed.maxPreferredAge).toBe(99);
  });

  it("normalizes culture when provided as an array", () => {
    const parsed = CreateUserDTO.parse(
      buildValidCreatePayload({ culture: ["Chhetri", "Newar"] }),
    );
    expect(parsed.culture).toBe("Chhetri");
  });

  it("normalizes culture when provided as a JSON array string", () => {
    const parsed = CreateUserDTO.parse(
      buildValidCreatePayload({ culture: '["Rai", "Newar"]' }),
    );
    expect(parsed.culture).toBe("Rai");
  });

  it("fails for invalid email", () => {
    const parsed = CreateUserDTO.safeParse(
      buildValidCreatePayload({ email: "bad-email" }),
    );
    expect(parsed.success).toBe(false);
  });

  it("fails for short password", () => {
    const parsed = CreateUserDTO.safeParse(
      buildValidCreatePayload({ password: "123" }),
    );
    expect(parsed.success).toBe(false);
  });

  it("fails for underage date of birth", () => {
    const parsed = CreateUserDTO.safeParse(
      buildValidCreatePayload({ dateOfBirth: "2012-01-01" }),
    );
    expect(parsed.success).toBe(false);
  });

  it("fails for invalid gender", () => {
    const parsed = CreateUserDTO.safeParse(
      buildValidCreatePayload({ gender: "Unknown" }),
    );
    expect(parsed.success).toBe(false);
  });

  it("fails for invalid culture", () => {
    const parsed = CreateUserDTO.safeParse(
      buildValidCreatePayload({ culture: "UnknownCulture" }),
    );
    expect(parsed.success).toBe(false);
  });

  it("fails when interestedIn is missing", () => {
    const { interestedIn, ...payload } = buildValidCreatePayload();

    const parsed = CreateUserDTO.safeParse(payload);
    expect(parsed.success).toBe(false);
  });

  it("parses interests from comma-separated string", () => {
    const parsed = CreateUserDTO.parse(
      buildValidCreatePayload({ interests: "music, travel, coding" }),
    );
    expect(parsed.interests).toEqual(["music", "travel", "coding"]);
  });

  it("parses interests from JSON array string", () => {
    const parsed = CreateUserDTO.parse(
      buildValidCreatePayload({ interests: '["reading", "sports"]' }),
    );
    expect(parsed.interests).toEqual(["reading", "sports"]);
  });

  it("parses photos from a single string", () => {
    const parsed = CreateUserDTO.parse(
      buildValidCreatePayload({ photos: "uploads/photo.png" }),
    );
    expect(parsed.photos).toEqual(["uploads/photo.png"]);
  });

  it("fails when photos exceed limit", () => {
    const parsed = CreateUserDTO.safeParse(
      buildValidCreatePayload({
        photos: ["1.png", "2.png", "3.png", "4.png"],
      }),
    );
    expect(parsed.success).toBe(false);
  });
});

describe("updateUserDTO", () => {
  it("accepts an empty payload", () => {
    const parsed = updateUserDTO.safeParse({});
    expect(parsed.success).toBe(true);
  });

  it("rejects too short bio", () => {
    const parsed = updateUserDTO.safeParse({ bio: "short" });
    expect(parsed.success).toBe(false);
  });

  it("accepts valid partial preferredCulture update", () => {
    const parsed = updateUserDTO.safeParse({ preferredCulture: ["Newar"] });
    expect(parsed.success).toBe(true);
  });
});

describe("LoginUserDTO", () => {
  it("parses valid login payload", () => {
    const parsed = LoginUserDTO.safeParse({
      email: "login@example.com",
      password: "Password123!",
    });
    expect(parsed.success).toBe(true);
  });

  it("fails for invalid email", () => {
    const parsed = LoginUserDTO.safeParse({
      email: "not-an-email",
      password: "Password123!",
    });
    expect(parsed.success).toBe(false);
  });
});
