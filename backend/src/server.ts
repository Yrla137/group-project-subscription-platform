import express from "express";
import cors from "cors";
import { pool } from "./config/db";
import seminarsRouter from "./routes/seminarsRoute";
import authRoute from "./routes/authRoute";
import usersRoute from "./routes/usersRoute";
import tasksRouter from "./routes/tasksRoute";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use("/seminars", seminarsRouter);
app.use("/auth", authRoute);
app.use("/users", usersRoute);
app.use("/tasks", tasksRouter);

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