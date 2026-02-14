import express, { Application, NextFunction, Request, Response } from "express";
import bodyParser from "body-parser";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import path from "path";
import { ALLOWED_ORIGINS } from "./config";

// Routes
import authRoutes from "./routes/auth.routes";
import adminRoutes from "./routes/admin.routes";
import matchRoutes from "./routes/match.routes";
import forgotPasswordRoutes from "./routes/forgot-password.routes";
import resetPasswordRoutes from "./routes/reset-password.routes";

const app: Application = express();

// Middleware & Security
app.use(morgan("dev"));
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  }),
);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Static files
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// CORS
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
  }),
);

// Sanitization middleware
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

// Rate limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    message: "Too many requests, please try again later.",
  },
});

// Routes
app.use("/api/", limiter);
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/match", matchRoutes);
app.use("/api/forgot-password", forgotPasswordRoutes);
app.use("/api/reset-password", resetPasswordRoutes);

app.get("/", (req, res) => {
  res.status(200).json({ success: true, message: "🚀 MannMilap API is live" });
});

// Global error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  const status = err.statusCode || 500;
  console.error(`[Error] ${err.message}`);
  res.status(status).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

export default app; // ✅ Export app for tests
