const { mongoose } = require("mongoose");

const FileSchema = new mongoose.Schema(
  {
    originalName: {
      type: String,
      required: true,
    },
    s3Key: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      required: true,
    },
    uuid: {
      type: String,
      required: true,
    },
    uploader: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
    password: {
      type: String,
    }, // optional password
    expiresAt: {
      type: Date,
      index: { expires: 0 },
    }, // TTL index for auto-delete
    downloadCount: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const File = mongoose.model("File", FileSchema);
module.exports = File;
