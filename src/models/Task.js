const mongoose = require("mongoose");
//Create schema
const TaskSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    status: {
      type: String,
      enum: ["Pending", "Working", "Review", "Done"],
      default: "Pending",
      required: true,
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Low",
      required: true,
    },
    assignTo: { type: mongoose.SchemaTypes.ObjectId, ref: "User" }, //one to one optional
    projectTo: { type: mongoose.SchemaTypes.ObjectId, ref: "Project" },
    deadline: { type: Date, required: true },
    isDeleted: { type: Boolean, default: false, required: true },
  },
  {
    timestamps: true,
  }
);

//Create and export model
const Task = mongoose.model("Task", TaskSchema);

module.exports = Task;