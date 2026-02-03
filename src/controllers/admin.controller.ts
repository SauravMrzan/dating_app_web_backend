import { Request, Response } from "express";
import { UserRepository } from "../repositories/user.repository";
import { AuthService } from "../services/auth.service"; // Import your service
import { CreateUserDTO, updateUserDTO } from "../dtos/auth.dto";
import { UserModel } from "../models/user.model";
import { profile } from "node:console";

const userRepository = new UserRepository();
const authService = new AuthService(); // Initialize service

export class AdminController {
  /**
   * CREATE: Create a new user with Multer support
   * Logic moved to AuthService for consistency
   */
  async createUser(req: Request, res: Response) {
    try {
      const parsed = CreateUserDTO.safeParse(req.body);
      if (!parsed.success) {
        return res
          .status(400)
          .json({ success: false, errors: parsed.error.format() });
      }

      const userData = {
        ...parsed.data,
        profilePicture: req.file ? `uploads/${req.file.filename}` : undefined,
      };

      const newUser = await authService.register(userData as any);
      return res.status(201).json({ success: true, user: newUser });
    } catch (error: any) {
      return res
        .status(error.statusCode || 500)
        .json({ success: false, message: error.message });
    }
  }

  /**
   * UPDATE: Update existing user details
   */
  async updateUser(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const parsed = updateUserDTO.safeParse(req.body);

      if (!parsed.success) {
        return res
          .status(400)
          .json({ success: false, errors: parsed.error.format() });
      }

      const updateData: any = { ...parsed.data };
      if (req.file) {
        updateData.profilePicture = `uploads/${req.file.filename}`;
      }

      const updatedUser = await authService.updateUser(id, updateData);
      return res.status(200).json({ success: true, user: updatedUser });
    } catch (error: any) {
      return res
        .status(error.statusCode || 500)
        .json({ success: false, message: error.message });
    }
  }

  /**
   * READ: Fetch all users
   */
  async getAllUsers(req: Request, res: Response) {
    try {
      const users = await userRepository.getAllUsers();
      return res.status(200).json({ success: true, users });
    } catch (error: any) {
      return res
        .status(500)
        .json({ success: false, message: "Error fetching users" });
    }
  }

  /**
   * READ: Single User
   */
  async getUserById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const user = await authService.getUserById(id);
      return res.status(200).json({ success: true, user });
    } catch (error: any) {
      return res
        .status(error.statusCode || 500)
        .json({ success: false, message: error.message });
    }
  }

  /**
   * DELETE: Remove user
   */
  async deleteUser(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await userRepository.deleteUser(id);
      return res.status(200).json({ success: true, message: "User deleted" });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * STATS: Dashboard Summary
   */
  async getDashboardStats(req: Request, res: Response) {
    try {
      const totalUsers = await UserModel.countDocuments();
      const activeAdmins = await UserModel.countDocuments({ role: "admin" });

      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);

      const newToday = await UserModel.countDocuments({
        createdAt: { $gte: startOfToday },
      });

      const recentActivity = await UserModel.find()
        .sort({ updatedAt: -1 })
        .limit(5)
        .select("fullName updatedAt role");

      res.status(200).json({
        success: true,
        stats: { totalUsers, newToday, activeAdmins },
        recentActivity,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}
