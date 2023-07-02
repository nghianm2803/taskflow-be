const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ProjectSchema = Schema(
  {
    name: { type: String, require: true },
    description: { type: String, require: true },
    tasks: [
      {
        type: Schema.Types.ObjectId,
        ref: "Task",
        default: null,
      },
    ],
    comments: [
      {
        type: Schema.Types.ObjectId,
        ref: "Comment",
        default: null,
      },
    ],
    isDeleted: { type: Boolean, default: false, required: true },
  },
  {
    timeStamp: true,
  }
);

const Project = mongoose.model("Project", ProjectSchema);
module.exports = Project;
