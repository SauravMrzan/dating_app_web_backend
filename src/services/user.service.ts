import { CreateUserDTO, LoginUserDTO } from "../dtos/user.dto";
import { UserRepository } from "../repositories/user.repository";
import bcryptjs from "bcryptjs";
import { HttpError } from "../errors/http-error";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config";

let userRepository = new UserRepository();

export class UserService {
  async createUser(data: CreateUserDTO) {
    // Check email
    const emailCheck = await userRepository.getUserByEmail(data.email);
    if (emailCheck) {
      throw new HttpError(403, "Email already in use");
    }

    // Check username
    const usernameCheck = await userRepository.getUserByUsername(data.username);
    if (usernameCheck) {
      throw new HttpError(403, "Username already in use");
    }

    if (typeof data.preferredCulture === "string") {
      data.preferredCulture = [data.preferredCulture];
    }

    // Hash password
    const hashedPassword = await bcryptjs.hash(data.password, 10);
    data.password = hashedPassword;

    // Remove confirmPassword before saving
    const { confirmPassword, ...userPayload } = data as any;

    // Create user
    const newUser = await userRepository.createUser(userPayload);
    return newUser;
  }

  async loginUser(data: LoginUserDTO) {
    const user = await userRepository.getUserByEmail(data.email);
    if (!user) {
      throw new HttpError(404, "User not found");
    }

    const validPassword = await bcryptjs.compare(data.password, user.password);
    if (!validPassword) {
      throw new HttpError(401, "Invalid credentials");
    }

    const payload = {
      id: user._id,
      email: user.email,
      username: user.username,
      fullName: user.fullName,
      role: user.role,
      gender: user.gender, // optional
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "30d" });

    return { token, user };
  }
}
