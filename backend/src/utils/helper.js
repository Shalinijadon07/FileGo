function formatBytes(bytes) {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

function parseUploadOptions(expiry) {
  let expiresAt = null;

  if (expiry && expiry !== "never") {
    const now = new Date();
    switch (expiry) {
      case "1h":
        expiresAt = new Date(now.getTime() + 60 * 60 * 1000);
        break;
      case "1d":
        expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        break;
      case "7d":
        expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        break;
      case "30d":
        expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        break;
    }
  }

  return expiresAt;
}

module.exports = { formatBytes, parseUploadOptions };
