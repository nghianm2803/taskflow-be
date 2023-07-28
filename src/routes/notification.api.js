const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notification.controller");
const authentication = require("../middlewares/authentication");

/**
@route GET /notifications
@description get all the notification with current user
@body
@access Login required
*/

router.get("/", authentication.loginRequired, notificationController.getAllNotifications);

/**
@route PUT /notifications
@description Read all notifications
@body
@access Login required
*/

router.put("/", authentication.loginRequired, notificationController.readAllNotifications);

/**
@route PUT /notifications/:notificationId
@description update notification as read
@body
@access Login required
*/

router.put("/:notificationId", authentication.loginRequired, notificationController.readNotification);

module.exports = router;
