const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const { body, param } = require("express-validator");
const validators = require("../middlewares/validators");
const authMiddleware = require("../middlewares/authentication");

/**
 * @route POST /users
 * @description Register new user
 * @body {name, email, password}
 * @access public
 */
router.post(
  "/",
  validators.validate([
    body("name", "Invalid name").exists().notEmpty(),
    body("email", "Invalid email").exists().isEmail().normalizeEmail({ gmail_remove_dots: false }),
    body("password", "Invalid password").exists().notEmpty(),
  ]),
  userController.register
);

/**
 * @route GET /users/me
 * @description Get current user info
 * @access Login required
 */
router.get("/me", authMiddleware.loginRequired, userController.getCurrentUser);

/**
 * @route GET /users?page=1&limit=10
 * @description Get list of users with pagination
 * @access Login required
 */
router.get("/", authMiddleware.loginRequired, userController.getUsers);

/**
 * @route GET /users/:id
 * @description Get a user profile
 * @access Login required
 */
router.get(
  "/:id",
  authMiddleware.loginRequired,
  validators.validate([param("id").exists().isString().custom(validators.checkObjectId)]),
  userController.getSingleUser
);

/**
 * @route PUT /users/:id
 * @description Update user profile
 * @access Login required
 */
router.put(
  "/:id",
  authMiddleware.loginRequired,
  validators.validate([param("id").exists().isString().custom(validators.checkObjectId)]),
  userController.updateProfile
);

module.exports = router;
