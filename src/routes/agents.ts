import { Router } from "express";
import AgentController from "../controllers/agent";
import { authMiddlewares } from "./common/userAuthMiddlewares";
import { administratorAuthentication } from "../middlewares/adminAuth";
import { config } from '../config/server';

import { validateAgent } from "../validation/agents";
import validateRequestBody from "../middlewares/validateBodyRequest";
import { limiter } from "../utils/limiter";
import validateIdParams from "../validation/idParams";
import AirlineService from "../services/airline";
import Airline from "../Models/Airline";
import AgentService from "../services/agents";
import Agent from "../Models/Agent";

const airlineService = new AirlineService(Airline);

const agentService = new AgentService(Agent, airlineService);

const controller = new AgentController(agentService);

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
 * Route handler to get agents based on the 'PORT_NAME_2' port.
 *
 * @route GET /PORT_NAME_2-agents
 * @middleware Requires user authentication and excludes users in the password reset flow.
 *
 * @description
 * This middleware retrieves agents that belong to the 'PORT_NAME_2' port.
 * It requires user authentication.
 * The route can be used by sending a GET request to /PORT_NAME_2-agents.
 */
router.get(`/${config.PORT_NAME_2}-agents`,
  ...authMiddlewares,
  administratorAuthentication([ROLE1, ROLE2]),
  controller.selectByPort(config.PORT_NAME_2)
);

/**
 * Route handler to get details of an agent by its ID.
 *
 * @route GET /display-agent/:id
 * @middleware Requires user authentication and excludes users in the password reset flow.
 * @param {string} id - The ID of the agent to retrieve.
 *
 * @description
 * This middleware retrieves details of an airline based on the provided ID.
 * It requires user authentication.
 * The route can be used by sending a GET request to /display-agent/:id.
 */
router.get("/display-agent/:id",
  ...authMiddlewares,
  administratorAuthentication([ROLE1, ROLE2]),
  controller.getAgentById
);

/**
 * Express Route: /create-agent
 *
 * @method POST
 * @path /create-agent
 *
 * @middlewares
 * - Authentication Middleware: Validates user authentication.
 * - Administrator Authentication Middleware: Ensures the user has admin privileges (ROLE1 or ROLE2).
 * - Request Body Validation Middleware: Validates the request body against the 'validateAgent' schema.
 * - Mongoose Validation Middleware: Validates 'agent', 'port', 'room', and 'floor' using Mongoose schema.
 *
 * @handler controller.createAgent
 * The 'createAgent' method in the 'controller' handles this route.
 */
router.post("/create-agent",
  ...authMiddlewares,
  administratorAuthentication([ROLE1, ROLE2]), // Administrator Authentication Middleware
  validateRequestBody(validateAgent), // Request Body Validation Middleware
  controller.agentMongooseValidation([ // Mongoose Validation Middleware
    "agent", "port", "room", "floor"
  ]),
  controller.createAgent, // Handler for creating an agent
);

/**
 * Express Route: /update-agent/:id
 *
 * @method PUT
 * @path /update-agent/:id
 *
 * @middlewares
 * - Validate ID Parameters Middleware: Validates the 'id' parameter in the request.
 * - Authentication Middleware: Validates user authentication.
 * - Administrator Authentication Middleware: Ensures the user has admin privileges (ROLE1 or ROLE2).
 * - Request Body Validation Middleware: Validates the request body against the 'validateAgent' schema.
 * - Mongoose Validation Middleware: Validates 'agent', 'port', 'room', and 'floor' using Mongoose schema.
 *
 * @handler controller.updateAgent
 * The 'updateAgent' method in the 'controller' handles this route.
 */
router.put("/update-agent/:id",
  validateIdParams,
  ...authMiddlewares,
  administratorAuthentication([ROLE1, ROLE2]),
  validateRequestBody(validateAgent),
  controller.agentMongooseValidation([
    "agent", "port", "room", "floor"
  ]),
  controller.updateAgent,
);

/**
 * Route handler to delete an agent by ID.
 *
 * @route DELETE /remove-agent/:id
 * @middleware Applies rate limiting to prevent abuse.
 * @middleware Requires user authentication.
 * @middleware Authenticates users as admins or super admins.
 * @param {string} id - The ID of the agent to be removed.
 */
router.delete("/remove-agent/:id",
  limiter, // Applies rate limiting to prevent abuse.
  ...authMiddlewares,
  administratorAuthentication([ROLE1, ROLE2]), // Authenticates users as admins or super admins.
  controller.removeAgent,
);

export default router;