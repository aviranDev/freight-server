import { HTTP_STATUS } from '../../config/httpStatus';

/**
 * Map to store human-readable names for HTTP status codes.
 * This map is used to provide meaningful names for common HTTP status codes in error messages.
 * Each entry consists of a key-value pair, where the key is the HTTP status code,
 * and the value is a human-readable name for that status code.
 * 
 * @example
 * statusErrors.get(HTTP_STATUS.NOT_FOUND); // Returns 'Not Found Error'
 */
export const errorServiceMap = new Map<number, string>([
  [HTTP_STATUS.BAD_REQUEST, 'Bad Request Error'],
  [HTTP_STATUS.UNAUTHORIZED, 'Authentication Error'],
  [HTTP_STATUS.FORBIDDEN, 'Forbidden Error'],
  [HTTP_STATUS.NOT_FOUND, 'Not Found Error'],
  [HTTP_STATUS.CONFLICT, 'Conflict Error'],
  [HTTP_STATUS.TOO_MANY_REQUESTS, 'Too Many Requests'],
  [HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Internal Server Error'],
]);