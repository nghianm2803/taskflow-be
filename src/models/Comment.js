const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const commentSchema = Schema(
  {
    author: { type: Schema.ObjectId, required: true, ref: "User" },
    content: { type: String, required: true },
    task: { type: Schema.ObjectId, required: true, ref: "Task" },
  },
  { timestamps: true }
);

const Comment = mongoose.model("Comment", commentSchema);
module.exports = Comment;
