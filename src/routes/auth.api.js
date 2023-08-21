const express = require("express");
const router = express.Router();
const validators = require("../middlewares/validators");
const { body } = require("express-validator");
const authController = require("../controllers/auth.controller");

/**
 * @route POST /auth/login
 * @description Log in with username and password
 * @access Public
 */
router.post(
  "/login",
  validators.validate([
    body("email", "Invalid email").exists().isEmail().normalizeEmail({ gmail_remove_dots: false }),
    body("password", "Invalid password").exists().notEmpty(),
  ]),
  authController.loginWithEmail
);

/**
 * @route POST /auth/invitation
 * @description Manager send invitation to employee's email
 * @access Manager
 */
router.post(
  "/invitation",
  // permission.managerCheck,
  validators.validate([body("email", "Invalid email").exists().isEmail().normalizeEmail({ gmail_remove_dots: false })]),
  authController.sendInvitation
);

/**
 * @route POST /auth/setup-account
 * @description Employee setup account to joins the team with the invitation link
 * @access Public
 */
router.post("/setup-account", authController.setupAccount);

/**
 * @route POST /auth/forget-password
 * @description User send reset password request to email
 * @access Public
 */
router.post(
  "/forget-password",
  validators.validate([body("email", "Invalid email").exists().isEmail().normalizeEmail({ gmail_remove_dots: false })]),
  authController.forgotPassword
);

/**
 * @route PUT /auth/reset-password/:resetToken
 * @description User reset password
 * @access Public
 */
router.put(
  "/reset-password/:resetToken",
  validators.validate([body("password", "Invalid password").exists().notEmpty()]),
  authController.resetPassword
);

/**
 * @route POST /auth/login/facebook
 * @description Login with facebook
 * @access Public
 */

/**
 * @route POST /auth/login/google
 * @description Login with google
 * @access Public
 */

module.exports = router;
