import { Router } from "express";
import requireAuth from "../middlewares/requireAuth";
import { getStatsController } from "../controllers/statsController";

const router = Router();

router.get("/", requireAuth, getStatsController);

export default router;

// Register in your app entry file:
// import statsRoute from "./routes/statsRoute";
// app.use("/api/stats", statsRoute);
