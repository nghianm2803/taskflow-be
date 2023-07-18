const express = require("express");
const router = express.Router();
const taskController = require("../controllers/task.controller");
const { body, param } = require("express-validator");
const validators = require("../middlewares/validators");
const authMiddleware = require("../middlewares/authentication");
const permission = require("../middlewares/permission");

/**
 * @route GET /tasks
 * @description Get all tasks
 * @access Login
 */
router.get("/", authMiddleware.loginRequired, taskController.getTasks);

/**
 * @route GET /tasks
 * @description Get all tasks of current user logged-in
 * @access Login
 */
router.get("/mytasks", authMiddleware.loginRequired, taskController.getTasksOfCurrentUser);

/**
 * @route GET /tasks/:taskId
 * @description Get task by id
 * @access Login
 */
router.get(
  "/:taskId",
  validators.validate([param("taskId").exists().isString().custom(validators.checkObjectId)]),
  authMiddleware.loginRequired,
  taskController.getTask
);

/**
 * @route POST api/tasks
 * @description Create a new task
 * @access private, Manager
 */
router.post(
  "/",
  validators.validate([
    body("name", "Invalid name").exists().notEmpty(),
    body("description", "Invalid description").exists().notEmpty(),
    body("deadline", "Invalid Deadline")
      .exists()
      .notEmpty()
      .matches(/^(\d{4}\/\d{2}\/\d{2} \d{2}:\d{2}:\d{2})$/)
      .withMessage("Deadline must be in the format 'yyyy/mm/dd hh:mm:ss'"),
  ]),
  authMiddleware.loginRequired,
  permission.managerCheck,
  taskController.createTask
);

/**
 * @route PUT /tasks/:taskId
 * @description Update a task by id
 * @access Login required
 */
router.put(
  "/:taskId",
  validators.validate([
    body("status")
      .optional()
      .isIn(["Pending", "Working", "Review", "Done"])
      .withMessage("Status must be Pending, Working, Review or Done"),
    body("priority").optional().isIn(["Low", "Medium", "High"]).withMessage("Priority must be Low, Medium or High"),
    param("taskId").exists().isString().custom(validators.checkObjectId),
  ]),
  authMiddleware.loginRequired,
  taskController.editTask
);

/**
 * @route DELETE /tasks/:taskId
 * @description Delete a task by id
 * @access private, manager
 */
router.delete(
  "/:taskId",
  validators.validate([param("taskId").exists().isString().custom(validators.checkObjectId)]),
  authMiddleware.loginRequired,
  permission.managerCheck,
  taskController.deleteTask
);

/**
 * @route PUT api/tasks/:taskId/users/:userId
 * @description Assign or unassign a task to a user
 * @access Login required
 * @requiredBody: userId
 */
router.put(
  "/:taskId/users/:userId",
  validators.validate([param("taskId").exists().isString().custom(validators.checkObjectId)]),
  validators.validate([param("userId").exists().isString().custom(validators.checkObjectId)]),
  authMiddleware.loginRequired,
  taskController.assignTask
);

/**
 * @route PUT api/tasks/:taskId/projects/:projectId
 * @description Add or remove a task to project
 * @access Login required
 */
router.put(
  "/:taskId/projects/:projectId",
  validators.validate([param("taskId").exists().isString().custom(validators.checkObjectId)]),
  validators.validate([param("projectId").exists().isString().custom(validators.checkObjectId)]),
  authMiddleware.loginRequired,
  taskController.addToProjects
);

/**
 * @route GET /tasks/:taskId/comments
 * @description Get comments of a task
 * @access Login required
 */
router.get(
  "/:taskId/comments",
  validators.validate([param("taskId").exists().isString().custom(validators.checkObjectId)]),
  authMiddleware.loginRequired,
  taskController.getCommentsOfTask
);

module.exports = router;
