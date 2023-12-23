import bcryptjs from "bcryptjs";

/** 
 * @description Salter
 * @param salt  string
 * @returns random characters before or after a password prior to hashing.
 */
const SECURE_DEFAULT_SALT_ROUNDS: number = 12;

export const salter = (salt: string) => {
  return bcryptjs.genSaltSync(Number(salt) || SECURE_DEFAULT_SALT_ROUNDS);
}

/**
 * @description Hashing
 * @param password string
 * @param salter string
 * @returns encryption algorithm passqord.
 */
export const hashing = async (password: string, salter: string): Promise<string> => {
  const hashedPassword = await bcryptjs.hash(password, salter);
  return hashedPassword;
}

/**
 * @description Compare passwords
 * @param bodyPassword string: reqesut body password
 * @param userPassword string: database user password
 * @returns boolean.
 */
export const comparePasswords = (bodyPassword: string, userPassword: string) => {
  return bcryptjs.compareSync(bodyPassword.trim(), userPassword);
}

export default { salter, hashing, comparePasswords };