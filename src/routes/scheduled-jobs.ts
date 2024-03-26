import { Router } from "express";
import { ScheduledJobController } from "../controllers/scheduled-jobs";
import SessionService from "../services/session";
import Session from "../Models/Session";

const service = new SessionService(Session);

const router = Router();

const scheduledJobs = new ScheduledJobController(service);

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