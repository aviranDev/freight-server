/**
 * Interface representing the structure of an error response.
 */
export interface ErrorResponse {
  status: number; // HTTP status code of the error response.
  name: string; // Name or type of the error.
  message: string; //Descriptive message providing details about the error.
}