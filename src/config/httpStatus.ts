/**
 * Enum representing commonly used HTTP status codes.
 * Each enum member corresponds to a specific HTTP status code.
 */
export enum HTTP_STATUS {
  OK = 200, // 200 - Successful HTTP request
  CREATED = 201, // 201 - Resource successfully created
  BAD_REQUEST = 400, // 400 - Invalid request or request parameters
  UNAUTHORIZED = 401, // 401 - Authentication required or failed
  FORBIDDEN = 403, // 403 - Authorization to access the resource is missing or insufficient
  NOT_FOUND = 404, // 404 - Requested resource not found
  CONFLICT = 409, // 409 - Conflict with the current state of the target resource
  INTERNAL_SERVER_ERROR = 500, // 500 - Server encountered an unexpected condition
}

export default HTTP_STATUS;