import {
  CULTURES,
  GENDERS,
  INTERESTED_IN_OPTIONS,
} from "../../constants/user-options";

describe("user options constants", () => {
  it("contains expected cultures", () => {
    expect(CULTURES).toEqual(
      expect.arrayContaining(["Brahmin", "Chhetri", "Newar"]),
    );
  });

  it("contains expected genders", () => {
    expect(GENDERS).toEqual(["Male", "Female", "Other"]);
  });

  it("contains expected interestedIn options", () => {
    expect(INTERESTED_IN_OPTIONS).toEqual(["Male", "Female", "Everyone"]);
  });

  it("has unique culture values", () => {
    expect(new Set(CULTURES).size).toBe(CULTURES.length);
  });

  it("has unique gender values", () => {
    expect(new Set(GENDERS).size).toBe(GENDERS.length);
  });

  it("has unique interestedIn values", () => {
    expect(new Set(INTERESTED_IN_OPTIONS).size).toBe(
      INTERESTED_IN_OPTIONS.length,
    );
  });
});
