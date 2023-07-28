const { AppError, catchAsync, sendResponse } = require("../helpers/utils");
const Comment = require("../models/Comment");
const Task = require("../models/Task");
const Notification = require("../models/Notification");

const commentController = {};

commentController.createNewComment = catchAsync(async (req, res, next) => {
  const userId = req.userId;
  const { content, taskId } = req.body;

  const task = await Task.findById(taskId).populate("assignTo").exec(); // Add .exec() at the end
  if (!task) throw new AppError(404, "Task not found", "Create New Comment Error");

  let comment = await Comment.create({
    author: userId,
    task: taskId,
    content,
  });

  comment = await comment.populate("author");

  let notification = null;

  if (task.assignTo && task.assignTo._id.toString() !== userId) {
    notification = await Notification.create({
      recipient: task.assignTo,
      type: "Comment",
      message: `${comment.author.name} commented on ${task.name}`,
      commentId: comment._id,
    });
  }

  // Notify users who previously commented on the task
  const usersCommented = await Comment.distinct("author", { task: taskId, author: { $ne: userId } });
  for (const user of usersCommented) {
    if (user._id.toString() !== task.assignTo._id.toString()) {
      // Avoid duplicate notifications for the assigned user
      notification = await Notification.create({
        recipient: user._id,
        type: "Comment",
        message: `${comment.author.name} commented on a Task you follow ${task.name}`,
        taskId: taskId,
      });
    }
  }

  return sendResponse(res, 200, true, { comment, notification }, null, "Create new comment successful");
});

commentController.editComment = catchAsync(async (req, res, next) => {
  const userId = req.userId;
  const commentId = req.params.commentId;
  const { content } = req.body;

  const comment = await Comment.findOneAndUpdate({ _id: commentId, author: userId }, { content }, { new: true });
  if (!comment) throw new AppError(400, "Comment not found or User not authorized", "Update Comment Error");

  return sendResponse(res, 200, true, comment, null, "Update successful");
});

commentController.deleteComment = catchAsync(async (req, res, next) => {
  const userId = req.userId;
  const commentId = req.params.commentId;

  const comment = await Comment.findOneAndDelete({ _id: commentId, author: userId });
  if (!comment) throw new AppError(400, "Comment not found or User not authorized", "Delete Comment Error");

  return sendResponse(res, 200, true, comment, null, "Delete successful");
});

module.exports = commentController;
