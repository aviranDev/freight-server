import { Application } from "express";
import { validationErrorMiddleware } from "../middlewares/validation";
import authenticationErrorMiddleware from "../middlewares/authetication";
import { authorizationErrorMiddleware } from "../middlewares/authorization";
import { internalErrorMiddleware } from "../middlewares/internal";
import { conflictErrorMiddleware } from "../middlewares/conflict";
import { unknownRoutes } from "../middlewares/unknown";
import { errorHandler } from "./errorHandler";
import { manyRequestsMiddleware } from '../middlewares/manyRequests';
/**
 * Configures error-handling middleware for an Express application.
 *
 * @param {Application} app - The Express application instance.
 */
function configureErrorHandlers(app: Application) {
  // Handle validation errors (status 400)
  app.use(validationErrorMiddleware);

  // Handle authentication errors (status 401)
  app.use(authenticationErrorMiddleware);

  // Handle authorization errors (status 403)
  app.use(authorizationErrorMiddleware);

  // Handle unknown routes (status 404)
  app.use(unknownRoutes);

  // Handle conflict errors (status 409)
  app.use(conflictErrorMiddleware);

  // Handle too many requests errors (status 429)
  app.use(manyRequestsMiddleware);

  // Handle internal server errors (status 500)
  app.use(internalErrorMiddleware);

  // Handle other errors (error handling middleware)
  app.use(errorHandler); // This should always be the last error handler
}

export { configureErrorHandlers };