import { Router } from "express";
import scheduledJobs from "../controllers/scheduled-jobs";
const router = Router();


router.get("/cron-job", scheduledJobs.cronTask); // Use /agents for agents-related routes

export default router;