import { AuthService } from "../services/auth.service";
import { CreateUserDTO, LoginUserDTO, updateUserDTO } from "../dtos/auth.dto";
import { Request, Response } from "express";

const authService = new AuthService();

export class AuthController {
  /**
   * Register a new user
   */
  async register(req: Request, res: Response) {
    try {
      const parsedData = CreateUserDTO.safeParse(req.body);

      if (!parsedData.success) {
        const flat = parsedData.error.flatten();
        const errorMessages = [
          ...flat.formErrors,
          ...Object.values(flat.fieldErrors).flat(),
        ];

        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errorMessages,
        });
      }

      const validatedData = parsedData.data;

      // ✅ Ensure interestedIn is present
      if (!validatedData.interestedIn) {
        return res.status(400).json({
          success: false,
          message: "interestedIn is required",
          errors: ["interestedIn must be provided"],
        });
      }

      const user = await authService.register(validatedData);

      return res.status(201).json({
        success: true,
        message: "User registered successfully",
        data: user,
      });
    } catch (error: any) {
      console.error("Registration Error:", error);
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
        errors: [error.message || "Internal Server Error"],
      });
    }
  }

  /**
   * Login user and return token + data
   */
  async login(req: Request, res: Response) {
    try {
      const parsedData = LoginUserDTO.safeParse(req.body);

      if (!parsedData.success) {
        const flat = parsedData.error.flatten();
        const errorMessages = [
          ...flat.formErrors,
          ...Object.values(flat.fieldErrors).flat(),
        ];

        return res.status(400).json({
          success: false,
          message: "Invalid input data",
          errors: errorMessages,
        });
      }

      const loginData: LoginUserDTO = parsedData.data;
      const { token, user } = await authService.login(loginData);

      return res.status(200).json({
        success: true,
        message: "Login successful",
        token,
        data: user,
      });
    } catch (error: any) {
      console.error("LOGIN ERROR:", error);
      return res.status(error.statusCode ?? 401).json({
        success: false,
        message: error.message || "Invalid credentials",
        errors: [error.message || "Invalid credentials"],
      });
    }
  }

  /**
   * Fetch logged-in user profile
   */
  async getUserProfile(req: Request, res: Response) {
    try {
      const userId = (req as any).user?._id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
          errors: ["Unauthorized"],
        });
      }

      const user = await authService.getUserById(userId);
      return res.status(200).json({
        success: true,
        data: user,
        message: "User profile fetched successfully",
      });
    } catch (error: any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Internal Server Error",
        errors: [error.message || "Internal Server Error"],
      });
    }
  }

  /**
   * Update user profile information
   */
  async updateUserProfile(req: Request, res: Response) {
    try {
      const userId = (req as any).user?._id || (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
          errors: ["Unauthorized"],
        });
      }

      const parsedData = updateUserDTO.safeParse(req.body);
      if (!parsedData.success) {
        const flat = parsedData.error.flatten();
        const errorMessages = [
          ...flat.formErrors,
          ...Object.values(flat.fieldErrors).flat(),
        ];

        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errorMessages,
        });
      }

      const updateData = { ...parsedData.data };

      // ✅ Handle multiple photo uploads
      if (req.files && Array.isArray(req.files)) {
        updateData.photos = (req.files as Express.Multer.File[]).map(
          (file) => `uploads/${file.filename}`,
        );
      }

      const updatedUser = await authService.updateUser(userId, updateData);

      return res.status(200).json({
        success: true,
        message: "User profile updated successfully",
        user: updatedUser,
      });
    } catch (error: any) {
      console.error("UPDATE PROFILE ERROR:", error);
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Internal Server Error",
        errors: [error.message || "Internal Server Error"],
      });
    }
  }
}
