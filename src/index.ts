import express, { Application, Request, Response } from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { connectDatabase } from "./database/mongodb";
import { PORT } from "./config";
import authRoutes from "./routes/auth.routes";

const app: Application = express();

// 🔥 ADD THIS
app.use(
  cors({
    origin: "http://localhost:5001", // your frontend
    credentials: true,
  }),
);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/api/auth", authRoutes);

app.get("/", (req: Request, res: Response) => {
  return res.status(200).json({ success: true, message: "Welcome to the API" });
});

async function startServer() {
  await connectDatabase();

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on: http://localhost:${PORT}`);
  });
}

startServer();
