const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Create Schema
const TestsSchema = new Schema({
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
          type: String,
          required: true,
        },
      ],
      answer: {
        type: String,
        required: true,
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
  description: { type: String, required: true },
  instructions: { type: String, required: true },
  testName: { type: String, required: true },
  subject: { type: mongoose.Types.ObjectId, ref: "Course", required: true },
  users: [{ type: mongoose.Types.ObjectId, ref: "User" }],
});

module.exports = Tests = mongoose.model("Tests", TestsSchema);
