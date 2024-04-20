import { logger } from "../logger/logger";
import { EnvironmentVariableError } from "../errors/services/enviromentVariable";

// Define a generic type for the class
type ConfigClass<T> = new (config: T) => any;

// Function to handle configuration instantiation
const handleConfiguration = <T>(config: T, ServerConfigClass: ConfigClass<T>): any => {
  try {
    // Attempt to instantiate the provided ServerConfigClass with the given config
    return new ServerConfigClass(config);
  } catch (error: any) {
    if (error instanceof EnvironmentVariableError) {
      // Log the error message along with additional context
      logger.error(error.message); // Log the error message  
    } else {
      // Log other types of errors along with additional context
      logger.error("Unhandled error"); // Log a generic error message
    }
    // Consider whether to exit the process or handle errors more gracefully
    process.exit(1); // Exit the process with a non-zero status code
  }
};

export default handleConfiguration; // Export the handleConfiguration function