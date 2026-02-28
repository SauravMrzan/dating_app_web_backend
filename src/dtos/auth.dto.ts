import z from "zod";

export const CreateUserDTO = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
  fullName: z.string().min(1, "Full name is required"),
  phone: z
    .string()
    .min(10)
    .regex(/^[0-9+]+$/, "Phone must contain only numbers and +"),
  gender: z.enum(["Male", "Female", "Other"]),
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

  culture: z.enum(["Brahmin", "Chhetri", "Newar", "Rai", "Magar", "Gurung"]),

  // ✅ Added interestedIn
  interestedIn: z.enum(["Male", "Female", "Everyone"]),

  preferredCulture: z.preprocess(
    (val) => {
      if (typeof val === "string") {
        try {
          return JSON.parse(val);
        } catch {
          return [val]; // fallback: single string
        }
      }
      return val;
    },
    z
      .array(z.enum(["Brahmin", "Chhetri", "Newar", "Rai", "Magar", "Gurung"]))
      .default([]),
  ),

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
  bio: z.string().min(10, "Bio must be at least 10 characters"),
  role: z.enum(["user", "admin"]).optional(),
});
export type UpdateUserDTO = z.infer<typeof updateUserDTO>;
