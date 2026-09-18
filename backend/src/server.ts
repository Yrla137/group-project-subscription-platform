import express from "express";
import cors from "cors";
import { pool } from "./config/db";
import seminarsRouter from "./routes/seminarsRoute";
import authRoute from "./routes/authRoute";
import usersRoute from "./routes/usersRoute";
import tasksRouter from "./routes/tasksRoute";
import tiersRoute from "./routes/tiersRoute";
import paymentsRoute from "./routes/paymentsRoute";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use("/api/seminars", seminarsRouter);
app.use("/api/auth", authRoute);
app.use("/api/users", usersRoute);
app.use("/api/tiers", tiersRoute);
app.use("/api/tasks", tasksRouter);
app.use("/api/payments", paymentsRoute);

const testDatabaseConnection = async () => {
  try {
    const result = await pool.query("SELECT NOW()");

    console.log("Database connected!");
    console.log(result.rows);
  } catch (error) {
    console.error("Database connection failed:", error);
  }
};

testDatabaseConnection();

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});