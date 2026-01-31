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
      { expiresIn: "1d" }
    );

    return {
      token,
      user: {
        id: user._id, // Matches Flutter's AuthApiModel 'id'
        email: user.email,
        fullName: user.fullName,
        gender: user.gender,
        culture: user.culture,
        dateOfBirth: user.dateOfBirth,
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

    if (data.preferredCulture !== undefined) {
      if (Array.isArray(data.preferredCulture)) {
        data.preferredCulture = data.preferredCulture.filter(Boolean) as IUser["preferredCulture"];
      } else if (data.preferredCulture) {
        data.preferredCulture = [data.preferredCulture] as IUser["preferredCulture"];
      } else {
        data.preferredCulture = [];
      }
    }

    const updatedUser = await userRepository.updateUser(userId, data as Partial<IUser>);
    if (!updatedUser) throw new HttpError(500, "Failed to update user");

    return {
      id: updatedUser._id,
      fullName: updatedUser.fullName,
      email: updatedUser.email,
      gender: updatedUser.gender,
      culture: updatedUser.culture,
      profilePicture: updatedUser.profilePicture,
    };
  }
}