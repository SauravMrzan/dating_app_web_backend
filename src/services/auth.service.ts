import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { UserRepository } from "../repositories/user.repository";
import { CreateUserDTO, LoginUserDTO, UpdateUserDTO } from "../dtos/auth.dto";
import { JWT_SECRET } from "../config";
import { HttpError } from "../errors/http-error";
import { IUser } from "../models/user.model";

const userRepository = new UserRepository();

export class AuthService {
  async register(data: CreateUserDTO) {
    const existingUser = await userRepository.getUserByEmail(data.email);
    if (existingUser) throw new HttpError(409, "User already exists");

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const { culture, preferredCulture, photos, role, ...userData } = data;

    const userDataToCreate: Partial<IUser> = {
      ...userData,
      password: hashedPassword,
      role: (role || "user") as IUser["role"],
      culture: (Array.isArray(culture)
        ? culture[0]
        : culture) as IUser["culture"],
      preferredCulture: Array.isArray(preferredCulture)
        ? preferredCulture
        : preferredCulture
          ? [preferredCulture]
          : [],
      photos: photos || [],
      interestedIn: data.interestedIn, // ✅ critical fix
    };

    const newUser = await userRepository.createUser(userDataToCreate as any);

    return {
      id: newUser._id,
      fullName: newUser.fullName,
      email: newUser.email,
      role: newUser.role,
      gender: newUser.gender,
      interestedIn: newUser.interestedIn, // ✅ return it too
    };
  }

  async updateUser(userId: string, data: UpdateUserDTO) {
    const user = await userRepository.getUserById(userId);
    if (!user) throw new HttpError(404, "User not found");

    if (data.email && user.email !== data.email) {
      const emailExists = await userRepository.getUserByEmail(data.email);
      if (emailExists) throw new HttpError(409, "Email already exists");
    }

    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }

    const updateData: Partial<IUser> = {
      ...data,
      photos: data.photos || user.photos,
    };

    const updatedUser = await userRepository.updateUser(userId, updateData);

    if (!updatedUser)
      throw new HttpError(500, "Failed to update user identity");

    return {
      id: updatedUser._id,
      fullName: updatedUser.fullName,
      email: updatedUser.email,
      role: updatedUser.role,
      dateOfBirth: updatedUser.dateOfBirth,
      photos: updatedUser.photos,
      bio: updatedUser.bio,
      interests: updatedUser.interests,
      height: updatedUser.height,
      zodiac: updatedUser.zodiac,
      education: updatedUser.education,
      familyPlan: updatedUser.familyPlan,
      interestedIn: updatedUser.interestedIn, // ✅ include here too
    };
  }

  async login(data: LoginUserDTO) {
    const user = await userRepository.getUserByEmail(data.email);
    if (!user) throw new HttpError(401, "Invalid email or password");

    const isMatch = await bcrypt.compare(data.password, user.password);
    if (!isMatch) throw new HttpError(401, "Invalid email or password");

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "30d" },
    );

    return {
      token,
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        photos: user.photos,
        bio: user.bio,
        interestedIn: user.interestedIn, // ✅ include here
      },
    };
  }

  async getUserById(userId: string) {
    const user = await userRepository.getUserById(userId);
    if (!user) throw new HttpError(404, "User not found");
    return user;
  }
}
