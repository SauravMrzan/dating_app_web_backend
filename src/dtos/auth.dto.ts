import z from "zod";
import {
  CULTURES,
  GENDERS,
  INTERESTED_IN_OPTIONS,
} from "../constants/user-options";

const CULTURE_ENUM = z.enum(CULTURES);
const GENDER_ENUM = z.enum(GENDERS);
const INTERESTED_IN_ENUM = z.enum(INTERESTED_IN_OPTIONS);

const normalizeCultureValue = z.preprocess((val) => {
  if (Array.isArray(val)) {
    return val[0];
  }

  if (typeof val === "string") {
    const trimmed = val.trim();

    if (!trimmed) return trimmed;

    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parsed[0];
      }
      return parsed;
    } catch {
      return trimmed;
    }
  }

  return val;
}, CULTURE_ENUM);

export const CreateUserDTO = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
  fullName: z.string().min(1, "Full name is required"),
  phone: z
    .string()
    .min(10)
    .regex(/^[0-9+]+$/, "Phone must contain only numbers and +"),
  gender: GENDER_ENUM,
  dateOfBirth: z.coerce.date().refine((date) => {
    const today = new Date();
    let age = today.getFullYear() - date.getFullYear();
    const monthDiff = today.getMonth() - date.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < date.getDate())
    ) {
      age--;
    }
    return age >= 18;
  }, "You must be at least 18 years old"),

  culture: normalizeCultureValue,

  // ✅ Added interestedIn
  interestedIn: INTERESTED_IN_ENUM,

  preferredCulture: z.array(CULTURE_ENUM).default([]),

  minPreferredAge: z.coerce.number().min(18).default(18),
  maxPreferredAge: z.coerce.number().max(100).default(99),

  bio: z.string().min(10, "Bio must be at least 10 characters").optional(),

  interests: z.preprocess((val) => {
    if (typeof val === "string") {
      try {
        return JSON.parse(val);
      } catch {
        return val.split(",").map((s) => s.trim());
      }
    }
    return val;
  }, z.array(z.string()).default([])),

  height: z.coerce.number().optional(),
  zodiac: z.string().optional(),
  education: z.string().optional(),
  familyPlan: z.string().optional(),

  photos: z.preprocess((val) => {
    if (typeof val === "string") {
      try {
        return JSON.parse(val);
      } catch {
        return [val];
      }
    }
    return val;
  }, z.array(z.string()).max(3).optional()),

  role: z.enum(["user", "admin"]).default("user"),
});

export type CreateUserDTO = z.infer<typeof CreateUserDTO>;

export const LoginUserDTO = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});
export type LoginUserDTO = z.infer<typeof LoginUserDTO>;

export const updateUserDTO = CreateUserDTO.partial().extend({
  bio: z.string().min(10, "Bio must be at least 10 characters").optional(),
  role: z.enum(["user", "admin"]).optional(),
  // Override fields with defaults to ensure they are NOT reset if missing
  interests: z
    .preprocess((val) => {
      if (typeof val === "string") {
        try {
          return JSON.parse(val);
        } catch {
          return val.split(",").map((s) => s.trim());
        }
      }
      return val;
    }, z.array(z.string()))
    .optional(),
  preferredCulture: z.array(CULTURE_ENUM).optional(),
  minPreferredAge: z.coerce.number().min(18).optional(),
  maxPreferredAge: z.coerce.number().max(100).optional(),
});
export type UpdateUserDTO = z.infer<typeof updateUserDTO>;
