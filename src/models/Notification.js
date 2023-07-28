const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const notificationSchema = Schema(
  {
    recipient: {
      type: Schema.Types.ObjectId,
      ref: "User",
      require: true,
    },
    type: {
      type: String,
      enum: ["Task", "Comment"],
      require: true,
    },
    message: {
      type: String,
      require: true,
    },
    read: {
      type: Boolean,
      default: false,
    },
    taskId: {
      type: Schema.Types.ObjectId,
      ref: "Task",
      default: null,
    },
    commentId: {
      type: Schema.Types.ObjectId,
      ref: "Comment",
      default: null,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamp: true,
  }
);

const Notification = mongoose.model("notifications", notificationSchema);

module.exports = Notification;
