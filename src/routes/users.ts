import { Router } from "express";
import { administratorAuthentication } from "../middlewares/adminAuth";
import validateRequestBody from "../middlewares/validateBodyRequest";
import { validateRegister } from "../validation/user";
import controller from "../controllers/user";
import { config } from '../config/server';
import validateIdParams from "../validation/idParams";
import forbiddenAddedRoles from "../middlewares/forbiddenAddedRoles";
import { authMiddlewares } from "./common/userAuthMiddlewares";
const { ROLE1, ROLE2 } = config;
const router = Router();

/**
 * User Profile
 * @method GET
 * @route /user-profile
 * @description Retrieves the profile of a member.
 * @access Admin, Super Admin, Member.
 * @middleware
 * - `authJWT`: Handles user authentication.
 * - `authResetPassword`: Provides additional security.
 * @response JSON - Returns user profile data.
 */
router.get("/user-profile", ...authMiddlewares, controller.memberProfile);

/**
 * Add Member
 * @method POST
 * @route /add-member
 * @description Adds a new member to the system.
 * @access Admin and Super Admin.
 * @middleware
 * - `authJWT`: Handles user authentication.
 * - `authorisedByRole`: Ensures the user has admin or super admin role.
 * - `authResetPassword`: Provides additional security.
 * - `validateRequestBody`: Expects valid user registration data in the request body.
 * - `mongooseValidationSchema`: Validates the request against the Member model schema.
 * - `forbiddenAddedRoles`: Checks for forbidden roles in the request.
 * @request JSON - Expects a valid user registration data in the request body.
 * @response JSON - Returns the newly added member data.
 */
router.post("/register",
  ...authMiddlewares,
  administratorAuthentication([ROLE1, ROLE2]),
  validateRequestBody(validateRegister),
  controller.userMongooseValidation(['username', 'password', 'role']),
  forbiddenAddedRoles([ROLE1]),
  controller.addMember
);

/**
 * All Employees
 * @method GET
 * @route /all-employees
 * @description Retrieves a list of employee members with pagination details.
 * @access Admin and Super Admin.
 * @middleware
 * - `authJWT`: Handles user authentication.
 * - `authorisedByRole`: Ensures the user has admin or super admin role.
 * - `authResetPassword`: Provides additional security.
 * @response JSON - Returns a list of employee members with pagination details.
 */
router.get("/all-employees",
  ...authMiddlewares,
  administratorAuthentication([ROLE1, ROLE2]),
  controller.displayAllEmployees
);

/**
 * Remove Member
 * @method DELETE
 * @route /remove-member/:id
 * @description Removes a user by their ID.
 * @access Admin and Super Admin.
 * @middleware
 * - `authJWT`: Handles user authentication.
 * - `authorisedByRole`: Ensures the user has admin or super admin role.
 * - `authResetPassword`: Provides additional security.
 * - `validateIdParams`: Validates the request parameter (member ID).
 * @response JSON - Returns the removed user's data or an error message.
 */
router.delete("/remove-user/:id",
  ...authMiddlewares,
  administratorAuthentication([ROLE1, ROLE2]),
  validateIdParams,
  controller.removeMember
);

/**
 * Update User Role
 * @method PUT
 * @route /update-role/:id
 * @description Updates the role of a user by their ID.
 * @access Super Admin only.
 * @middleware
 * - `authJWT`: Handles user authentication.
 * - `authorisedByRole`: Ensures the user has super admin role.
 * - `validateIdParams`: Validates the request parameter (member ID).
 * - `authResetPassword`: Provides additional security.
 * - `forbiddenAddedRoles`: Checks for forbidden roles in the request.
 * @response JSON - Returns the updated user's data or an error message.
 */
router.put("/update-role/:id",
  ...authMiddlewares,
  administratorAuthentication([ROLE1]),
  validateIdParams,
  forbiddenAddedRoles([ROLE1]),
  controller.changeMemberRole
);

export default router;