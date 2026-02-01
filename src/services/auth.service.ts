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

    const { preferredCulture, profilePicture, ...userData } = data;

    const userDataToCreate: Partial<IUser> = {
      ...userData,
      password: hashedPassword,
      preferredCulture: Array.isArray(preferredCulture)
        ? preferredCulture
        : preferredCulture
          ? [preferredCulture]
          : [],
      profilePicture:
        profilePicture === null || profilePicture === ""
          ? undefined
          : profilePicture,
    };

    const newUser = await userRepository.createUser(userDataToCreate);
    
    return {
      id: newUser._id,
      fullName: newUser.fullName,
      email: newUser.email,
      gender: newUser.gender,
      culture: newUser.culture,
    };
  }

  async login(data: LoginUserDTO) {
    const user = await userRepository.getUserByEmail(data.email);
    if (!user) {
      throw new HttpError(401, "Invalid email or password");
    }

    const isMatch = await bcrypt.compare(data.password, user.password);
    if (!isMatch) {
      throw new HttpError(401, "Invalid email or password");
    }

    const token = jwt.sign(
      { id: user._id, email: user.email }, 
      JWT_SECRET, 
      { expiresIn: "30d" } // Increased to 30 days so users stay logged in
    );

    return {
      token,
      user: {
        id: user._id, 
        email: user.email,
        fullName: user.fullName,
        gender: user.gender,
        dob: user.dateOfBirth, // Returning 'dob' for Flutter
        profilePicture: user.profilePicture,
      },
    };
  }

  async getUserById(userId: string) {
    if (!userId) throw new HttpError(400, "User ID is required");
    const user = await userRepository.getUserById(userId);
    if (!user) throw new HttpError(404, "User not found");

    return {
      id: user._id,
      email: user.email,
      role: user.role,
      fullName: user.fullName,
      dateOfBirth: user.dateOfBirth,
      profilePicture: user.profilePicture,
      gender: user.gender,
      culture: user.culture,
    };
  }

  async updateUser(userId: string, data: any) {
    const user = await userRepository.getUserById(userId);
    if (!user) throw new HttpError(404, "User not found");

    // 1. Handle Email uniqueness
    if (data.email && user.email !== data.email) {
      const emailExists = await userRepository.getUserByEmail(data.email);
      if (emailExists) throw new HttpError(409, "Email already exists");
    }

    // 2. Handle Password Hashing
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }

    // 3. Map Flutter's 'dob' to MongoDB's 'dateOfBirth'
    if (data.dob) {
      data.dateOfBirth = data.dob;
    }

    // 4. Update in Repository
    const updatedUser = await userRepository.updateUser(userId, data);
    if (!updatedUser) throw new HttpError(500, "Failed to update user");

    // 5. Return formatted object for the Controller
    return {
      id: updatedUser._id,
      fullName: updatedUser.fullName,
      email: updatedUser.email,
      gender: updatedUser.gender,
      dob: updatedUser.dateOfBirth, // Ensure Flutter gets 'dob'
      profilePicture: updatedUser.profilePicture,
    };
  }
}