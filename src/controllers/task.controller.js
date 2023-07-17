const { sendResponse, AppError, catchAsync } = require("../helpers/utils.js");
const Task = require("../models/Task");
const User = require("../models/User");
const Project = require("../models/Project");
const Comment = require("../models/Comment");
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
  if (status && ["Pending", "Doing", "Review", "Done"].includes(status)) {
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
    const assignTo = task.assignTo;

    return {
      ...task.toJSON(),
      projectTo: projectTo ? projectTo._id : "",
      assignTo: assignTo ? assignTo.name : "",
    };
  });

  return sendResponse(res, 200, true, { taskList, totalPages, count }, null, "");
});

// Get a task by id
taskController.getTask = catchAsync(async (req, res, next) => {
  const taskId = req.params.taskId;
  let task = await Task.findOne({ _id: taskId })
    .populate("projectTo")
    .populate("assignTo")
    .populate({
      path: "comments",
      populate: {
        path: "author",
        select: "name",
      },
    });

  if (!task) throw new AppError(404, "Post not found", "Get Single Post Error");

  task = task.toJSON();
  task.comments = await Comment.find({ task: task._id });

  return sendResponse(res, 200, true, task, null, "Get Task Info Successfully!");
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
taskController.addToProjects = catchAsync(async (req, res, next) => {
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
  return sendResponse(res, 200, true, null, null, "Task added to project successfully");
});

// Assign task to user
taskController.assignTask = catchAsync(async (req, res, next) => {
  const taskId = req.params.taskId;
  const userId = req.params.userId;
  const loggedInUserId = req.userId;
  const loggedInUserRole = req.permission;

  // Find the task by taskId
  const task = await Task.findById(taskId);
  if (!task) {
    throw new AppError(404, "Not Found", "Task not found");
  }

  // Find the user by userId
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError(404, "Not Found", "User not found");
  }

  if (loggedInUserRole === "Manager") {
    // Manager can assign or unassign task
    if (task.assignTo && task.assignTo.equals(userId)) {
      // Unassign the task
      task.assignTo = null;
      const updatedTask = await task.save();

      // Remove the task ID from the user's tasksList
      const taskIndex = user.tasksList.indexOf(updatedTask._id.toString());
      if (taskIndex !== -1) {
        user.tasksList.splice(taskIndex, 1);
      }
      await user.save();

      return sendResponse(res, 200, true, null, null, "Task unassigned successfully");
    } else {
      // Assign the task
      task.assignTo = userId;
      const updatedTask = await task.save();
      user.tasksList.push(updatedTask._id.toString());
      await user.save();

      return sendResponse(res, 200, true, null, null, "Task assigned successfully");
    }
  } else if (loggedInUserRole === "Employee") {
    // Employee can only assign task to themselves if task is unassigned
    if (task.assignTo) {
      throw new AppError(403, "Permission not allowed to assign task to others", "Assigne Task Error");
    }

    if (userId !== loggedInUserId) {
      throw new AppError(403, "Permission not allowed to assign task to others", "Assigne Task Error");
    }

    task.assignTo = userId;
    const updatedTask = await task.save();
    user.tasksList.push(updatedTask._id.toString());
    await user.save();

    return sendResponse(res, 200, true, null, null, "Task assigned successfully");
  }
});

// Update a task by id
taskController.editTask = catchAsync(async (req, res, next) => {
  const taskId = req.params.taskId;
  const updateTask = req.body;

  // Find the task by taskId
  const task = await Task.findById(taskId);
  if (!task) {
    throw new AppError(404, "Not Found", "Task not found");
  }

  // Check if the status change is valid
  if (task.status === "Done") {
    throw new AppError(400, "Invalid status change. The 'Done' status cannot be changed", "Update Task Error");
  }

  // Options modify query return data after update
  const options = { new: true };
  const updated = await Task.findByIdAndUpdate(taskId, updateTask, options);
  return sendResponse(res, 200, true, updated, null, "Update Task success");
});

// Delete a task by id
taskController.deleteTask = catchAsync(async (req, res, next) => {
  const taskId = req.params.taskId;

  const softDeleteTask = await Task.findByIdAndUpdate(taskId, { isDeleted: true }, { new: true });

  if (!softDeleteTask) {
    throw new AppError(404, "Task not found", "Delete Task Error");
  }

  return sendResponse(res, 200, true, softDeleteTask, null, "Delete task success");
});

taskController.getCommentsOfTask = catchAsync(async (req, res, next) => {
  const taskId = req.params.taskId;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  const task = Task.findById(taskId);
  if (!task) throw new AppError(404, "Task not found", "Get Comment Error");

  const count = await Comment.countDocuments({ task: taskId });
  const totalPages = Math.ceil(count / limit);
  const offset = limit * (page - 1);

  const comments = await Comment.find({ task: taskId })
    .sort({ createdAt: 1 })
    .skip(offset)
    .limit(limit)
    .populate("author");

  return sendResponse(res, 200, true, { comments, totalPages, count }, null, "");
});

module.exports = taskController;
