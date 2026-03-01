import { Request, Response } from "express";
import { UserRepository } from "../repositories/user.repository";
import { AuthService } from "../services/auth.service";
import { CreateUserDTO, updateUserDTO } from "../dtos/auth.dto";
import { UserModel } from "../models/user.model";
import { MatchModel } from "../models/match.model"; // ✅ added import

const userRepository = new UserRepository();
const authService = new AuthService();

export class AdminController {
  async createUser(req: Request, res: Response) {
    try {
      console.log("CreateUser hit:", req.body, req.file);

      const parsed = CreateUserDTO.safeParse(req.body);
      if (!parsed.success) {
        console.error("Zod validation errors:", parsed.error.format());
        return res
          .status(400)
          .json({ success: false, errors: parsed.error.format() });
      }

      if (!parsed.data.interestedIn) {
        return res.status(400).json({
          success: false,
          message: "interestedIn is required",
          errors: ["interestedIn must be provided"],
        });
      }

      const normalizedPreferredCulture = Array.isArray(
        parsed.data.preferredCulture,
      )
        ? parsed.data.preferredCulture
        : parsed.data.preferredCulture
          ? [parsed.data.preferredCulture]
          : [];

      const userData = {
        ...parsed.data,
        preferredCulture: normalizedPreferredCulture,
        profilePicture: req.file ? `uploads/${req.file.filename}` : undefined,
      };

      const newUser = await authService.register(userData as any);
      return res.status(201).json({ success: true, user: newUser });
    } catch (error: any) {
      console.error("CREATE_USER_ERROR:", error);
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async updateUser(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const parsed = updateUserDTO.safeParse(req.body);

      if (!parsed.success) {
        console.error("Zod validation errors:", parsed.error.format());
        return res
          .status(400)
          .json({ success: false, errors: parsed.error.format() });
      }

      if (!parsed.data.interestedIn) {
        return res.status(400).json({
          success: false,
          message: "interestedIn is required",
          errors: ["interestedIn must be provided"],
        });
      }

      const normalizedPreferredCulture = Array.isArray(
        parsed.data.preferredCulture,
      )
        ? parsed.data.preferredCulture
        : parsed.data.preferredCulture
          ? [parsed.data.preferredCulture]
          : [];

      const updateData: any = {
        ...parsed.data,
        preferredCulture: normalizedPreferredCulture,
      };

      if (req.file) {
        updateData.profilePicture = `uploads/${req.file.filename}`;
      }

      const updatedUser = await authService.updateUser(id, updateData);
      return res.status(200).json({ success: true, user: updatedUser });
    } catch (error: any) {
      console.error("UPDATE_USER_ERROR:", error);
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async getAllUsers(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const sortField = (req.query.sortField as string) || "createdAt";
      const sortOrder =
        (req.query.sortOrder as string) === "asc" ? "asc" : "desc";

      const filters: Record<string, any> = {};
      if (req.query.role) filters.role = req.query.role;
      if (req.query.culture) filters.culture = req.query.culture;
      if (req.query.gender) filters.gender = req.query.gender;
      if (req.query.interestedIn) filters.interestedIn = req.query.interestedIn;

      const { users, total } = await userRepository.getPaginatedUsers(
        page,
        limit,
        sortField,
        sortOrder,
        filters,
      );

      return res.status(200).json({
        success: true,
        users,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error: any) {
      console.error("GET_ALL_USERS_ERROR:", error);
      return res
        .status(500)
        .json({ success: false, message: "Error fetching users" });
    }
  }

  async getUserById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const user = await authService.getUserById(id);
      return res.status(200).json({ success: true, user });
    } catch (error: any) {
      console.error("GET_USER_BY_ID_ERROR:", error);
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async deleteUser(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await userRepository.deleteUser(id);
      return res.status(200).json({ success: true, message: "User deleted" });
    } catch (error: any) {
      console.error("DELETE_USER_ERROR:", error);
      return res.status(500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async getDashboardStats(req: Request, res: Response) {
    try {
      const totalUsers = await UserModel.countDocuments();
      const activeAdmins = await UserModel.countDocuments({ role: "admin" });

      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);

      const newToday = await UserModel.countDocuments({
        createdAt: { $gte: startOfToday },
      });

      // ✅ Added stats for charts
      const totalMatches = await MatchModel.countDocuments({ isMutual: true });

      const cultureStats = await UserModel.aggregate([
        { $group: { _id: "$culture", count: { $sum: 1 } } },
      ]);

      const genderStats = await UserModel.aggregate([
        { $group: { _id: "$gender", count: { $sum: 1 } } },
      ]);

      const recentActivity = await UserModel.find()
        .sort({ updatedAt: -1 })
        .limit(5)
        .select("fullName updatedAt role interestedIn");

      res.status(200).json({
        success: true,
        stats: {
          totalUsers,
          newToday,
          activeAdmins,
          totalMatches,
          cultureStats,
          genderStats,
        },
        recentActivity,
      });
    } catch (error: any) {
      console.error("DASHBOARD_STATS_ERROR:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }
}
