const wrapAsync = require("../utils/tryCatchWrapper");
const User = require("../models/user.model");
const jwt = require("jsonwebtoken");
const cookieOptions = require("../config/cookie");
const bcrypt = require("bcrypt");
const { OAuth2Client } = require("google-auth-library");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const login_user = wrapAsync(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ isAuth: false, error: "All fields are required" });
  }

  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    return res
      .status(400)
      .json({ isAuth: false, error: "Invalid credentials" });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res
      .status(400)
      .json({ isAuth: false, error: "Invalid credentials" });
  }

  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });

  res.cookie("authToken", token, { ...cookieOptions, maxAge: 1000 * 60 * 60 });
  const { password: _, ...userData } = user.toObject();

  res.json({ isAuth: true, user: userData });
});

const register_user = wrapAsync(async (req, res) => {
  const { name, email, password, profilePic } = req.body;

  if (!name || !email || !password) {
    return res
      .status(400)
      .json({ isAuth: false, error: "All fields are required" });
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res
      .status(400)
      .json({ isAuth: false, error: "User already exists" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = new User({
    name,
    email,
    password: hashedPassword,
    profilePic,
  });

  const savedUser = await newUser.save();

  const token = jwt.sign({ userId: savedUser._id }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });

  res.cookie("authToken", token, { ...cookieOptions, maxAge: 1000 * 60 * 60 });
  const { password: _, ...userData } = savedUser.toObject();

  res.json({ isAuth: true, user: userData });
});

const logout_user = wrapAsync(async (req, res) => {
  res.clearCookie("authToken", cookieOptions);
  res.json({ isAuth: false });
});

const get_user = wrapAsync(async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ isAuth: false, error: "Unauthorized" });
  }

  res.json({ isAuth: true, user: req.user });
});

const google_auth = async (req, res) => {
  try {
    const { credential } = req.body;
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { email, name, picture } = payload;

    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        name,
        email,
        profilePic: picture,
      });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.cookie("authToken", token, {
      ...cookieOptions,
      maxAge: 1000 * 60 * 60,
    });
    res.json({ isAuth: true, user });
  } catch (error) {
    console.error("Google login error:", error);
    res.status(400).json({ isAuth: false, error: "Invalid Google token" });
  }
};

module.exports = {
  login_user,
  logout_user,
  get_user,
  register_user,
  google_auth,
};
