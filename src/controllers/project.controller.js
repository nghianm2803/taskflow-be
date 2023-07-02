const { sendResponse, AppError, catchAsync } = require("../helpers/utils.js");
const Project = require("../models/Project");
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

// projectController.getProjects = catchAsync(async (req, res, next) => {});

// projectController.getSingleProject = catchAsync(async (req, res, next) => {});

// projectController.updateProject = catchAsync(async (req, res, next) => {});

// projectController.deleteProject = catchAsync(async (req, res, next) => {});

module.exports = projectController;
