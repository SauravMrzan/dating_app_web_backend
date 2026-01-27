import { AuthService } from "../services/auth.service";
import { CreateUserDTO, LoginUserDTO } from "../dtos/auth.dto";
import { Request, Response } from "express";
import z from "zod";

const authService = new AuthService();

export class AuthController {
  async register(req: Request, res: Response) {
    try {
      const validatedData = CreateUserDTO.parse(req.body);
      const user = await authService.register(validatedData);
      return res.status(201).json({
        success:true,
        message: "User registered successfully",
        data: user,
      });
    } catch (error: any) {
      console.error("Validation Error:", error.errors);
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  // async login(req: Request, res: Response) {
  //   try {
  //     console.log("LOGIN BODY:", req.body);
  //     const parsedData = LoginUserDTO.safeParse(req.body);

  //     if (!parsedData.success) {
  //       return res.status(400).json({
  //         success: false,
  //         message: z.prettifyError(parsedData.error),
  //       });
  //     }

  //     const loginData: LoginUserDTO = parsedData.data;
  //     const { token, user } = await authService.login(loginData);

  //     return res.status(200).json({
  //       success: true,
  //       message: "Login successful",
  //       data: user,
  //       token,
  //     });
  //   } catch (error: any) {
  //     return res.status(error.statusCode ?? 500).json({
  //       success: false,
  //       message: error.message || "Internal Server Error",
  //     });
  //   }
  // }
  async login(req: Request, res: Response) {
  try {
    // 🔍 DEBUG LOGS (TEMPORARY)
    console.log("========== LOGIN HIT ==========");
    console.log("FROM IP:", req.ip);
    console.log("HEADERS:", req.headers);
    console.log("BODY:", req.body);
    console.log("================================");

    const parsedData = LoginUserDTO.safeParse(req.body);

    if (!parsedData.success) {
      return res.status(400).json({
        success: false,
        message: z.prettifyError(parsedData.error),
      });
    }

    const loginData: LoginUserDTO = parsedData.data;
    const { token, user } = await authService.login(loginData);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: user,
      token,
    });
  } catch (error: any) {
    console.error("LOGIN ERROR:", error);
    return res.status(error.statusCode ?? 500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
}

}
