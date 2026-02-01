import { Request, Response } from "express";
import { UserRepository } from "../repositories/user.repository";
import { CreateUserDTO, updateUserDTO } from "../dtos/auth.dto"; 
import { UserModel } from "../models/user.model";
import bcrypt from "bcryptjs";

const userRepository = new UserRepository();

export class AdminController {
  /**
   * READ: Fetch all users for the admin dashboard table
   */
  async getAllUsers(req: Request, res: Response) {
    try {
      const users = await userRepository.getAllUsers();
      return res.status(200).json({ success: true, users });
    } catch (error) {
      return res.status(500).json({ success: false, message: "Error fetching users" });
    }
  }

  /**
   * CREATE: Create a new user with Multer support
   * Matches Requirement: POST /api/admin/users
   */
  async createUser(req: Request, res: Response) {
    try {
      // Validate text fields against the Zod schema
      const parsed = CreateUserDTO.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ success: false, errors: parsed.error });
      }

      // Hash password manually before saving
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(parsed.data.password, salt);

      const userData = {
        ...parsed.data,
        password: hashedPassword,
        // If Multer uploaded a file, attach the path
        profilePicture: req.file ? `/uploads/${req.file.filename}` : undefined
      };

      const newUser = await userRepository.createUser;
      return res.status(201).json({ success: true, user: newUser });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * UPDATE: Update existing user details
   * Matches Requirement: PUT /api/admin/users/:id
   */
  async updateUser(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const parsed = updateUserDTO.safeParse(req.body);
      
      if (!parsed.success) {
        return res.status(400).json({ success: false, errors: parsed.error });
      }

      const updateData: any = { ...parsed.data };

      // Handle profile picture update via Multer
      if (req.file) {
        updateData.profilePicture = `/uploads/${req.file.filename}`;
      }

      const updatedUser = await userRepository.updateUser(id, updateData);
      return res.status(200).json({ success: true, user: updatedUser });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * DELETE: Remove user from system
   * Matches Requirement: DELETE /api/admin/users/:id
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
  async getUserById(req: Request, res: Response) {
    try {
      const userId = req.params.id;
      if (!userId) {
        return res
          .status(400)
          .json({ success: false, message: "User ID required" });
      }
      const user = await userRepository.getUserById(userId);
      return res.status(200).json({
        success: true,
        user: user, // Changed from 'data' to 'user'
        message: "User profile fetched successfully",
      });
    } catch (error: any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async getDashboardStats(req: Request, res: Response) {
    try {
      // 1. Fetch Totals
      const totalUsers = await UserModel.countDocuments();
      const activeAdmins = await UserModel.countDocuments({ role: "admin" });

      // 2. Calculate New Today (since start of current day)
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);
      const newToday = await UserModel.countDocuments({
        createdAt: { $gte: startOfToday },
      });

      // 3. Get Recent Activity (last 5 updated users)
      const recentActivity = await UserModel.find()
        .sort({ updatedAt: -1 })
        .limit(5)
        .select("fullName updatedAt role");

      res.status(200).json({
        success: true,
        stats: {
          totalUsers,
          newToday,
          activeAdmins,
        },
        recentActivity,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}