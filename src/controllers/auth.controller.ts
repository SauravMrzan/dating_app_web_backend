  import { AuthService } from "../services/auth.service";
  import { CreateUserDTO, LoginUserDTO, updateUserDTO } from "../dtos/auth.dto";
  import { Request, Response } from "express";
  import z from "zod";

  const authService = new AuthService();

  export class AuthController {
    /**
     * Register a new user
     */
    async register(req: Request, res: Response) {
      try {
        const validatedData = CreateUserDTO.parse(req.body);
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
        });
      }
    }

    /**
     * Login user and return token + data
     * This matches the Flutter expectation: response.data['token'] and response.data['data']
     */
    async login(req: Request, res: Response) {
      try {
        // 🔍 DEBUG LOGS (Crucial for verifying connection from Flutter)
        console.log("========== LOGIN HIT ==========");
        console.log("FROM IP:", req.ip);
        console.log("BODY:", req.body);
        console.log("================================");

        const parsedData = LoginUserDTO.safeParse(req.body);

        if (!parsedData.success) {
          return res.status(400).json({
            success: false,
            message: "Invalid input data",
            errors: parsedData.error.flatten(),
          });
        }

        const loginData: LoginUserDTO = parsedData.data;
        const { token, user } = await authService.login(loginData);

        return res.status(200).json({
          success: true,
          message: "Login successful",
          token: token, // Flutter reads this for session persistence
          data: user,   // Flutter maps this to AuthApiModel
        });
      } catch (error: any) {
        console.error("LOGIN ERROR:", error);
        return res.status(error.statusCode ?? 401).json({
          success: false,
          message: error.message || "Invalid credentials",
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
            message: "Unauthorized" 
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
        });
      }
    }

    /**
     * Update user profile information
     */
    /**
   * Update user profile information - Optimized for MannMilap Flutter App
   */
  async updateUserProfile(req: Request, res: Response) {
    try {
      // 1. Get User ID (Check both _id and id depending on your middleware)
      const userId = (req as any).user?._id || (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({ 
          success: false, 
          message: "Unauthorized" 
        });
      }

      // 2. Validate text fields (fullName, dob) using Zod
      // We use safeParse so the app doesn't crash on validation errors
      const parsedData = updateUserDTO.safeParse(req.body);
      
      if (!parsedData.success) {
        return res.status(400).json({ 
          success: false, 
          message: "Validation failed",
          errors: parsedData.error.flatten() 
        });
      }

      // 3. Prepare the update object
      // We spread the validated data from Zod
      const updateData = { ...parsedData.data };

      // 4. Handle the File (The "profilePicture")
      // If Multer successfully uploaded a file, it will be in req.file
      if (req.file) {
        // We save the relative path that the static middleware can serve
        updateData.profilePicture = `uploads/${req.file.filename}`;
      }

      // 5. Call your Service to update MongoDB
      const updatedUser = await authService.updateUser(userId, updateData);

      // 6. Return Response matching your friend's structure
      return res.status(200).json({
        success: true,
        message: "User profile updated successfully",
        user: updatedUser, // Flutter expects 'user' based on your friend's code
      });

    } catch (error: any) {
      console.error("UPDATE PROFILE ERROR:", error);
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }
  }