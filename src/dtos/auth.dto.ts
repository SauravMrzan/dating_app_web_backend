import z from "zod";

export const CreateUserDTO = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
  fullName: z.string().min(1, "Full name is required"),
  phone: z
    .string()
    .min(10, "Valid phone number required")
    .regex(/^[0-9+]+$/, "Phone must contain only numbers and +"),
  gender: z.enum(["Male", "Female", "Other"]),

  // ✅ Accept string dates and coerce to Date
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

  // ✅ Culture must be one of the defined enums
  culture: z.enum(["Brahmin", "Chhetri", "Newar", "Rai", "Magar", "Gurung"]),

  // ✅ PreferredCulture always an array
  preferredCulture: z
    .array(z.enum(["Brahmin", "Chhetri", "Newar", "Rai", "Magar", "Gurung"]))
    .default([]),

  // ✅ Coerce numbers from strings
  minPreferredAge: z.coerce.number().min(18).default(18),
  maxPreferredAge: z.coerce.number().max(100).default(99),

  // ✅ Optional profile picture
  profilePicture: z.string().optional().nullable(),

  // ✅ Role
  role: z.enum(["user", "admin"]).default("user"),
});

export type CreateUserDTO = z.infer<typeof CreateUserDTO>;

// --- Login DTO ---
export const LoginUserDTO = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});
export type LoginUserDTO = z.infer<typeof LoginUserDTO>;

// --- Update DTO ---
export const updateUserDTO = CreateUserDTO.partial().extend({
  role: z.enum(["user", "admin"]).optional(),
});
export type UpdateUserDTO = z.infer<typeof updateUserDTO>;
