const mongoose = require("mongoose");
require("dotenv").config();

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
  } catch (err) {
    process.exit(1);
  }
}

module.exports = connectDB;
