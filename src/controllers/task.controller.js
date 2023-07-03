const { sendResponse, AppError, catchAsync } = require("../helpers/utils.js");
const Task = require("../models/Task");
const User = require("../models/User");
const Project = require("../models/Project");
const taskController = {};

// Get a list of tasks
taskController.getTasks = catchAsync(async (req, res, next) => {
  let { page, limit, ...filter } = { ...req.query };

  page = parseInt(page) || 1;
  limit = parseInt(limit) || 10;

  const filterConditions = [{ isDeleted: false }];
  if (filter.name) {
    filterConditions.push({
      ["name"]: { $regex: filter.name, $options: "i" },
    });
  }
  const filterCrireria = filterConditions.length ? { $and: filterConditions } : {};

  const count = await Task.countDocuments(filterCrireria);
  const totalPages = Math.ceil(count / limit);
  const offset = limit * (page - 1);

  // Filter search by status sort by createdAt : updatedAt and order by asc : desc
  const status = req.query.status;
  if (status && ["Pending", "Doing", "Review", "Done", "Archive"].includes(status)) {
    filter.status = status;
  }

  // Filter search by name sort by createdAt : updatedAt and order by asc : desc
  const name = req.query.name;
  if (name) {
    filter.name = { $regex: name, $options: "i" };
  }

  const sortBy = req.query.sortBy === "updatedAt" ? "updatedAt" : "createdAt";
  const sortOrder = req.query.sortOrder === "desc" ? -1 : 1;

  const sortOptions = {};
  sortOptions[sortBy] = sortOrder;

  let taskList = await Task.find(filter || {})
    .sort(sortOptions)
    .skip(offset)
    .limit(limit)
    .populate("assignTo")
    .populate("projectTo");

  // Extract the task names from the populated assignTo field
  taskList = taskList.map((task) => {
    const projectTo = task.projectTo;
    return {
      ...task.toJSON(),
      projectTo: projectTo ? projectTo.name : "",
    };
  });

  return sendResponse(res, 200, true, { taskList, totalPages, count }, null, "");
});

// Get a task by id
taskController.getTask = catchAsync(async (req, res, next) => {
  const taskId = req.params.taskId;
  const detailTask = await Task.findOne({ _id: taskId }).populate("projectTo");

  // Extract the username from the populated projectTo field
  const projectTo = detailTask.projectTo;
  const modifiedTask = {
    ...detailTask.toJSON(),
    projectTo: projectTo ? projectTo.name : "",
  };

  return sendResponse(res, 200, true, modifiedTask, null, "Get Task Info Successfully!");
});

// Add a new task
taskController.createTask = catchAsync(async (req, res, next) => {
  //Get data from request
  let { name, description, priority, deadline } = req.body;

  // Validate
  let task = await Task.findOne({ name });
  if (task) throw new AppError(400, "Task already exists", "Create Task Error");

  task = await Task.create({ name, description, priority, deadline });

  //Response
  return sendResponse(res, 200, true, { task }, null, "Create Task Successful");
});

// Add a task to a project
taskController.projects = catchAsync(async (req, res, next) => {
  const taskId = req.params.taskId;
  const projectId = req.params.projectId;

  // Find the task by taskId
  const task = await Task.findById(taskId);
  if (!task) {
    throw new AppError(404, "Not Found", "Task not found");
  }

  // Find the project by projectId
  const project = await Project.findById(projectId);
  console.log(project);
  if (!project) {
    throw new AppError(404, "Not Found", "Project not found");
  }
  // Assign the task to the project
  task.projectTo = projectId;
  await task.save();

  // Add the task ID to the project's tasksList
  if (!project.tasksList) {
    project.tasksList = []; // Initialize tasksList if not already defined
  }
  project.tasksList.push(taskId);
  await project.save();
  return sendResponse(res, 200, true, null, "Task added to project successfully");
});

// Assign task to user
// taskController.assignTask = async (req, res, next) => {
//   const taskId = req.params.id;
//   const { userId } = req.body;

//   try {
//     // Find the task by taskId
//     const task = await Task.findById(taskId);
//     if (!task) {
//       throw new AppError(404, "Not Found", "Task not found");
//     }

//     // Find the user by userId
//     const user = await User.findById(userId);
//     if (!user) {
//       throw new AppError(404, "Not Found", "User not found");
//     }

//     // Assign or unassign the task
//     if (task.assignTo && task.assignTo.equals(userId)) {
//       // Unassign the task
//       task.assignTo = null;
//       const updatedTask = await task.save();

//       // Remove the task ID from the user's tasksList
//       const taskIndex = user.tasksList.indexOf(updatedTask._id.toString());
//       if (taskIndex !== -1) {
//         user.tasksList.splice(taskIndex, 1);
//       }
//       await user.save();

//       sendResponse(res, 200, true, null, "Task unassigned successfully");
//     } else {
//       // Assign the task
//       task.assignTo = userId;
//       const updatedTask = await task.save();
//       user.tasksList.push(updatedTask._id.toString());
//       await user.save();

//       sendResponse(res, 200, true, null, "Task assigned successfully");
//     }
//   } catch (err) {
//     next(err);
//   }
// };

// Update a task by id
// taskController.editTask = async (req, res, next) => {
//   try {
//     const taskId = req.params.id;
//     const updateTask = req.body;

//     await Promise.all([
//       body("status")
//         .notEmpty()
//         .withMessage("Status is empty")
//         .isIn(["Pending", "Working", "Review", "Done", "Archive"])
//         .withMessage("Status must be Pending, Working, Review, Done or Archive")
//         .run(req),
//       body("name")
//         .optional()
//         .custom(async (value) => {
//           if (value) {
//             const existingTask = await Task.findOne({ name: value });
//             if (existingTask) {
//               throw new Error("Task name already exists");
//             }
//           }
//         })
//         .run(req),
//     ]);

//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       const errorMessages = errors.array().map((error) => error.msg);
//       throw new AppError(400, "Bad Request", errorMessages.join(", "));
//     }

//     // Retrieve the existing task
//     const existingTask = await Task.findById(taskId);
//     if (!existingTask) {
//       throw new AppError(404, "Not Found", "Task not found");
//     }

//     // Check if the status change is valid
//     if (existingTask.status === "Done" && updateTask.status !== "Archive") {
//       throw new AppError(
//         400,
//         "Bad Request",
//         "Invalid status change. The 'Done' status cannot be changed except to 'Archive'."
//       );
//     }

//     if (existingTask.status === "Archive" && updateTask.status !== "Archive") {
//       throw new AppError(400, "Bad Request", "Invalid status change. The 'Archive' status cannot be changed.");
//     }

//     // Options modify query return data after update
//     const options = { new: true };
//     const updated = await Task.findByIdAndUpdate(taskId, updateTask, options);
//     sendResponse(res, 200, true, updated, null, "Update task success");
//   } catch (err) {
//     next(err);
//   }
// };

// Delete a task by id
// taskController.deleteTask = async (req, res, next) => {
//   try {
//     const taskId = req.params.id;

//     const softDeleteTask = await Task.findByIdAndUpdate(taskId, { isDeleted: true }, { new: true });

//     if (!softDeleteTask) {
//       throw new AppError(404, "Not Found", "Task not found");
//     }

//     sendResponse(res, 200, true, softDeleteTask, null, "Soft delete task success");
//   } catch (err) {
//     next(err);
//   }
// };

module.exports = taskController;
