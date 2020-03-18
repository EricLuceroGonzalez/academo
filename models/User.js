const mongoose = require("mongoose");
const Schema = mongoose.Schema; // Create Schema
const UserSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  points: {
    type: Number,
    required: true,
    default: 0
  },
  examDate: {
    type: Date
  }
});
module.exports = User = mongoose.model("users", UserSchema);
