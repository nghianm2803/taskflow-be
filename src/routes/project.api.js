const express = require("express");
const router = express.Router();
const projectController = require("../controllers/project.controller");
const { body, param } = require("express-validator");
const validators = require("../middlewares/validators");
const authMiddleware = require("../middlewares/authentication");
const permission = require("../middlewares/permission");

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
  permission.managerCheck,
  projectController.createProject
);

/**
 * @route GET /project
 * @description User view all projects
 * @access Login
 */
router.get("/", authMiddleware.loginRequired, projectController.getProjects);

/**
 * @route GET /project
 * @description User view a specific projects
 * @access Login
 */
router.get(
  "/:projectId",
  authMiddleware.loginRequired,
  validators.validate([param("projectId").exists().isString().custom(validators.checkObjectId)]),
  projectController.getSingleProject
);

/**
 * @route PUT /project/:id
 * @description  Manager update a project
 * @access Manager
 */
router.put(
  "/:projectId",
  authMiddleware.loginRequired,
  permission.managerCheck,
  validators.validate([param("projectId").exists().isString().custom(validators.checkObjectId)]),
  projectController.updateProject
);

/**
 * @route DELETE /project/:id
 * @description  Manager remove a project
 * @access Manager
 */
router.delete(
  "/:projectId",
  authMiddleware.loginRequired,
  permission.managerCheck,
  validators.validate([param("projectId").exists().isString().custom(validators.checkObjectId)]),
  projectController.deleteProject
);

/**
 * @route PUT api/project/:projectId/task/:taskId
 * @description Add task to a project
 * @access Manager
 */
router.put(
  "/:projectId/task/:taskId",
  validators.validate([param("projectId").exists().isString().custom(validators.checkObjectId)]),
  validators.validate([param("taskId").exists().isString().custom(validators.checkObjectId)]),
  authMiddleware.loginRequired,
  permission.managerCheck,
  projectController.addTask
);

module.exports = router;
