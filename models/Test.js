const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Create Schema
const TestSchema = new Schema({
  questions: [
    {
      image: {type: String, required: false },
      isEquation: { type: Boolean, required: true, default: false },
      isInline: { type: Boolean, required: true, default: true },
      equation: { type: String, required: false },
      questionName: {
        type: String,
        required: true,
      },
      question: {
        type: String,
        required: true,
      },
      answer: {
        isEquation: { type: Boolean, required: true, default: false },
        equation: { type: String, required: false },
        text: { type: String, required: false },
      },
      value: {
        type: Number,
        // required: true,
        default: 1,
      },
      pts: {
        type: Number,
        // required: true,
        default: 0,
      },
      options: [
        {
          isEquation: { type: Boolean, required: true, default: false },
          isInline: { type: Boolean, required: true, default: true },
          equation: { type: String, required: false },
          text: { type: String, required: false },
        },
      ],
    },
  ],
  examDate: {
    type: Date,
    required: false,
  },
  evaluation: { type: String, required: true },
  disabled: { type: Boolean, required: true, default: true },
  uploadDate: { type: Date, required: true, default: Date.now },
  description: { type: String, required: true },
  contents: { type: String, required: true },
  instructions: { type: String, required: true },
  testName: { type: String, required: true },
  subject: { type: mongoose.Types.ObjectId, ref: "Course", required: true },
  users: [{ type: mongoose.Types.ObjectId, ref: "User" }],
});

module.exports = Test = mongoose.model("Test", TestSchema);
