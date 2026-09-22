import express from "express";
import cors from "cors";
import { pool } from "./config/db";
import seminarsRouter from "./routes/seminarsRoute";
import authRoute from "./routes/authRoute";
import usersRoute from "./routes/usersRoute";
import tasksRouter from "./routes/tasksRoute";
import habitsRouter from "./routes/habitsRoute";
import userHabitsRouter from "./routes/userHabitsRoute";
import habitCompletionsRouter from "./routes/habitCompletionsRoute";
import tiersRoute from "./routes/tiersRoute";
import paymentsRoute from "./routes/paymentsRoute";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/seminars", seminarsRouter);
app.use("/api/auth", authRoute);
app.use("/api/users", usersRoute);
app.use("/api/tiers", tiersRoute);
app.use("/api/tasks", tasksRouter);
app.use("/api/payments", paymentsRoute);
app.use("/api/habits", habitsRouter);
app.use("/api/user-habits", userHabitsRouter);
app.use("/api/habit-completions", habitCompletionsRouter);

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

if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 3000;

  app.listen(PORT, () => {
    console.log("Server running locally on port " + PORT);
  });
}

export default app;