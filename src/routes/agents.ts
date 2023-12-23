import { Router } from "express";
import controller from "../controllers/agent";
import { authMiddlewares } from "./common/userAuthMiddlewares";
import { administratorAuthentication } from "../middlewares/adminAuth";
import { config } from '../config/server';

import { validateAirline } from "../validation/airlines";
import validateRequestBody from "../middlewares/validateBodyRequest";
import { limiter } from "../utils/limiter";
import validateIdParams from "../validation/idParams";

// Destructure the ROLE1 and ROLE2 constants from the config object.
const { ROLE1, ROLE2 } = config;
const router = Router();

/**
 * Route handler to get a list of all agents.
 *
 * @route GET /all-agents
 * @middleware Requires user authentication and excludes users in the password reset flow.
 * @middleware Validates the request parameters, authenticates users, and performs administrator authentication.
 * @description
 * This middleware retrieves a list of all agents.
 * It requires user authentication.
 * The route can be used by sending a GET request to /all-agents.
 */
router.get("/all-agents",
  ...authMiddlewares,
  administratorAuthentication([ROLE1, ROLE2]),
  controller.allAgents
);

/**
 * Route handler to get agents based on the 'PORT_NAME_1' port.
 *
 * @route GET /PORT_NAME_1-agents
 * @middleware Requires user authentication and excludes users in the password reset flow.
 *
 * @description
 * This middleware retrieves agents that belong to the 'PORT_NAME_1' port.
 * It requires user authentication.
 * The route can be used by sending a GET request to /PORT_NAME_1-agents.
 */
router.get(`/${config.PORT_NAME_1}-agents`,
  ...authMiddlewares,
  administratorAuthentication([ROLE1, ROLE2]),
  controller.selectByPort(config.PORT_NAME_1)
);

/**
 * Route handler to get agents based on the 'PORT_NAME_1' port.
 *
 * @route GET /PORT_NAME_1-agents
 * @middleware Requires user authentication and excludes users in the password reset flow.
 *
 * @description
 * This middleware retrieves agents that belong to the 'PORT_NAME_1' port.
 * It requires user authentication.
 * The route can be used by sending a GET request to /PORT_NAME_1-agents.
 */
router.get(`/${config.PORT_NAME_2}-agents`,
  ...authMiddlewares,
  administratorAuthentication([ROLE1, ROLE2]),
  controller.selectByPort(config.PORT_NAME_2)
);

export default router;