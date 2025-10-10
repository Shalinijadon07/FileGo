const router = require("express").Router();
const {
  login_user,
  logout_user,
  get_user,
  register_user,
  google_auth,
} = require("../controller/auth.controller");
const authMiddleware = require("../middleware/auth.Middleware");

router.post("/login", login_user);
router.post("/register", register_user);
router.post("/google", google_auth);
router.get("/logout", logout_user);
router.get("/user", authMiddleware, get_user);

module.exports = router;
