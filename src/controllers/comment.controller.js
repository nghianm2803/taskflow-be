const { AppError, catchAsync, sendResponse } = require("../helpers/utils");
const Comment = require("../models/Comment");
const Task = require("../models/Task");

const commentController = {};

commentController.createNewComment = catchAsync(async (req, res, next) => {
  const userId = req.userId;
  const { content, taskId } = req.body;

  const task = Task.findById(taskId);
  if (!task) throw new AppError(404, "Task not found", "Create New Comment Error");

  let comment = await Comment.create({
    author: userId,
    task: taskId,
    content,
  });

  await calculateCommentCount(taskId);
  comment = await comment.populate("author");

  return sendResponse(res, 200, true, comment, null, "Create new comment successful");
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
