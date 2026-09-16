import express from "express";
import cors from "cors";
import { pool } from "./config/db";
import seminarsRouter from "./routes/seminarsRoute";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use("/seminars", seminarsRouter);

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