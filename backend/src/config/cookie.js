const cookieOptions = {
  httpOnly: true,
  sameSite: "none",
  secure: process.env.NODE_ENV === "production",
  path: "/",
};

module.exports = cookieOptions;
