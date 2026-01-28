import z from "zod";
import { UserSchema } from "../types/user.type";

export const CreateUserDTO = UserSchema.pick({
  email: true,
  password: true,
  fullName: true,
  phone: true,

  gender: true,
  dateOfBirth: true,
  culture: true,

  interestedIn: true,
  preferredCulture: true,
  minPreferredAge: true,
  maxPreferredAge: true,
});
// .extend({
//   confirmPassword: z.string().min(6).optional(),
// })
// .refine(
//   (data) => !data.confirmPassword || data.password === data.confirmPassword,
//   {
//     message: "Passwords do not match",
//     path: ["confirmPassword"],
//   }
// );

export type CreateUserDTO = z.infer<typeof CreateUserDTO>;

export const LoginUserDTO = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

export type LoginUserDTO = z.infer<typeof LoginUserDTO>;
