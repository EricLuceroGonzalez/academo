const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Create Schema
const TestSchema = new Schema({
  questions: [
    {
      isEquation: { type: Boolean, required: true },
      equation: { type: String, required: false },
      questionName: {
        type: String,
        required: true,
      },
      question: {
        type: String,
        required: true,
      },
      options: [
        {
          isEquation: { type: Boolean, required: true },
          equation: { type: String, required: false },
          text: { type: String, required: false },
        },
      ],
      answer: {
        isEquation: { type: Boolean, required: true },
        equation: { type: String, required: false },
        text: { type: String, required: false },
      },
      value: {
        type: Number,
        required: true,
        default: 1,
      },
      pts: {
        type: Number,
        required: true,
        default: 0,
      },
    },
  ],
  examDate: {
    type: Date,
    required: false,
  },
  evaluation: { type: String, required: true },
  disabled: { type: Boolean, required: true, default: false },
  description: { type: String, required: true },
  contents: { type: String, required: true },
  instructions: { type: String, required: true },
  testName: { type: String, required: true },
  subject: { type: mongoose.Types.ObjectId, ref: "Course", required: true },
  users: [{ type: mongoose.Types.ObjectId, ref: "User" }],
});

module.exports = Test = mongoose.model("Test", TestSchema);
