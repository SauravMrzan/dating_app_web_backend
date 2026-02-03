import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { UserRepository } from "../repositories/user.repository";
import { CreateUserDTO, LoginUserDTO, UpdateUserDTO } from "../dtos/auth.dto";
import { JWT_SECRET } from "../config";
import { HttpError } from "../errors/http-error";
import { IUser } from "../models/user.model";

const userRepository = new UserRepository();

export class AuthService {
  /**
   * Register a new user (Standard Signup & Admin Creation)
   */
  async register(data: CreateUserDTO) {
    // 1. Check for existing user
    const existingUser = await userRepository.getUserByEmail(data.email);
    if (existingUser) throw new HttpError(409, "User already exists");

    // 2. Hash the password
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // 3. Destructure and Normalize fields
    // We explicitly handle arrays and the profile picture to ensure DB compatibility
    const { culture, preferredCulture, profilePicture, role, ...userData } =
      data;

    const userDataToCreate = {
      ...userData,
      password: hashedPassword,
      role: (role || "user") as IUser["role"],

      // Normalize Culture (Frontend might send string or array)
      culture: (Array.isArray(culture)
        ? culture[0]
        : culture) as IUser["culture"],

      // Normalize Preferred Culture (Always ensure it's an array)
      preferredCulture: (Array.isArray(preferredCulture)
        ? preferredCulture
        : preferredCulture
          ? [preferredCulture]
          : []) as IUser["preferredCulture"],

      profilePicture: profilePicture || undefined,
    };

    // 4. Create the user in MongoDB via Repository
    const newUser = await userRepository.createUser(userDataToCreate as any);

    return {
      id: newUser._id,
      fullName: newUser.fullName,
      email: newUser.email,
      role: newUser.role,
      gender: newUser.gender,
    };
  }

  /**
   * Update existing user (Admin or User Profile)
   */
  async updateUser(userId: string, data: UpdateUserDTO) {
    // 1. Check if the user exists
    const user = await userRepository.getUserById(userId);
    if (!user) {
      throw new HttpError(404, "User not found");
    }

    // 2. If email is being changed, check if the new email is already taken
    if (data.email && user.email !== data.email) {
      const emailExists = await userRepository.getUserByEmail(data.email);
      if (emailExists) {
        throw new HttpError(409, "Email already exists");
      }
    }

    // 3. Hash the password only if a new one is provided
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }

    // 4. Create the final payload for the repository
    // We destructure out 'dob' to map it to 'dateOfBirth' for MongoDB
    const { ...updateData } = data;

    // 5. Apply the update via the Repository
    const updatedUser = await userRepository.updateUser(userId, {
      ...updateData,
      profilePicture: updateData.profilePicture || undefined,
    });

    if (!updatedUser) {
      throw new HttpError(500, "Failed to update user identity");
    }

    // 6. Return the updated user object (excluding sensitive data if needed)
    return {
      id: updatedUser._id,
      fullName: updatedUser.fullName,
      email: updatedUser.email,
      role: updatedUser.role,
      dateOfBirth: updatedUser.dateOfBirth,
      profilePicture: updatedUser.profilePicture,
    };
  }

  /**
   * Login user
   */
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
        profilePicture: user.profilePicture,
      },
    };
  }

  /**
   * Fetch user by ID
   */
  async getUserById(userId: string) {
    const user = await userRepository.getUserById(userId);
    if (!user) throw new HttpError(404, "User not found");
    return user;
  }
}
