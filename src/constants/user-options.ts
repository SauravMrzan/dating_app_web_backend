export const CULTURES = [
  "Brahmin",
  "Chhetri",
  "Newar",
  "Rai",
  "Magar",
  "Gurung",
] as const;

export const GENDERS = ["Male", "Female", "Other"] as const;

export const INTERESTED_IN_OPTIONS = ["Male", "Female", "Everyone"] as const;

export type Culture = (typeof CULTURES)[number];
export type Gender = (typeof GENDERS)[number];
export type InterestedIn = (typeof INTERESTED_IN_OPTIONS)[number];
