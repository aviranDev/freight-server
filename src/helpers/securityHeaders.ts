import { Application } from "express";

/**
 * Configures security headers for an Express.js application.
 *
 * @param {Application} app - The Express.js application instance.
 * @returns {void}
 */
function configureSecurityHeaders(app: Application): void {
  // Set Content Security Policy (CSP) header
  app.use((request, response, next) => {
    response.header("Content-Security-Policy", "default-src 'self'");
    next();
  });

  // Set Strict Transport Security (HSTS) header
  app.use((request, response, next) => {
    response.header("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
    next();
  });

  // Add other security headers as needed
  // Example: X-Content-Type-Options, X-Frame-Options, X-XSS-Protection, etc.
}

export { configureSecurityHeaders };