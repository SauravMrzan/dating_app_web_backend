import app from "./app";
import { PORT } from "./config";
import { connectDatabase } from "./database/mongodb";

connectDatabase();

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running at http://192.168.0.102:${PORT}`);
  console.log(`Network: ${PORT} (Use this for Mobile/Flutter)`);
});
