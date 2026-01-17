import z from "zod";

export const UserSchema = z.object({
  username: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),

  // Basic Info
  fullName: z.string().min(1),
  phone: z.string().optional(),

  // Identity
  gender: z.enum(["Male", "Female", "Other"]).optional(),
  dateOfBirth: z.coerce.date().optional(),

  culture: z.enum([
    "Brahmin",
    "Chhetri",
    "Newar",
    "Rai",
    "Magar",
    "Gurung",
  ]).optional(),

  // Preferences
  interestedIn: z.enum(["Male", "Female", "Everyone"]).optional(),

  preferredCulture: z.union([
  z.array(z.enum(["Brahmin", "Chhetri", "Newar", "Rai", "Magar", "Gurung"])),
  z.enum(["Brahmin", "Chhetri", "Newar", "Rai", "Magar", "Gurung"]),
]).optional(),


  minPreferredAge: z.number().int().positive().optional(),
  maxPreferredAge: z.number().int().positive().optional(),

  // System
  role: z.enum(["user", "admin"]).default("user"),
});

export type UserType = z.infer<typeof UserSchema>;
