import { Router } from "express";
import { validateAirline } from "../validation/airlines";
import validateRequestBody from "../middlewares/validateBodyRequest";
import { administratorAuthentication } from "../middlewares/adminAuth";
import { limiter } from "../utils/limiter";
import { config } from '../config/server';
import { authMiddlewares } from "./common/userAuthMiddlewares";
import validateIdParams from "../validation/idParams";
import Airline from "../Models/Airline";
import AirlineService from "../services/airline";
import AirlineController from "../controllers/airline";

const service = new AirlineService(Airline);

const controller = new AirlineController(service);

// Destructure the ROLE1 and ROLE2 constants from the config object.
const { ROLE1, ROLE2 } = config;
const router = Router();

/**
 * Route handler to get a list of all airlines.
 *
 * @route GET /all-airlines
 * @middleware Requires user authentication and excludes users in the password reset flow.
 *
 * @description
 * This middleware retrieves a list of all airlines.
 * It requires user authentication.
 * The route can be used by sending a GET request to /all-airlines.
 */
router.get("/all-airlines", ...authMiddlewares, controller.allAirlines);

/**
 * Route handler to get details of an airline by its ID.
 *
 * @route GET /display-airline/:id
 * @middleware Requires user authentication and excludes users in the password reset flow.
 * @param {string} id - The ID of the airline to retrieve.
 *
 * @description
 * This middleware retrieves details of an airline based on the provided ID.
 * It requires user authentication.
 * The route can be used by sending a GET request to /display-airline/:id.
 */
router.get("/display-airline/:id", ...authMiddlewares, controller.getAirlineById);

/**
 * Route handler to get airlines based on the 'PORT_NAME_1' port.
 *
 * @route GET /PORT_NAME_1-airlines
 * @middleware Requires user authentication and excludes users in the password reset flow.
 *
 * @description
 * This middleware retrieves airlines that belong to the 'PORT_NAME_1' port.
 * It requires user authentication.
 * The route can be used by sending a GET request to /PORT_NAME_1-airlines.
 */
router.get(`/${config.PORT_NAME_1}-airlines`, ...authMiddlewares, controller.selectByPort(config.PORT_NAME_1));

/**
 * Route handler to get airlines based on the 'PORT_NAME_2' port.
 *
 * @route GET /PORT_NAME_2-airlines
 * @middleware Requires user authentication and excludes users in the password reset flow.
 *
 * @description
 * This middleware retrieves airlines that belong to the 'PORT_NAME_2' port.
 * It requires user authentication.
 * The route can be used by sending a GET request to /PORT_NAME_2-airlines.
 */
router.get(`/${config.PORT_NAME_2}-airlines`, ...authMiddlewares, controller.selectByPort(config.PORT_NAME_2));

/**
 * Route handler to search for airlines based on a query parameter.
 *
 * @route GET /airlines/search-airline
 * @middleware Requires user authentication and excludes users in the password reset flow.
 * @queryparam {string} name - The search query for airline names.
 * @queryparam {string} prefix - The search query for airline prefixes.
 * @queryparam {string} agency - The search query for airline agency.
 *
 * @description
 * This middleware searches for airlines based on the provided query parameter strings.
 * It requires user authentication and excludes users in the password reset flow.
 * The query parameters 'name', 'prefix' and agency are used to specify the search query for airline names and prefixes.
 * The route can be used with the following examples:
 * - /airlines/search-airline?name=AirlineName
 * - /airlines/search-airline?prefix=AirlinePrefix
 */
router.get("/search-airline", ...authMiddlewares, controller.searchAirline);

/**
 * Route handler to create a new airline.
 *
 * @route POST /create-airline
 * @middleware Requires user authentication and excludes users in the password reset flow.
 * @middleware Authenticates users as admins or super admins.
 * @middleware Validate the request body based on the provided schema.
 * @middleware Perform Mongoose validation on specific fields (airline, prefix, code, agent, port).
 *
 * @description
 * This middleware creates a new airline based on the provided request body.
 * It requires user authentication and authenticates users as admins or super admins.
 * The request body is validated against the provided schema, and Mongoose validation is performed on specific fields.
 * The route can be used to create a new airline by sending a POST request to /create-airline with the required data in the request body.
 */
router.post("/create-airline",
  ...authMiddlewares,
  administratorAuthentication([ROLE1, ROLE2]),
  validateRequestBody(validateAirline),
  controller.airlineMongooseValidation([
    "name", "prefix", "code", "agent"
  ]),
  controller.createAirline,
);

/**
 * Route handler to update the details of an existing airline.
 *
 * @route PUT /update-airline/:id
 * @middleware Validates the request parameters, authenticates users, and performs administrator authentication.
 * @validateparam {string} id - The ID of the airline to be updated.
 * @middleware Validates the request body based on the provided schema.
 * @middleware Performs Mongoose validation on specific fields of the airline.
 *
 * @description
 * This middleware updates the details of an existing airline based on the provided ID.
 * It first validates the request parameters, authenticates users, and performs administrator authentication.
 * Then, it validates the request body based on the provided schema and performs Mongoose validation on specific fields.
 * After that, it calls the updateAirline method of the AirlineService to perform the update operation.
 * If the update is successful, it responds with a success message.
 * If there are any errors during the process, they are passed to the error-handling middleware.
 * After the operation, it logs a message indicating that the update operation is complete.
 *
 * @returns {Promise<void>} - Resolves with a success message on successful update.
 */
router.put("/update-airline/:id",
  validateIdParams,
  ...authMiddlewares,
  administratorAuthentication([ROLE1, ROLE2]),
  validateRequestBody(validateAirline),
  controller.airlineMongooseValidation([
    "name", "prefix", "code", "agent"
  ]),
  controller.updateAirline,
);

/**
 * Route handler to remove an airline by its name or prefix.
 *
 * @route DELETE /remove-airline
 * @middleware Applies rate limiting to prevent abuse.
 * @middleware Requires user authentication and excludes users in the password reset flow.
 * @middleware Authenticates users as admins or super admins.
 * @queryparam {string} name - The search query for airline names.
 * @queryparam {string} prefix - The search query for airline prefixes.
 *
 * @description
 * This middleware removes an airline based on its name or prefix.
 * It requires rate limiting to prevent abuse and user authentication, excluding users in the password reset flow.
 * Authenticates users as admins or super admins.
 * The query parameters 'name' and 'prefix' are used to specify the search query for airline names and prefixes.
 * The route can be used with the following examples:
 * - DELETE /remove-airline?name=AirlineName
 * - DELETE /remove-airline?prefix=AirlinePrefix
 */
router.delete("/remove-airline/:id",
  limiter, // Applies rate limiting to prevent abuse.
  ...authMiddlewares,
  administratorAuthentication([ROLE1, ROLE2]), // Authenticates users as admins or super admins.
  controller.removeAirline,
);

export default router;