const express = require("express");
const router = express.Router();
const projectController = require("../controllers/project.controller");
const { body, param } = require("express-validator");
const validators = require("../middlewares/validators");
const authMiddleware = require("../middlewares/authentication");

/**
 * @route POST /project
 * @description Manager create a new project
 * @access Manager
 */
router.post(
  "/",
  validators.validate([
    body("name", "Invalid name").exists().notEmpty(),
    body("description", "Invalid description").exists().notEmpty(),
  ]),
  authMiddleware.loginRequired,
  projectController.createProject
);

/**
 * @route GET /project
 * @description Manager view all projects
 * @access Manager
 */
// router.get("/", authMiddleware.loginRequired, projectController.getProjects);
/**
 * @route GET /project
 * @description Manager view a specific projects
 * @access Manager
 */
// router.get(
//   "/:projectId",
//   authMiddleware.loginRequired,
//   validators.validate([param("projectId").exists().isString().custom(validators.checkObjectId)]),
//   projectController.getSingleProject
// );

/**
 * @route PUT /project/:id
 * @description  Manager view projects in different views (by project, by assignee, by status,…)
 * @access Manager
 */
// router.put(
//   "/:projectId",
//   authMiddleware.loginRequired,
//   validators.validate([param("projectId").exists().isString().custom(validators.checkObjectId)]),
//   projectController.updateProject
// );

/**
 * @route DELETE /project/:id
 * @description  Manager remove a project
 * @access Manager
 */
// router.delete(
//   "/:projectId",
//   authMiddleware.loginRequired,
//   validators.validate([param("projectId").exists().isString().custom(validators.checkObjectId)]),
//   projectController.deleteProject
// );

module.exports = router;
