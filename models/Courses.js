const mongoose = require("mongoose");
const Schema = mongoose.Schema; // Create Schema
const CourseSchema = new Schema({
  courseName: {
    type: String,
    required: true,
  },
  tests: [{ type: mongoose.Types.ObjectId, ref: "Test" }],
  enroll: [{ type: mongoose.Types.ObjectId, ref: "User" }],
});
module.exports = Course = mongoose.model("Course", CourseSchema);
