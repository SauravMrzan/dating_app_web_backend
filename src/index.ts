import express, { Application, Request, Response } from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { connectDatabase } from "./database/mongodb";
import { ALLOWED_ORIGINS } from "./config";
import authRoutes from "./routes/auth.routes";
import { PORT } from "./config";

const app: Application = express();

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

app.use("/api/auth", authRoutes);

app.get("/", (req: Request, res: Response) => {
  return res.status(200).json({ success: true, message: "Welcome to the API" });
});

// Explicitly bind to '0.0.0.0'
app.listen(PORT, "0.0.0.0", () => {
  console.log(
    `Server is running and reachable at http://192.168.1.171:${PORT}`,
  );
});
