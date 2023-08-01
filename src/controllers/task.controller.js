const { sendResponse, AppError, catchAsync } = require("../helpers/utils.js");
const Task = require("../models/Task");
const User = require("../models/User");
const Project = require("../models/Project");
const Comment = require("../models/Comment");
const Notification = require("../models/Notification");

const taskController = {};

// Get a list of tasks
taskController.getTasks = catchAsync(async (req, res, next) => {
  let { page, limit, sortBy, sortOrder, ...filter } = { ...req.query };

  page = parseInt(page) || 1;
  limit = parseInt(limit) || 100;

  const filterConditions = [{ isDeleted: false }];

  // Filter search by name
  const name = req.query.name;
  if (name) {
    filterConditions.push({
      name: { $regex: name, $options: "i" },
    });
    filter.name = { $regex: name, $options: "i" };
  }

  // Filter search by status
  const status = req.query.status;
  if (status && ["Pending", "Working", "Review", "Done"].includes(status)) {
    filterConditions.push({
      status: status,
    });
  }

  // Filter search by priority
  const priority = req.query.priority;
  if (priority && ["Low", "Medium", "High"].includes(priority)) {
    filterConditions.push({
      priority: priority,
    });
  }

  // Combine the filter conditions for individual fields
  const nameFilter = name ? { name: { $regex: name, $options: "i" } } : {};
  const statusFilter = status ? { status: status } : {};
  const priorityFilter = priority ? { priority: priority } : {};

  // Combine all filter criteria
  const filterCriteria = filterConditions.length
    ? {
        $and: [{ isDeleted: false }, nameFilter, statusFilter, priorityFilter].filter(Boolean),
      }
    : {};

  sortBy = req.query.sortBy === "updatedAt" ? "updatedAt" : "createdAt";
  sortOrder = req.query.sortOrder === "desc" ? -1 : 1;

  const sortOptions = {};
  sortOptions[sortBy] = sortOrder;

  const count = await Task.countDocuments(filterCriteria);
  const totalPages = Math.ceil(count / limit);
  const offset = limit * (page - 1);

  // {{baseUrl}}/tasks?name=task&status=Pending&sortBy=updatedAt&sortOrder=desc

  let taskList = await Task.find({ ...filter, ...filterCriteria }) // Merge filterCriteria and filter
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
      assignTo: assignTo ? assignTo : "",
    };
  });

  return sendResponse(res, 200, true, { taskList, totalPages, count }, null, "");
});

