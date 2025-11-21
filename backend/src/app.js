const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const connectDB = require("./config/connect");
const { errorHandler } = require("./utils/errorHandler");
const { default: mongoose } = require("mongoose");

require("dotenv").config();

const app = express();

app.use(cookieParser());
app.use(express.json());

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use("/api/auth", require("./routes/auth.Router"));
app.use("/api/files", require("./routes/file.Router"));
app.use("/api/", require("./routes/user.File.Router"));

app.use(errorHandler);

connectDB();

app.route("/").get((req, res) => res.status(200).json("Server is running"));
app.route("/check/db").get((req, res) => {
  if (mongoose.connection.readyState === 1) {
    res.status(200).json("Connected to MongoDB");
  } else {
    res.status(500).json("Not connected to MongoDB");
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Server running on port 3000");
});
