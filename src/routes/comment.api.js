const express = require("express");
const router = express.Router();
const commentController = require("../controllers/comment.controller");
const { body, param } = require("express-validator");
const validators = require("../middlewares/validators");
const authMiddleware = require("../middlewares/authentication");

/**
 * @route POST api/comment
 * @description Create a new comment
 * @access Login required
 */
router.post(
  "/",
  authMiddleware.loginRequired,
  validators.validate([
    body("content", "Missing content").exists().notEmpty(),
    body("targetType", "Invalid targetType").exists().isIn(["Project", "Task"]),
    body("targetId", "Invalid targetId").exists().custom(validators.checkObjectId),
  ]),
  commentController.createNewComment
);

/**
 * @route PUT api/comments/:commentId
 * @description Update a comment
 * @access Login required
 */
router.put(
  "/:commentId",
  authMiddleware.loginRequired,
  validators.validate([
    param("commentId").exists().isString().custom(validators.checkObjectId),
    body("content", "Missing content").exists().notEmpty(),
  ]),
  commentController.editComment
);

/**
 * @route DELETE api/comment/:commentId
 * @description Delete a comment
 * @access Login required
 */
router.delete(
  "/:commentId",
  authMiddleware.loginRequired,
  validators.validate([param("commentId").exists().isString().custom(validators.checkObjectId)]),
  commentController.deleteComment
);

module.exports = router;
