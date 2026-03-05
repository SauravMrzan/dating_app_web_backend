// app.ts
import express, { Application, NextFunction, Request, Response } from "express";
import bodyParser from "body-parser";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import rateLimit, { ipKeyGenerator } from "express-rate-limit";
import path from "path";
import { ALLOWED_ORIGINS } from "./config";

// Routes
import authRoutes from "./routes/auth.routes";
import adminRoutes from "./routes/admin.routes";
import matchRoutes from "./routes/match.routes";
import userRoutes from "./routes/user.routes";
import forgotPasswordRoutes from "./routes/forgot-password.routes";
import resetPasswordRoutes from "./routes/reset-password.routes";
import chatRoutes from "./routes/chat.routes";
import notificationRoutes from "./routes/notification.routes";
import reportRoutes from "./routes/report.routes";

// Middleware
import { profileCompletionMiddleware } from "./middleware/profile-completion.middleware";

const app: Application = express();

/* =========================
   SECURITY & CORE MIDDLEWARE
========================= */

app.use(morgan("dev"));

app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Static files
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Trust proxy (IMPORTANT if using Nginx / Render / Railway / etc.)
app.set("trust proxy", 1);

/* =========================
   CORS
========================= */

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || ALLOWED_ORIGINS.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

/* =========================
   BASIC SANITIZATION
========================= */

app.use((req: Request, res: Response, next: NextFunction) => {
  const skipFields = ["email", "password", "profilePicture"];

  const sanitize = (obj: any): any => {
    if (obj && typeof obj === "object" && !Array.isArray(obj)) {
      for (const key in obj) {
        if (skipFields.includes(key) || typeof obj[key] !== "string") continue;

        let value = obj[key];

        value = value.replace(/\$/g, "");

        if (!value.includes("@")) {
          value = value.replace(/</g, "&lt;").replace(/>/g, "&gt;");
        }

        obj[key] = value;
      }
    }
    return obj;
  };

  if (req.body) req.body = sanitize(req.body);

  next();
});

/* =========================
   RATE LIMITER (FIXED)
========================= */

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // keep high for testing
  standardHeaders: true,
  legacyHeaders: false,

  keyGenerator: (req: Request): string => {
  const userId = (req as any).user?._id || (req as any).user?.id;

  if (userId) {
    return `user_${userId}`;
  }

  if (req.headers.authorization) {
    return `auth_${req.headers.authorization}`;
  }

  // ✅ IPv6-safe + TypeScript-safe
  return ipKeyGenerator(req.ip ?? "anonymous");
},
  handler: (req, res, next, options) => {
    res.status(options.statusCode).json({
      success: false,
      message: "Too many requests, please try again later.",
    });
  },
});

/* =========================
   ROUTES
========================= */

app.use("/api/", limiter);

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/match", matchRoutes);
app.use("/api/user", userRoutes);
app.use("/api/forgot-password", forgotPasswordRoutes);
app.use("/api/reset-password", resetPasswordRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/reports", reportRoutes);

// Apply profile completion middleware only to discovery route
app.use("/api/match/discovery", profileCompletionMiddleware, matchRoutes);

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "🚀 MannMilap API is live",
  });
});

/* =========================
   GLOBAL ERROR HANDLER
========================= */

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  const status = err.statusCode || 500;

  console.error(`[Error] ${err.message}`);

  res.status(status).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

export default app;