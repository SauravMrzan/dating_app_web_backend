import { AuthService } from "../services/auth.service";
import { CreateUserDTO, LoginUserDTO, updateUserDTO } from "../dtos/auth.dto";
import { Request, Response } from "express";
import {
  CULTURES,
  GENDERS,
  INTERESTED_IN_OPTIONS,
} from "../constants/user-options";

const authService = new AuthService();

const parseMaybeArrayString = (value: string): any[] | null => {
  const trimmed = value.trim();
  if (!trimmed) return [];

  try {
    const parsed = JSON.parse(trimmed);
    return Array.isArray(parsed) ? parsed : [parsed];
  } catch {}

  try {
    const normalizedQuotes = trimmed.replace(/'/g, '"');
    const parsed = JSON.parse(normalizedQuotes);
    return Array.isArray(parsed) ? parsed : [parsed];
  } catch {}

  if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
    const inner = trimmed.slice(1, -1).trim();
    if (!inner) return [];

    return inner
      .split(",")
      .map((item) => item.trim().replace(/^['\"]|['\"]$/g, ""))
      .filter(Boolean);
  }

  return null;
};

const normalizeArrayField = (body: Record<string, any>, fieldName: string) => {
  const rawValue = body[fieldName];

  if (rawValue === undefined || rawValue === null || rawValue === "") {
    delete body[fieldName];
    return;
  }

  if (Array.isArray(rawValue)) {
    body[fieldName] = rawValue
      .map((item) => (typeof item === "string" ? item.trim() : item))
      .filter((item) => item !== "" && item !== undefined && item !== null);
    return;
  }

  if (typeof rawValue === "string") {
    const trimmed = rawValue.trim();

    const maybeArray = parseMaybeArrayString(trimmed);
    if (maybeArray) {
      body[fieldName] = maybeArray
        .map((item) => (typeof item === "string" ? item.trim() : item))
        .filter((item) => item !== "" && item !== undefined && item !== null);
      return;
    }

    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        body[fieldName] = parsed
          .map((item) => (typeof item === "string" ? item.trim() : item))
          .filter((item) => item !== "" && item !== undefined && item !== null);
        return;
      }
    } catch {
      body[fieldName] = trimmed ? [trimmed] : [];
      return;
    }
  }

  body[fieldName] = [rawValue];
};

const normalizeCultureField = (body: Record<string, any>, fieldName: string) => {
  const rawValue = body[fieldName];

  if (rawValue === undefined || rawValue === null || rawValue === "") {
    delete body[fieldName];
    return;
  }

  if (Array.isArray(rawValue)) {
    body[fieldName] = rawValue[0];
    return;
  }

  if (typeof rawValue === "string") {
    const trimmed = rawValue.trim();
    const maybeArray = parseMaybeArrayString(trimmed);
    if (maybeArray && maybeArray.length > 0) {
      body[fieldName] = maybeArray[0];
      return;
    }
    body[fieldName] = trimmed;
  }
};

export class AuthController {
  async getAuthOptions(req: Request, res: Response) {
    return res.status(200).json({
      success: true,
      data: {
        cultures: [...CULTURES],
        genders: [...GENDERS],
        interestedIn: [...INTERESTED_IN_OPTIONS],
      },
    });
  }

  /**
   * Register a new user
   */
  async register(req: Request, res: Response) {
    try {
      const payload = { ...(req.body || {}) };
      normalizeCultureField(payload, "culture");
      normalizeArrayField(payload, "preferredCulture");

      const parsedData = CreateUserDTO.safeParse(payload);

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

      const validatedData = { ...parsedData.data };

      // ✅ Handle multiple photo uploads during registration
      if (req.files && Array.isArray(req.files) && req.files.length > 0) {
        validatedData.photos = (req.files as Express.Multer.File[]).map(
          (file) => `uploads/${file.filename}`,
        );
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

      const sanitizedBody = Object.fromEntries(
        Object.entries(req.body || {}).filter(([, value]) => {
          if (value === undefined || value === null) return false;
          if (typeof value === "string" && value.trim() === "") return false;
          return true;
        }),
      );

      normalizeCultureField(sanitizedBody, "culture");
      normalizeArrayField(sanitizedBody, "preferredCulture");

      const parsedData = updateUserDTO.safeParse(sanitizedBody);
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
      let finalPhotos = parsedData.data.photos || undefined;

      if (req.files && Array.isArray(req.files) && req.files.length > 0) {
        const newPhotos = (req.files as Express.Multer.File[]).map(
          (file) => `uploads/${file.filename}`,
        );
        // Merge with existing photos if provided in body, else merge with current user's photos in service
        finalPhotos = [...(parsedData.data.photos || []), ...newPhotos].slice(
          0,
          3,
        );
      }

      if (finalPhotos !== undefined) {
        updateData.photos = finalPhotos;
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