// Get all tasks of current user
taskController.getTasksOfCurrentUser = catchAsync(async (req, res, next) => {
  const loggedInUserId = req.userId;
  let { page, limit, sortBy, sortOrder, ...filter } = { ...req.query };

  page = parseInt(page) || 1;
  limit = parseInt(limit) || 100;

  const currentUser = await User.findById(loggedInUserId);
  if (!currentUser) throw new AppError(404, "Current User not found", "Get User Error");

  const filterConditions = [{ isDeleted: false }, { assignTo: currentUser }];

  // Filter search by name
  const name = req.query.name;
  if (name) {
    filterConditions.push({
      name: { $regex: name, $options: "i" },
    });
    filter.name = { $regex: name, $options: "i" };
  }

  // Filter search by status
  const status = req.query.status;
  if (status && ["Pending", "Doing", "Review", "Done"].includes(status)) {
    filterConditions.push({
      status: status,
    });
  }

  // Filter search by priority
  const priority = req.query.priority;
  if (priority && ["Low", "Medium", "High"].includes(priority)) {
    filterConditions.push({
      priority: priority,
    });
  }

  // Combine the filter conditions for individual fields
  const nameFilter = name ? { name: { $regex: name, $options: "i" } } : {};
  const statusFilter = status ? { status: status } : {};
  const priorityFilter = priority ? { priority: priority } : {};

  // Combine all filter criteria
  const filterCriteria = filterConditions.length
    ? {
        $and: [{ isDeleted: false }, { assignTo: currentUser }, nameFilter, statusFilter, priorityFilter].filter(
          Boolean
        ),
      }
    : {};

  const count = await Task.countDocuments(filterCriteria);
  const totalPages = Math.ceil(count / limit);
  const offset = limit * (page - 1);

  // Handle sort feature
  const validSortFields = ["createdAt", "deadline", "status", "priority"];

  const mapStatusToNumber = (status) => {
    const statusMap = {
      Pending: 1,
      Working: 2,
      Review: 3,
      Done: 4,
    };
    return statusMap[status] || 0;
  };

  const mapPriorityToNumber = (priority) => {
    const priorityMap = {
      Low: 1,
      Medium: 2,
      High: 3,
    };
    return priorityMap[priority] || 0;
  };

  // Validate and set the sorting options
  sortBy = validSortFields.includes(sortBy) ? sortBy : "createdAt";
  sortOrder = sortOrder === "desc" ? -1 : 1;

  let sortOptions = {};

  // Custom sort for status and priority
  if (sortBy === "status") {
    sortOptions = { status: sortOrder };
  } else if (sortBy === "priority") {
    sortOptions = { priority: sortOrder };
  } else {
    sortOptions = { [sortBy]: sortOrder };
  }

  // {{baseUrl}}/tasks/mytasks?sortBy=status&sortOrder=desc

  let taskList = await Task.find({ assignTo: loggedInUserId, ...filter, ...filterCriteria })
    .sort(sortOptions)
    .skip(offset)
    .limit(limit)
    .populate("assignTo")
    .populate("projectTo");

  if (sortBy === "status") {
    taskList.sort((taskA, taskB) => {
      const statusComparison = mapStatusToNumber(taskA.status) - mapStatusToNumber(taskB.status);
      return statusComparison !== 0 ? statusComparison * sortOrder : taskA.deadline - taskB.deadline;
    });
  } else if (sortBy === "priority") {
    taskList.sort((taskA, taskB) => {
      const priorityComparison = mapPriorityToNumber(taskA.priority) - mapPriorityToNumber(taskB.priority);
      return priorityComparison !== 0 ? priorityComparison * sortOrder : taskA.deadline - taskB.deadline;
    });
  }

  // Extract the task names from the populated assignTo field
  taskList = taskList.map((task) => {
    // return {
    //   name: task.name,
    //   status: task.status,
    //   priority: task.priority,
    //   deadline: task.deadline,
    // };

    const projectTo = task.projectTo;
    const assignTo = task.assignTo;

    return {
      ...task.toJSON(),
      projectTo: projectTo ? projectTo._id : "",
      assignTo: assignTo ? assignTo : "",
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

  if (!task) throw new AppError(404, "Task not found", "Get Single Post Error");

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

      // Create the notification
      const notification = await Notification.create({
        recipient: userId,
        type: "Task",
        message: `You are assigned to ${task.name}`,
        taskId: taskId,
      });

      return sendResponse(res, 200, true, notification, null, "Task assigned successfully");
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

    // Create the notification
    const notification = await Notification.create({
      recipient: userId,
      type: "Task",
      message: `You are assigned to ${task.name}`,
      taskId: taskId,
    });

    return sendResponse(res, 200, true, { notification }, null, "Task assigned successfully");
  }
});

// Update a task by id
taskController.editTask = catchAsync(async (req, res, next) => {
  const taskId = req.params.taskId;
  const loggedInUserId = req.userId;
  const loggedInUserRole = req.permission;

  const updateTask = req.body;

  // Find the task by taskId
  const task = await Task.findById(taskId);
  if (!task) {
    throw new AppError(404, "Not Found", "Task not found");
  }

  // Retrieve the assigned user ID of the task
  const assignedUserId = task.assignTo?._id?.toString();
  if (loggedInUserRole !== "Manager" && loggedInUserId !== assignedUserId) {
    throw new AppError(403, "You can only edit tasks assigned to you", "Update Task Error");
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

  const task = Task.findById(taskId);
  if (!task) throw new AppError(404, "Task not found", "Get Comment Error");

  const count = await Comment.countDocuments({ task: taskId });

  const comments = await Comment.find({ task: taskId }).sort({ createdAt: 1 }).populate("author");

  return sendResponse(res, 200, true, { comments, count }, null, "");
});

module.exports = taskController;
