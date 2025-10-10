const {
  getUploadUrl,
  getAllFiles,
  getFile,
  deleteFile,
} = require("../controller/s3.controller");
const authMiddleware = require("../middleware/auth.Middleware");

const router = require("express").Router();

router.post("/upload-url", authMiddleware, getUploadUrl);
router.get("/", authMiddleware, getAllFiles);
router.get("/:id", getFile);
router.delete("/:id", authMiddleware, deleteFile);

module.exports = router;
