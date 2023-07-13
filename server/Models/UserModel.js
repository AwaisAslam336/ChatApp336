let mongoose = require("mongoose");
let validator = require("validator");

let userSchema = new mongoose.Schema({
  username: String,
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    validate: (value) => {
      return validator.isEmail(value);
    },
  },
  password: {
    type: String,
    required: true,
    trim: true,
  },
  pic: {
    type: String,
    default:
      "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg",
  },
  refreshToken: String,
});

module.exports = mongoose.model("User", userSchema);
