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
    required: false
  },
  date: {
    type: Date,
    default: Date.now
  },
  testInfo: [
    {
      points: {
        type: Number,
        required: true,
        default: 0
      },
      grade: {
        type: Number,
        required: true,
        default: 0
      },
      examDate: {
        type: Date,
        required: false
      }
    }
  ]
});
module.exports = User = mongoose.model("users", UserSchema);
