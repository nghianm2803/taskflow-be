const { AppError, catchAsync, sendResponse } = require("../helpers/utils");
const mongoose = require("mongoose");
const Comment = require("../models/Comment");

const commentController = {};

commentController.createNewComment = catchAsync(async (req, res, next) => {
  const userId = req.userId;
  const { content, targetType, targetId } = req.body;

  const targetObj = await mongoose.model(targetType).findById(targetId);
  if (!targetObj) throw new AppError(404, `${targetType} not found`, "Add Comment Error");

  let comment = await Comment.create({
    author: userId,
    content,
    targetType,
    targetId: targetObj._id,
  });

  // Update the comments field of the target (project or task)
  targetObj.comments.push(comment._id);
  await targetObj.save();

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
