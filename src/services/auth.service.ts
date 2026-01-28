import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { UserRepository } from "../repositories/user.repository";
import { CreateUserDTO, LoginUserDTO } from "../dtos/auth.dto";
import { JWT_SECRET } from "../config";

const userRepository = new UserRepository();

export class AuthService {
  async register(data: CreateUserDTO) {
    console.log("REGISTER PAYLOAD:", data);

    const existingUser = await userRepository.getUserByEmail(data.email);
    if (existingUser) throw new Error("User already exists");

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const { ...userData } = data;

    const userDataToCreate = {
      ...userData,
      password: hashedPassword,
    };

    console.log("CREATING USER:", userDataToCreate);

    return await userRepository.createUser(userDataToCreate);
  }

  async login(data: LoginUserDTO) {
    // 1. Find user
    const user = await userRepository.getUserByEmail(data.email);

    // 2. Validate credentials
    if (!user) {
      throw new Error("Invalid email or password");
    }

    const isMatch = await bcrypt.compare(data.password, user.password);
    if (!isMatch) {
      throw new Error("Invalid email or password");
    }

    // 3. Generate JWT
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
      },
      JWT_SECRET,
      { expiresIn: "1d" },
    );

    // 4. Return safe data
    return {
      token,
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        gender: user.gender,
      },
    };
  }
}
