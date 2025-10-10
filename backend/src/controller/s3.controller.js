const {
  PutObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
} = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const { randomUUID } = require("crypto");
const s3 = require("../config/s3");
const File = require("../models/file.model");
const wrapAsync = require("../utils/tryCatchWrapper");
const { formatBytes, parseUploadOptions } = require("../utils/helper");

const getUploadUrl = wrapAsync(async (req, res) => {
  const { name, type, size, expiresAt: expiry, password } = req.body;
  const uuid = randomUUID();
  const s3Key = `${req.user._id}/${uuid}-${name}`;

  // Generate presigned URL
  const command = new PutObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: s3Key,
    ContentType: type,
  });
  const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 60 });

  // Parse expiry date
  const parsedExpiry = parseUploadOptions(expiry);

  // Save file record in DB
  const file = await File.create({
    originalName: name,
    s3Key,
    size,
    uuid,
    uploader: req.user._id,
    mimeType: type,
    password,
    expiresAt: parsedExpiry,
  });

  const returnObj = {
    id: file.uuid,
    uploadUrl,
    file: {
      name: file.originalName,
      size: file.size,
      expiry: expiry,
      hasPassword: Boolean(file.password),
    },
  };

  res.json(returnObj);
});

const downloadFileUrl = wrapAsync(async (req, res) => {
  const { id } = req.params;
  const { password } = req.body || {};

  // Check if file exists
  const file = await File.findOne({ uuid: id, isActive: true });
  if (!file) {
    return res.status(404).json({ error: "File not found" });
  }

  // Check password
  if (file.password) {
    if (!password) {
      return res.status(401).json({ error: "Password required" });
    }
    if (file.password !== password) {
      return res.status(401).json({ error: "Invalid password" });
    }
  }

  // increment download count
  file.downloadCount = (file.downloadCount || 0) + 1;
  await file.save();

  const command = new GetObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: file.s3Key,
    ResponseContentDisposition: `attachment; filename="${file.originalName}"`,
    ResponseContentType: file.mimeType,
  });

  const downloadUrl = await getSignedUrl(s3, command, { expiresIn: 60 });

  res.json({ downloadUrl });
});

const getStatsS3 = wrapAsync(async (req, res) => {
  const userId = req.user._id;

  // MongoDB counts
  const totalUploads = await File.countDocuments({ uploader: userId });
  const activeFiles = await File.countDocuments({
    uploader: userId,
    isActive: true,
  });

  const downloadAgg = await File.aggregate([
    { $match: { uploader: userId } },
    { $group: { _id: null, totalDownloads: { $sum: "$downloadCount" } } },
  ]);
  const totalDownloads = downloadAgg[0]?.totalDownloads || 0;

  // S3 storage usage for this user
  let continuationToken = undefined;
  let totalBytes = 0;

  do {
    const command = new ListObjectsV2Command({
      Bucket: process.env.AWS_BUCKET_NAME,
      Prefix: `${userId}/`,
      ContinuationToken: continuationToken,
    });
    const response = await s3.send(command);

    if (response.Contents) {
      response.Contents.forEach((obj) => {
        totalBytes += obj.Size;
      });
    }

    continuationToken = response.NextContinuationToken;
  } while (continuationToken);

  const storageUsed = formatBytes(totalBytes);

  res.json({
    totalUploads,
    totalDownloads,
    activeFiles,
    storageUsed,
  });
});

// Get all files (only user's active files)
const getAllFiles = wrapAsync(async (req, res) => {
  const files = await File.find({
    uploader: req.user._id,
    isActive: true,
  }).sort({ createdAt: -1 });

  res.json(
    files.map((file) => ({
      id: file.uuid,
      name: file.originalName,
      size: file.size,
      mimeType: file.mimeType,
      downloadCount: file.downloadCount,
      uploadedAt: file.createdAt,
      expiresAt: file.expiresAt,
      hasPassword: Boolean(file.password),
      isActive: file.isActive,
    }))
  );
});

// Soft delete file (mark inactive)
const deleteFile = wrapAsync(async (req, res) => {
  const { id } = req.params;

  const file = await File.findOne({ uuid: id });
  if (!file) {
    return res.status(404).json({ error: "File not found" });
  }

  if (!file.uploader.equals(req.user._id)) {
    return res.status(403).json({ error: "Unauthorized" });
  }

  file.isActive = false;
  await file.save();

  res.json({ message: "File deleted successfully" });
});

// Get single file (only active & owned by user)
const getFile = wrapAsync(async (req, res) => {
  const { id } = req.params;

  const file = await File.findOne({
    uuid: id,
    isActive: true,
  });
  if (!file) {
    return res.status(404).json({ error: "File not found" });
  }

  res.json({
    id: file.uuid,
    name: file.originalName,
    size: file.size,
    mimeType: file.mimeType,
    downloadCount: file.downloadCount,
    uploadedAt: file.createdAt,
    expiresAt: file.expiresAt,
    hasPassword: Boolean(file.password),
    isActive: file.isActive,
  });
});

module.exports = {
  getUploadUrl,
  downloadFileUrl,
  getStatsS3,
  getAllFiles,
  deleteFile,
  getFile,
};
