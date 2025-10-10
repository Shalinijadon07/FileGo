const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    unique: true,
  },
  password: {
    type: String,
    select: false,
  },
  profilePic: {
    type: String,
    default: null,
  },
});

const User = mongoose.model("User", UserSchema);

module.exports = User;
