import { Router } from "express";
import scheduledJobs from "../controllers/scheduled-jobs";
const router = Router();

/**
 * Express Route: /cron-job
 *
 * @description
 * This route triggers a scheduled cron job defined in the 'scheduled-jobs' controller.
 *
 * @method GET
 * @path /cron-job
 *
 * @handler scheduledJobs.cronTask
 * The 'cronTask' method in the 'scheduledJobs' controller handles this route.
 *
 * @returns {Promise<void>} Resolves with a success message in the response if the cron job is executed successfully.
 * @throws {Error} If there is an error during the cron job execution.
 */
router.get("/cron-job", scheduledJobs.cronTask);

export default router;