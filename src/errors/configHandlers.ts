import { Application } from "express";
import { validationMiddleware } from "./validation";
import { authenticationMiddleware } from "./autheticationError";
import { authorizationMiddleware } from "./authorizationError";
import { internalMiddleware } from "./internalError";
import { conflictMiddleware } from "./conflictError";
import { unknownRoutes } from "./unknown";
import { errorHandler } from "./errorHandler";
import { manyRequestsMiddleware } from './manyRequests';
/**
 * Configures error-handling middleware for an Express application.
 *
 * @param {Application} app - The Express application instance.
 */
function configureErrorHandlers(app: Application) {
  // Handle validation errors (status 400)
  app.use(validationMiddleware);

  // Handle authentication errors (status 401)
  app.use(authenticationMiddleware);

  // Handle authorization errors (status 403)
  app.use(authorizationMiddleware);

  // Handle unknown routes (status 404)
  app.use(unknownRoutes);

  // Handle conflict errors (status 409)
  app.use(conflictMiddleware);

  // Handle too many requests errors (status 429)
  app.use(manyRequestsMiddleware);

  // Handle internal server errors (status 500)
  app.use(internalMiddleware);

  // Handle other errors (error handling middleware)
  app.use(errorHandler); // This should always be the last error handler
}

export { configureErrorHandlers };