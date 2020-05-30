const mongoose = require("mongoose");
const Schema = mongoose.Schema; // Create Schema
const UserSchema = new Schema({
  name: {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  identification: {
    type: String,
    required: false,
  },
  subject: { type: mongoose.Types.ObjectId, ref: "Course" },
  date: {
    type: Date,
    default: Date.now,
  },
  testInfo: [
    {
      test: { type: mongoose.Types.ObjectId, ref: "Test" },
      testName: {type: String, required: false},
      allAns: { type: Array, required: false },
      allQuest: { type: Array, required: false },
      allPts: { type: Array, required: false },
      goodAns: { type: Array, required: false },
      goodQuest: { type: Array, required: false },
      totalPts: {
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
    },
  ],
});
module.exports = User = mongoose.model("User", UserSchema);
