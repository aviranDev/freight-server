import { EnvironmentVariableError } from "../errors/services/enviromentVariable";

export class Config<T extends Record<string, any>> {
  constructor(protected config: T) {
    this.validateConfig(config);
  }

  /**
 * Validates the configuration object recursively, with improved time and space complexity.
 * 
 * @param config The configuration object to validate.
 * @param depthLimit The maximum recursion depth allowed (default: 1000).
 * 
 * Time Complexity: O(n)
 * - n is the total number of keys in the configuration object.
 * - Each key-value pair in the configuration object is traversed exactly once.
 * 
 * Space Complexity: O(d)
 * - d is the depth of the recursion.
 * - With the addition of the depthLimit parameter, the recursion depth is limited.
 * - The space complexity is bounded by the depth limit, preventing unbounded growth of the call stack.
 */
  protected validateConfig(config: T, depthLimit: number = 1000): void {
    // Array to store missing keys in the configuration
    const missingKeys: string[] = [];

    // Recursive function to validate the configuration object
    const validateObject = (obj: Record<string, any>, path: string = '', depth: number = 0): void => {
      if (depth > depthLimit) {
        throw new Error('Recursion depth limit exceeded');
      }

      // Iterate through each key-value pair in the object
      Object.entries(obj).forEach(([key, value]) => {
        // Construct the full path of the key
        const fullPath = path ? `${path}.${key}` : key;
        // If the value is an object, recursively validate it
        if (typeof value === 'object' && value !== null) {
          validateObject(value, fullPath, depth + 1);
          // If the value is falsy, add the key to the missingKeys array
        } else if (!value) {
          missingKeys.push(fullPath);
        }
      });
    };

    // Start validation with the top-level configuration object
    validateObject(config);

    // If there are missing keys, throw an EnvironmentVariableError
    if (missingKeys.length > 0) {
      throw new EnvironmentVariableError(`${missingKeys.join(', ')}`);
    }
  }
}

export default Config;