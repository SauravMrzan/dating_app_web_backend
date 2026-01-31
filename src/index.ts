import express, { Application, NextFunction, Request, Response } from "express";
import bodyParser from "body-parser";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import path from "path";
import { connectDatabase } from "./database/mongodb";
import { ALLOWED_ORIGINS } from "./config";
import authRoutes from "./routes/auth.routes";
import { PORT } from "./config";

const app: Application = express();

// 🔥 REQUIRED for mobile + rate-limit
app.set("trust proxy", 1);

// 1. CONNECT TO DATABASE
connectDatabase();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 4. CORS CONFIGURATION
app.use(
  cors({
    origin: (origin, callback) => {
      // 💡 IMPORTANT: Flutter/Mobile apps often send 'null' or undefined origin.
      // We must allow these to let the request reach the controller.
      if (!origin || ALLOWED_ORIGINS.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  }),
);

app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// 5. ROBUST SANITIZATION MIDDLEWARE
// Prevents NoSQL Injection and XSS without breaking Date/Number objects
app.use((req: Request, res: Response, next: NextFunction) => {
  const skipFields = ["email", "password", "profilePicture"];

  const sanitize = (obj: any): any => {
    if (obj && typeof obj === "object" && !Array.isArray(obj)) {
      for (const key in obj) {
        // Skip specific fields OR values that aren't strings (like Dates/Numbers)
        if (skipFields.includes(key) || typeof obj[key] !== "string") {
          continue;
        }

        let value = obj[key];
        // 1. Anti-NoSQL Injection (removes $)
        value = value.replace(/\$/g, "");

        // 2. Anti-XSS (removes < > tags) - Skip for emails
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

// 6. GLOBAL RATE LIMITER
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per window
  message: {
    success: false,
    message: "Too many requests, please try again later.",
  },
});

// 7. ROUTES
app.use("/api/auth", authRoutes);
app.use("/api/", limiter);
// Health Check Route
app.get("/", (req, res) => {
  res.status(200).json({ success: true, message: "🚀 MannMilap API is live" });
});

// Static files (for profile pictures)
app.use("/public", express.static(path.join(__dirname, "../uploads")));

// 8. GLOBAL ERROR HANDLER
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  const status = err.statusCode || 500;
  console.error(`[Error] ${err.message}`);

  res.status(status).json({
    success: false,
    message: err.message || "Internal Server Error",
    // Only show stack trace in development mode
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
});

// 9. SERVER INITIALIZATION

app.listen(PORT, "0.0.0.0", () => {
  console.log(
    `Server is running and reachable at http://192.168.0.102:${PORT}`,
  );
});
