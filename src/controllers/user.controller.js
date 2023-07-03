const { sendResponse, AppError, catchAsync } = require("../helpers/utils.js");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const userController = {};

// Register new user
userController.register = catchAsync(async (req, res, next) => {
  // Get data from request
  let { name, email, password } = req.body;

  // Validate
  let user = await User.findOne({ email });
  if (user) throw new AppError(400, "User already exists", "Register Error");

  // Process
  const salt = await bcrypt.genSalt(10);
  password = await bcrypt.hash(password, salt);
  user = await User.create({ name, email, password });
  const accessToken = await user.generateToken();

  // Response
  sendResponse(res, 200, true, { user, accessToken }, null, "Create User Successful");
});

userController.getUsers = catchAsync(async (req, res, next) => {
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

  const count = await User.countDocuments(filterCrireria);
  const totalPages = Math.ceil(count / limit);
  const offset = limit * (page - 1);

  let users = await User.find(filterCrireria).sort({ createdAt: -1 }).skip(offset).limit(limit).populate("tasksList");

  // Extract the task names from the populated tasksList field
  users = users.map((user) => {
    const tasks = user.tasksList.map((task) => task.name);
    return { ...user.toJSON(), tasksList: tasks };
  });

  return sendResponse(res, 200, true, { users, totalPages, count }, null, "");
});

userController.getCurrentUser = catchAsync(async (req, res, next) => {
  const userId = req.userId;

  const user = await User.findById(userId).populate("tasksList");
  if (!user) throw new AppError(400, "User not found", "Get Current User Error");

  // Extract the string representation of ObjectIds in tasksList
  const taskAssigned = user.tasksList.map((task) => task.name);

  const modifiedUser = {
    ...user.toJSON(),
    tasksList: taskAssigned,
  };

  return sendResponse(res, 200, true, modifiedUser, null, "Get current user successful");
});

userController.getSingleUser = catchAsync(async (req, res, next) => {
  const userId = req.params.id;

  let user = await User.findById(userId).populate("tasksList");
  if (!user) throw new AppError(404, "User not found", "Get Single User Error");

  // Extract the string representation of ObjectIds in tasksList
  const taskAssigned = user.tasksList.map((task) => task.name);

  const modifiedUser = {
    ...user.toJSON(),
    tasksList: taskAssigned,
  };

  return sendResponse(res, 200, true, modifiedUser, null, "");
});

userController.updateProfile = catchAsync(async (req, res, next) => {
  const currentUserId = req.userId;
  const userId = req.params.id;
  let { password } = req.body;

  // console.log("Compare:", currentUserId, "vs", userId);
  if (currentUserId !== userId) throw new AppError(400, "Permission required", "Update User Error");

  const user = await User.findById(userId);
  if (!user) throw new AppError(404, "Account not found", "Update Profile Error");

  const allows = ["name", "password", "avatar", "role"];

  allows.forEach((field) => {
    if (req.body[field] !== undefined) {
      if (field === "password") {
        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = bcrypt.hashSync(password, salt);
        user[field] = hashedPassword;
      } else {
        user[field] = req.body[field];
      }
    }
  });

  await user.save();
  return sendResponse(res, 200, true, user, null, "Update Profile successfully");
});

module.exports = userController;
