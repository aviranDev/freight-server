import { Router } from "express";
import { administratorAuthentication } from "../middlewares/adminAuth";
import validateRequestBody from "../middlewares/validateBodyRequest";
import { validateRegister } from "../validation/user";
import { config } from '../config/server';
import validateIdParams from "../validation/idParams";
import forbiddenAddedRoles from "../middlewares/forbiddenAddedRoles";
import { authMiddlewares } from "./common/userAuthMiddlewares";
import UserService from "../services/user";
import UserController from "../controllers/user";
import UserModel from "../Models/User";
const { ROLE1, ROLE2 } = config;

// Create an instance of the User Service
const userService = new UserService(UserModel);

// Create an instance of the User Controller with the UserService instance
const userController = new UserController(userService);

// Create an Express Router
const router = Router();

/**
 * Retrieves the profile of a user.
 * @route GET /user-profile
 * @middleware
 * - `authJWT`: Authenticates the user.
 * - `authResetPassword`: Enhances security.
 * @response JSON - User profile data.
 */
router.get("/user-profile", ...authMiddlewares, userController.memberProfile);

/**
 * Adds a new member to the system.
 * @route POST /register
 * @access Admin and Super Admin
 * @middleware
 * - `authJWT`: Authenticates the user.
 * - `authorisedByRole`: Ensures the user has admin or super admin role.
 * - `authResetPassword`: Enhances security.
 * - `validateRequestBody`: Validates the request body for user registration data.
 * - `mongooseValidationSchema`: Validates the request against the Member model schema.
 * - `forbiddenAddedRoles`: Prevents adding members with forbidden roles.
 * @request JSON - Expects valid user registration data in the request body.
 * @response JSON - Returns the newly added member data.
 */
router.post("/register",
  ...authMiddlewares,
  administratorAuthentication([ROLE1, ROLE2]),
  validateRequestBody(validateRegister),
  userController.userMongooseValidation(['username', 'password', 'role']),
  forbiddenAddedRoles([ROLE1]),
  userController.addMember
);

/**
 * Retrieves a list of employee members with pagination details.
 * @route GET /all-employees
 * @access Admin and Super Admin
 * @middleware
 * - `authJWT`: Authenticates the user.
 * - `authorisedByRole`: Ensures the user has admin or super admin role.
 * - `authResetPassword`: Enhances security.
 * @response JSON - Returns a list of employee members with pagination details.
 */
router.get("/all-employees",
  ...authMiddlewares,
  administratorAuthentication([ROLE1, ROLE2]),
  userController.displayAllEmployees
);

/**
 * Removes a user by their ID.
 * @method DELETE
 * @route /remove-user/:id
 * @access Admin and Super Admin
 * @middleware
 * - `authJWT`: Authenticates the user.
 * - `authorisedByRole`: Ensures the user has admin or super admin role.
 * - `authResetPassword`: Enhances security.
 * - `validateIdParams`: Validates the request parameter (member ID).
 * @response JSON - Returns the removed user's data or an error message.
 */
router.delete("/remove-user/:id",
  ...authMiddlewares,
  administratorAuthentication([ROLE1, ROLE2]),
  validateIdParams,
  userController.removeMember
);

/**
 * Updates the role of a user by their ID.
 * @method PUT
 * @route /update-role/:id
 * @access Super Admin only
 * @middleware
 * - `authJWT`: Authenticates the user.
 * - `authorisedByRole`: Ensures the user has super admin role.
 * - `validateIdParams`: Validates the request parameter (member ID).
 * - `authResetPassword`: Enhances security.
 * - `forbiddenAddedRoles`: Checks for forbidden roles in the request.
 * @response JSON - Returns the updated user's data or an error message.
 */
router.put("/update-role/:id",
  ...authMiddlewares,
  administratorAuthentication([ROLE1]),
  validateIdParams,
  forbiddenAddedRoles([ROLE1]),
  userController.changeMemberRole
);

export default router;