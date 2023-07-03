var express = require("express");
var router = express.Router();

/* GET home page. */
router.get("/", function (req, res, next) {
  res.status(200).send("Welcome to Codebase!");
});

/* Auth API */
const authApi = require("./auth.api");
router.use("/auth", authApi);

/* User API */
const userApi = require("./user.api");
router.use("/users", userApi);

/* Project API */
const projectApi = require("./project.api");
router.use("/project", projectApi);

/* Task API */
const taskApi = require("./task.api");
router.use("/task", taskApi);

/* Comment API */
const commentApi = require("./comment.api");
router.use("/comment", commentApi);

module.exports = router;
