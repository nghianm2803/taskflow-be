const express = require("express");
const router = express.Router();
const taskController = require("../controllers/task.controller");
const { body, param } = require("express-validator");
const validators = require("../middlewares/validators");
const authMiddleware = require("../middlewares/authentication");
const permission = require("../middlewares/permission");

/**
 * @route GET api/tasks
 * @description Get a list of tasks
 * @access private
 */
router.get("/", authMiddleware.loginRequired, taskController.getTasks);

/**
 * @route GET api/tasks/:taskId
 * @description Get task by id
 * @access public
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
      .matches(/^(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})$/)
      .withMessage("Deadline must be in the format 'yyyy-mm-dd hh:mm:ss'"),
  ]),
  authMiddleware.loginRequired,
  permission.managerCheck,
  taskController.createTask
);

/**
 * @route PUT api/tasks
 * @description Update a task by id
 * @access public
 * @requiredBody: name
 */
// router.put("/:taskId",  validators.validate([param("taskId").exists().isString().custom(validators.checkObjectId)]), editTask);

/**
 * @route DELETE api/tasks
 * @description Delete a task by id
 * @access private, manager
 */
// router.delete("/:taskId",  validators.validate([param("taskId").exists().isString().custom(validators.checkObjectId)]), deleteTask);

/**
 * @route PUT api/tasks/:taskId/assign
 * @description Assign or unassign a task to a user
 * @access Login required
 * @requiredBody: userId
 */
// router.put(
//   "/:taskId/user/:userId",
//   validators.validate([param("taskId").exists().isString().custom(validators.checkObjectId)]),
//   validators.validate([param("userId").exists().isString().custom(validators.checkObjectId)]),
//   authMiddleware.loginRequired,
//   taskController.assignTask
// );

/**
 * @route PUT api/tasks/:taskId/project/:projectId
 * @description Add task to a project
 * @access Manager
 */
router.put(
  "/:taskId/project/:projectId",
  validators.validate([param("taskId").exists().isString().custom(validators.checkObjectId)]),
  validators.validate([param("projectId").exists().isString().custom(validators.checkObjectId)]),
  permission.managerCheck,
  taskController.projects
);

module.exports = router;
