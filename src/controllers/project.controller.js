const { sendResponse, AppError, catchAsync } = require("../helpers/utils.js");
const Project = require("../models/Project");
const Task = require("../models/Task");
const projectController = {};

projectController.createProject = catchAsync(async (req, res, next) => {
  //Get data from request
  let { name, description } = req.body;

  // Validate
  let project = await Project.findOne({ name });
  if (project) throw new AppError(400, "Project already exists", "Create Project Error");

  project = await Project.create({ name, description });

  //Response
  return sendResponse(res, 200, true, { project }, null, "Create Project Successful");
});

projectController.getProjects = catchAsync(async (req, res, next) => {
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

  const count = await Project.countDocuments(filterCrireria);
  const totalPages = Math.ceil(count / limit);
  const offset = limit * (page - 1);

  let projects = await Project.find(filterCrireria)
    .sort({ createdAt: -1 })
    .skip(offset)
    .limit(limit)
    .populate({
      path: "tasksList",
      populate: {
        path: "assignTo",
        select: "name", // Include the name field of the assignTo user
      },
    });

  // Extract the task names from the populated tasksList field
  projects = projects.map((project) => {
    const tasks = project.tasksList.map((task) => {
      return {
        name: task.name,
        assignTo: task.assignTo,
      };
    });
    return { ...project.toJSON(), tasksList: tasks };
  });

  return sendResponse(res, 200, true, { projects, totalPages, count }, null, "");
});

projectController.getSingleProject = catchAsync(async (req, res, next) => {
  const projectId = req.params.projectId;

  let project = await Project.findById(projectId).populate({
    path: "tasksList",
    populate: {
      path: "assignTo",
      select: "name", // Include the name field of the assignTo user
    },
  });
  if (!project) throw new AppError(404, "Project not found", "Get Single Project Error");

  // Extract the string representation of ObjectIds in tasksList
  const taskName = project.tasksList.map((task) => {
    return {
      name: task.name,
      assignTo: task.assignTo,
    };
  });

  const modifiedProject = {
    ...project.toJSON(),
    tasksList: taskName,
  };

  return sendResponse(res, 200, true, modifiedProject, null, "");
});

projectController.updateProject = catchAsync(async (req, res, next) => {
  const projectId = req.params.projectId;

  const project = await Project.findById(projectId);
  if (!project) throw new AppError(404, "Project not found", "Update Project Error");

  const allows = ["name", "description"];
  allows.forEach((field) => {
    if (req.body[field] !== undefined) {
      project[field] = req.body[field];
    }
  });

  await project.save();
  return sendResponse(res, 200, true, project, null, "Update Project successfully");
});

projectController.deleteProject = catchAsync(async (req, res, next) => {
  const projectId = req.params.projectId;

  const softDeleteProject = await Project.findByIdAndUpdate(projectId, { isDeleted: true }, { new: true });

  if (!softDeleteProject) {
    throw new AppError(404, "Not Found", "Project not found");
  }

  sendResponse(res, 200, true, softDeleteProject, null, "Soft delete project success");
});

projectController.addTask = catchAsync(async (req, res, next) => {
  const projectId = req.params.projectId;
  const taskId = req.params.taskId;

  // Find the project by projectId
  const project = await Project.findById(projectId);
  if (!project) {
    throw new AppError(404, "Not Found", "Project not found");
  }

  // Find the task by taskId
  const task = await Task.findById(taskId);
  if (!task) {
    throw new AppError(404, "Not Found", "Task not found");
  }

  if (task.projectTo && task.projectTo.equals(projectId)) {
    // Remove the task from project
    task.projectTo = null;
    const updatedTask = await task.save();

    // Remove the task ID from the project's tasksList
    const taskIndex = project.tasksList.indexOf(updatedTask._id.toString());
    if (taskIndex !== -1) {
      project.tasksList.splice(taskIndex, 1);
    }
    await project.save();

    return sendResponse(res, 200, true, null, "Task remove successfully");
  } else {
    // Add the task to the project
    task.projectTo = projectId;
    await task.save();

    // Add the task ID to the project's tasksList
    if (!project.tasksList) {
      project.tasksList = []; // Initialize tasksList if not already defined
    }
    project.tasksList.push(taskId);
    await project.save();
    return sendResponse(res, 200, true, null, "Task added to project successfully");
  }
});

module.exports = projectController;
