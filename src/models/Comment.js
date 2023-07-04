const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const commentSchema = Schema(
  {
    author: { type: Schema.ObjectId, required: true, ref: "User" },
    content: { type: String, required: true },
    targetType: { type: String, required: true, enum: ["Project", "Task"] },
    targetId: { type: Schema.ObjectId, required: true, refPath: "targetType" },
  },
  { timestamps: true }
);

const Comment = mongoose.model("Comment", commentSchema);
module.exports = Comment;
