const { AppError, catchAsync, sendResponse } = require("../helpers/utils");
const mongoose = require("mongoose");
const Comment = require("../models/Comment");
const Project = require("../models/Project");
const Task = require("../models/Task");

const commentController = {};

commentController.createNewComment = catchAsync(async (req, res, next) => {
  const userId = req.userId;
  const { targetType, targetId, content } = req.body;

  const targetObj = await mongoose.model(targetType).findById(targetId);
  if (!targetObj) throw new AppError(404, `${targetType} not found`, "Add Comment Error");

  let comment = await Comment.create({
    author: userId,
    target: targetObj._id,
    content,
  });
  comment = await comment.populate("author").execPopulate();
  // comment = await comment.populate("author");

  return sendResponse(res, 200, true, comment, null, "Create new comment successful");
});

// commentController.getSingleComment = catchAsync(async (req, res, next) => {
//   let comment = await Comment.findById(req.params.id).populate("author");

//   if (!comment) throw new AppError(404, "Comment not found", "Get Single Comment Error");

//   return sendResponse(res, 200, true, comment, null, null);
// });

// commentController.updateSingleComment = catchAsync(async (req, res, next) => {
//   const userId = req.userId;
//   const commentId = req.params.id;
//   const { content } = req.body;

//   const comment = await Comment.findOneAndUpdate({ _id: commentId, author: userId }, { content }, { new: true });
//   if (!comment) throw new AppError(400, "Comment not found or User not authorized", "Update Comment Error");

//   return sendResponse(res, 200, true, comment, null, "Update successful");
// });

// commentController.deleteSingleComment = catchAsync(async (req, res, next) => {
//   const userId = req.userId;
//   const commentId = req.params.id;

//   const comment = await Comment.findOneAndDelete({
//     _id: commentId,
//     author: userId,
//   });
//   if (!comment) throw new AppError(400, "Comment not found or User not authorized", "Delete Comment Error");
//   await calculateCommentCount(comment.post);

//   return sendResponse(res, 200, true, comment, null, "Delete successful");
// });

module.exports = commentController;
