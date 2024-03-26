import { Router } from "express";
import { config } from '../config/server';
import validateIdParams from "../validation/idParams";
import ContactController from "../controllers/contact";
import { administratorAuthentication } from "../middlewares/adminAuth";
import validateRequestBody from "../middlewares/validateBodyRequest";
import { validateContact } from "../validation/contacts";
import { authMiddlewares } from "./common/userAuthMiddlewares";
import ContactService from "../services/contact";
import Contact from "../Models/Contact";

const service = new ContactService(Contact);

const controller = new ContactController(service);

// Destructure the ROLE1 and ROLE2 constants from the config object.
const { ROLE1, ROLE2 } = config;
const router = Router();

router.get('/search-contact', ...authMiddlewares, controller.searchContact);

/**
 * Route handler to get all contacts.
 *
 * @route GET /all-contacts
 * @middleware Requires user authentication.
 
 * @description
 * This middleware retrieves all contacts.
 * It requires user authentication to access the data.
 * The retrieved contacts are then sent in the response.
 *
 * @returns {Promise<void>} - Resolves with the list of all contacts in the response.
 */
router.get("/all-contacts", ...authMiddlewares, controller.allContacts);

/**
 * Route handler to display a contact by its ID.
 *
 * @route GET /display-contact/:id
 * @middleware Requires user authentication and validates the contact ID.
 *
 * @description
 * This middleware retrieves and displays a contact based on its unique ID.
 * It requires user authentication to access the data.
 * The contact ID is validated using the `validateIdParams` middleware.
 * If the ID is valid, the corresponding contact is sent in the response.
 *
 * @returns {Promise<void>} - Resolves with the contact details in the response.
 */
router.get("/contact/:id", validateIdParams, ...authMiddlewares, controller.findContactById);

/**
 * Route handler to import contacts for a specific department.
 *
 * @route GET /import-contacts
 * @middleware Requires user authentication and filters contacts by department.
 *
 * @description
 * This middleware retrieves contacts for the 'import' department.
 * It requires user authentication to access the data.
 * The contacts are then filtered based on the specified department ('import').
 * The filtered contacts are sent in the response.
 *
 * @returns {Promise<void>} - Resolves with the list of contacts for the 'import' department in the response.
 */
router.get("/import-contacts", ...authMiddlewares, controller.selectDepartment('import'));

/**
 * Route handler to export contacts for a specific department.
 *
 * @route GET /export-contacts
 * @middleware Requires user authentication and filters contacts by department.
 *
 * @description
 * This middleware retrieves contacts for the 'export' department.
 * It requires user authentication to access the data.
 * The contacts are then filtered based on the specified department ('export').
 * The filtered contacts are sent in the response.
 *
 * @returns {Promise<void>} - Resolves with the list of contacts for the 'export' department in the response.
 */
router.get("/export-contacts", ...authMiddlewares, controller.selectDepartment('export'));

/**
 * Route handler to retrieve contacts for the pharmaceutical department.
 *
 * @route GET /pharma-contacts
 * @middleware Requires user authentication and filters contacts by department.
 *
 * @description
 * This middleware retrieves contacts for the pharmaceutical department.
 * It requires user authentication to access the data.
 * The contacts are then filtered based on the specified department ('pharma').
 * The filtered contacts are sent in the response.
 *
 * @returns {Promise<void>} - Resolves with the list of contacts for the pharmaceutical department in the response.
 */
router.get("/pharma-contacts", ...authMiddlewares, controller.selectDepartment('pharma'));

/**
 * Route handler to retrieve contacts for the aviation department.
 *
 * @route GET /aviation-contacts
 * @middleware Requires user authentication and filters contacts by department.
 *
 * @description
 * This middleware retrieves contacts for the aviation department.
 * It requires user authentication to access the data.
 * The contacts are then filtered based on the specified department ('aviation').
 * The filtered contacts are sent in the response.
 *
 * @returns {Promise<void>} - Resolves with the list of contacts for the aviation department in the response.
 */
router.get("/aviation-contacts", ...authMiddlewares, controller.selectDepartment('aviation'));

/**
 * Route handler to retrieve contacts for the transportation department.
 *
 * @route GET /transportation-contacts
 * @middleware Requires user authentication and filters contacts by department.
 *
 * @description
 * This middleware retrieves contacts for the transportation department.
 * It requires user authentication to access the data.
 * The contacts are then filtered based on the specified department ('transportation').
 * The filtered contacts are sent in the response.
 *
 * @returns {Promise<void>} - Resolves with the list of contacts for the transportation department in the response.
 */
router.get("/transportation-contacts", ...authMiddlewares, controller.selectDepartment('transportation'));

/**
 * Route handler to create a new contact.
 *
 * @route POST /create-contact
 * @middleware Requires user authentication, admin privileges, and performs necessary validations.
 * @validateparam {string} id - The ID of the contact to be created.
 * @middleware Performs Mongoose validation on specific fields of the contact.
 *
 * @description
 * This middleware creates a new contact.
 * It requires user authentication, and admin privileges. 
 * The contact details are validated using the provided schema in `validateContact`.
 * Mongoose validation is also performed on specific fields.
 * If the creation is successful, it responds with a success message.
 *
 * @returns {Promise<void>} - Resolves with a success message in the response.
 */
router.post("/create-contact",
  ...authMiddlewares,
  administratorAuthentication([ROLE1, ROLE2]),
  validateRequestBody(validateContact),
  controller.contactMongooseValidation(
    ["department", "contactName", "phone", "extension", "email"]
  ),
  controller.createContact
);

/**
 * Route handler to update an existing contact by ID.
 *
 * @route PUT /update-contact/:id
 * @middleware Requires user authentication, validates the contact ID,
 *            and requires admin privileges for the operation.
 * @validateparam {string} id - The ID of the contact to be updated.
 * @validateparam {string} id - The ID of the contact to be updated.
 * @middleware Performs Mongoose validation on specific fields of the contact.
 *
 * @description
 * This middleware updates an existing contact based on its unique ID.
 * It requires user authentication, admin privileges, and a valid contact ID for the operation.
 * The contact details are validated using the provided schema in `validateContact`.
 * Mongoose validation is also performed on specific fields.
 * If the update is successful, it responds with a success message.
 *
 * @returns {Promise<void>} - Resolves with a success message in the response.
 */
router.put("/update-contact/:id",
  ...authMiddlewares,
  validateIdParams,
  administratorAuthentication([ROLE1, ROLE2]),
  validateRequestBody(validateContact),
  controller.contactMongooseValidation(
    ["department", "contactName", "phone", "extension", "email"]
  ),
  controller.updateContact
);

/**
 * Route handler to remove a contact by its ID.
 *
 * @route DELETE /remove-contact/:id
 * @middleware Requires user authentication, admin privileges, and validates the contact ID.
 *
 * @description
 * This middleware removes a contact based on its unique ID.
 * It requires user authentication, admin privileges, and validates the contact ID using the `validateIdParams` middleware.
 * If the removal is successful, it responds with a success message.
 *
 * @returns {Promise<void>} - Resolves with a success message in the response.
 */
router.delete("/remove-contact/:id",
  ...authMiddlewares,
  validateIdParams,
  administratorAuthentication([ROLE1, ROLE2]),
  controller.removeContact
);

export default router;