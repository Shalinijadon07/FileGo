const { downloadFileUrl, getStatsS3 } = require("../controller/s3.controller");
const authMiddleware = require("../middleware/auth.Middleware");

const router = require("express").Router();

router.get("/stats", authMiddleware, getStatsS3);
router.post("/download-url/:id", downloadFileUrl);

module.exports = router;
