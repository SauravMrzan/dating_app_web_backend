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

// REQUIRED for mobile + rate-limit
app.set("trust proxy", 1);

// 1. CONNECT TO DATABASE
connectDatabase();

// 2. MIDDLEWARE & SECURITY
app.use(morgan("dev")); // Keeps your terminal logs pretty
app.use(helmet({
  crossOriginResourcePolicy: false, // REQUIRED: otherwise Flutter cannot load images
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 3. CORS CONFIGURATION
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

// 4. STATIC FILES (THE FIX)
// We only need this ONE line. It maps /uploads URL to the ../uploads folder.
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// 5. SANITIZATION MIDDLEWARE
app.use((req: Request, res: Response, next: NextFunction) => {
  const skipFields = ["email", "password", "profilePicture"];

  const sanitize = (obj: any): any => {
    if (obj && typeof obj === "object" && !Array.isArray(obj)) {
      for (const key in obj) {
        if (skipFields.includes(key) || typeof obj[key] !== "string") {
          continue;
        }
        let value = obj[key];
        value = value.replace(/\$/g, ""); // Anti-NoSQL
        if (!value.includes("@")) {
          value = value.replace(/</g, "&lt;").replace(/>/g, "&gt;"); // Anti-XSS
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
  windowMs: 15 * 60 * 1000, 
  max: 100, 
  message: {
    success: false,
    message: "Too many requests, please try again later.",
  },
});

// 7. ROUTES
app.use("/api/auth", authRoutes);
app.use("/api/", limiter);

app.get("/", (req, res) => {
  res.status(200).json({ success: true, message: "🚀 MannMilap API is live" });
});

// 8. GLOBAL ERROR HANDLER
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  const status = err.statusCode || 500;
  console.error(`[Error] ${err.message}`);
  res.status(status).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

// 9. SERVER INITIALIZATION
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running at http://192.168.0.102:${PORT}`);
  console.log(`Network: ${PORT} (Use this for Mobile/Flutter)`);
});