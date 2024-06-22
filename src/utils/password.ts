import bcryptjs from "bcryptjs";
import { serverConfig } from "../config/serverConfiguration";

const SECURE_DEFAULT_SALT_ROUNDS: number = serverConfig.config.SALT;

/** 
 * Generate a salt for password hashing.
 * @param {string} salt - Custom salt value or fallback to default salt rounds.
 * @returns {string} - Generated salt.
 */
export const generateSalt = (salt: string): string => {
  return bcryptjs.genSaltSync(Number(salt) || SECURE_DEFAULT_SALT_ROUNDS);
}

/**
 * Hash a password using a given salt.
 * @param {string} password - The plain text password to hash.
 * @param {string} salt - The salt to use for hashing.
 * @returns {Promise<string>} - The hashed password.
 */
export const hashPassword = async (password: string, salt: string): Promise<string> => {
  const hashedPassword = await bcryptjs.hash(password, salt);
  return hashedPassword;
}

/**
 * Compare a plain text password with a hashed password.
 * @param {string} plainPassword - The plain text password to compare.
 * @param {string} hashedPassword - The hashed password to compare against.
 * @returns {boolean} - True if the passwords match, false otherwise.
 */
export const comparePasswords = (plainPassword: string, hashedPassword: string): boolean => {
  return bcryptjs.compareSync(plainPassword.trim(), hashedPassword);
}

export default { generateSalt, hashPassword, comparePasswords };