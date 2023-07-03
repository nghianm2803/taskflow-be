const express = require("express");
const router = express.Router();
const commentController = require("../controllers/comment.controller");
const { body, param } = require("express-validator");
const validators = require("../middlewares/validators");
const authMiddleware = require("../middlewares/authentication");

/**
 * @route POST api/comments
 * @description Create a new comment
 * @access Login required
 */
// router.post(
//   "/",
//   authMiddleware.loginRequired,
//   validators.validate([
//     body("content", "Missing content").exists().notEmpty(),
//     // body("postId", "Missing postId").exists().isString().custom(validators.checkObjectId),
//   ]),
//   commentController.createNewComment
// );

/**
 * @route PUT api/comments/:id
 * @description Update a comment
 * @access Login required
 */
// router.put(
//   "/:id",
//   authMiddleware.loginRequired,
//   validators.validate([
//     param("id").exists().isString().custom(validators.checkObjectId),
//     body("content", "Missing content").exists().notEmpty(),
//   ]),
//   commentController.updateSingleComment
// );

/**
 * @route DELETE api/comments/:id
 * @description Delete a comment
 * @access Login required
 */
// router.delete(
//   "/:id",
//   authMiddleware.loginRequired,
//   validators.validate([param("id").exists().isString().custom(validators.checkObjectId)]),
//   commentController.deleteSingleComment
// );

module.exports = router;
