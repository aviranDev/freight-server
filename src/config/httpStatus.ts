/**
 * Enum representing commonly used HTTP status codes.
 * Each enum member corresponds to a specific HTTP status code.
 */
export enum HTTP_STATUS {
  OK = 200, // 200 - Successful HTTP request
  CREATED = 201, // 201 - Resource successfully created
  NOCONTENT = 204, // 204 - No content to return
  BAD_REQUEST = 400, // 400 - Invalid request or request parameters
  UNAUTHORIZED = 401, // 401 - Authentication required or failed
  FORBIDDEN = 403, // 403 - Client lacks permission to access the resource
  NOT_FOUND = 404, // 404 - Requested resource not found
  CONFLICT = 409, // 409 - Conflict with the current state of the target resource
  INTERNAL_SERVER_ERROR = 500, // 500 - Server encountered an unexpected condition
  TOO_MANY_REQUESTS = 429, // 429 - Too many requests from the client
}

export const httpStatusCodes = new Map<number, string>([
  [HTTP_STATUS.OK, 'Request has succeeded'],
  [HTTP_STATUS.CREATED, 'Resource has been created'],
  [HTTP_STATUS.NOCONTENT, 'No content'],
  [HTTP_STATUS.BAD_REQUEST, 'Bad request'],
  [HTTP_STATUS.UNAUTHORIZED, 'Authentication required or failed'],
  [HTTP_STATUS.FORBIDDEN, 'Client lacks permission to access the resource'],
  [HTTP_STATUS.NOT_FOUND, 'Requested resource not found'],
  [HTTP_STATUS.CONFLICT, 'Conflict with the current state of the target resource'],
  [HTTP_STATUS.TOO_MANY_REQUESTS, 'Too many requests from the client'],
  [HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Server encountered an unexpected condition'],
]);

export default HTTP_STATUS;