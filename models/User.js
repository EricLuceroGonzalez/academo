const mongoose = require("mongoose");
const Schema = mongoose.Schema; // Create Schema
const UserSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  cedula: {
    type: String,
    required: false,
  },
  subject: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  tests: [{ type: mongoose.Types.ObjectId, ref: "Test" }],
});
module.exports = User = mongoose.model("users", UserSchema);
