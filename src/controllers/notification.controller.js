const Notification = require("../models/Notification");
const { sendResponse, AppError, catchAsync } = require("../helpers/utils");

const notificationController = {};

// get all notifications
notificationController.getAllNotifications = catchAsync(async (req, res, next) => {
  const currentUserId = req.userId;
  let { limit, page } = req.query;
  // Get limit and skip values from query parameters

  limit = parseInt(limit) || 10;
  page = parseInt(page) || 1;
  const offset = limit * (page - 1);

  const notifications = await Notification.find({ recipient: currentUserId })
    .sort({ createdAt: -1 })
    .skip(offset)
    .limit(limit);

  const count = await Notification.countDocuments({ recipient: currentUserId });
  const totalPage = Math.ceil(count / limit);

  if (!notifications) {
    throw new AppError(400, "Notifications not found", "Get notification error");
  }

  return sendResponse(res, 200, true, { notifications, totalPage, count }, null, "Get notification successful");
});

notificationController.readAllNotifications = catchAsync(async (req, res, next) => {
  const currentUserId = req.userId;

  const updatedNotifications = await Notification.updateMany(
    {
      recipient: currentUserId,
      read: false,
    },
    {
      read: true,
    }
  );

  if (!updatedNotifications) {
    throw new AppError(400, "Failed to mark read all notifications", "Mark Read All Notifications Error");
  }

  return sendResponse(res, 200, true, null, null, "Mark Read All Notification Successful");
});

notificationController.readNotification = catchAsync(async (req, res, next) => {
  const currentUserId = req.userId;
  const notificationId = req.params.notificationId;

  const notification = await Notification.findOneAndUpdate(
    {
      _id: notificationId,
      recipient: currentUserId,
      read: false,
    },
    {
      read: true,
    },
    { new: true }
  );

  return sendResponse(res, 200, true, notification, null, "Mark Read Notification Successful");
});

notificationController.getNewNotifications = catchAsync(async (req, res, next) => {
  const currentUserId = req.userId;

  const newNotifications = await Notification.find({
    recipient: currentUserId,
    read: false,
  });
  const count = newNotifications.length;

  return sendResponse(res, 200, true, { count, newNotifications }, null, "Get New Notifications Successful");
});

module.exports = notificationController;
