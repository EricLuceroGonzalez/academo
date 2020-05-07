const mongoose = require("mongoose");
const Schema = mongoose.Schema; // Create Schema
const TestSchema = new Schema({
  questionName: {
    type: String,
    required: true,
  },
  question: {
    type: String,
    required: true,
  },
  values: [
    {
      type: String,
      required: true,
    },
  ],
  selected: {
    type: String,
    required: false,
    default: "",
  },
  answer: {
    type: String,
    required: true,
  },
  pts: {
    type: Number,
    required: true,
    default: 0,
  },
  grade: {
    type: Number,
    required: true,
    default: 0,
  },
  examDate: {
    type: Date,
    required: false,
  },
  users: [{ type: mongoose.Types.ObjectId, ref: "User" }],
});

module.exports = Test = mongoose.model("tests", TestSchema);
