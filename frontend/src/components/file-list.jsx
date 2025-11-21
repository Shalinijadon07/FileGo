import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { apiRequest } from "@/lib/api";
import toast from "react-hot-toast";
import { Copy, QrCode } from "lucide-react";
import { QRCodeModal } from "./qr-code-modal";

export default function FileList() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [qrUrl, setQrUrl] = useState("");
  const [qrShortCode, setQrShortCode] = useState("");

  // Fetch files with useEffect
  useEffect(() => {
    let isMounted = true;

    const fetchFiles = async () => {
      try {
        setLoading(true);
        const data = await apiRequest("GET", "/api/files");
        if (isMounted) setFiles(Array.isArray(data) ? data : []);
      } catch (err) {
        toast.error(`Failed to load files: ${err.message}`);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchFiles();

    // Listen for upload events
    const handler = () => fetchFiles();
    document.addEventListener("fileUploaded", handler);

    return () => {
      isMounted = false;
      document.removeEventListener("fileUploaded", handler);
    };
  }, []);

  // Delete file
  const deleteFile = async (id) => {
    setDeleting(id);
    try {
      await apiRequest("DELETE", `/api/files/${id}`);
      setFiles((prev) => prev.filter((file) => file.id !== id));
      toast.success("File deleted successfully");
      document.dispatchEvent(new Event("fileDeleted"));
    } catch (err) {
      toast.error(`Delete failed: ${err.message}`);
    } finally {
      setDeleting(null);
    }
  };

  // Copy link
  const copyLink = (fileId) => {
    const link = `${import.meta.env.VITE_FRONTEND_URL}/download/${fileId}`;
    navigator.clipboard.writeText(link).then(() => {
      toast.success("Download link copied to clipboard");
    });
  };

  // Helpers̥
  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const getTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24)
      return `${diffInHours} hour${diffInHours !== 1 ? "s" : ""} ago`;
    return `${diffInDays} day${diffInDays !== 1 ? "s" : ""} ago`;
  };

  const getExpiryStatus = (expiresAt) => {
    if (!expiresAt)
      return { text: "Never expires", color: "bg-success/10 text-success" };

    const now = new Date();
    const expiry = new Date(expiresAt);
    const diffInMs = expiry.getTime() - now.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMs < 0)
      return { text: "Expired", color: "bg-danger/10 text-danger" };
    if (diffInHours < 24)
      return { text: "Expires today", color: "bg-danger/10 text-danger" };
    if (diffInDays <= 7)
      return {
        text: `Expires in ${diffInDays} day${diffInDays !== 1 ? "s" : ""}`,
        color: "bg-yellow-100 text-yellow-800",
      };

    return { text: "Active", color: "bg-success/10 text-success" };
  };

  const getFileIcon = (mimeType) => {
    if (mimeType.startsWith("image/"))
      return "fas fa-file-image text-green-600";
    if (mimeType.startsWith("video/"))
      return "fas fa-file-video text-purple-600";
    if (mimeType.startsWith("audio/"))
      return "fas fa-file-audio text-orange-600";
    if (mimeType === "application/pdf") return "fas fa-file-pdf text-primary";
    if (mimeType.includes("zip") || mimeType.includes("archive"))
      return "fas fa-file-archive text-gray-600";
    if (mimeType.includes("text")) return "fas fa-file-alt text-blue-600";
    return "fas fa-file text-gray-600";
  };

  const getFileIconBg = (mimeType) => {
    if (mimeType.startsWith("image/")) return "bg-green-100";
    if (mimeType.startsWith("video/")) return "bg-purple-100";
    if (mimeType.startsWith("audio/")) return "bg-orange-100";
    if (mimeType === "application/pdf") return "bg-blue-100";
    if (mimeType.includes("zip") || mimeType.includes("archive"))
      return "bg-gray-100";
    if (mimeType.includes("text")) return "bg-blue-100";
    return "bg-gray-100";
  };

  // Render
  if (loading) {
    return (
      <section className="mb-12">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-gray-900">Recent Uploads</h3>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-gray-600">Loading files...</p>
            </div>
          </CardContent>
        </Card>
      </section>
    );
  }

  if (!files || files.length === 0) {
    return (
      <section className="mb-12">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-gray-900">Recent Uploads</h3>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-upload text-gray-400 text-2xl"></i>
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                No files uploaded yet
              </h4>
              <p className="text-gray-600">
                Upload your first file to get started.
              </p>
            </div>
          </CardContent>
        </Card>
      </section>
    );
  }

  const showQrCode = (file) => {
    const link = `${import.meta.env.VITE_FRONTEND_URL}/download/${file.id}`;

    setQrUrl(link);
    setQrShortCode(file.id);
    setIsQrModalOpen(true);
  };

  return (
    <>
      <section className="mb-12">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-gray-900">Recent Uploads</h3>
        </div>
        <Card>
          <CardContent className="p-0">
            {files.map((file) => {
              const expiryStatus = getExpiryStatus(file.expiresAt);
              return (
                <div
                  key={file.id}
                  className="border-b border-gray-200 last:border-b-0 p-4 sm:p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    {/* File Info */}
                    <div className="flex items-center space-x-3 sm:space-x-4">
                      <div
                        className={`w-10 h-10 sm:w-12 sm:h-12 ${getFileIconBg(
                          file.mimeType
                        )} rounded-lg flex items-center justify-center flex-shrink-0`}
                      >
                        <i
                          className={`${getFileIcon(
                            file.mimeType
                          )} text-lg sm:text-xl`}
                        ></i>
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-medium sm:font-semibold text-gray-900 truncate max-w-[150px] sm:max-w-[250px]">
                          {file.name}
                        </h4>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs sm:text-sm text-gray-500">
                          <span>{formatFileSize(file.size)}</span>
                          <span>{getTimeAgo(file.uploadedAt)}</span>
                          <span className="flex items-center">
                            <i className="fas fa-download mr-1"></i>
                            {file.downloadCount}
                          </span>
                          {file.hasPassword && (
                            <span className="flex items-center">
                              <i className="fas fa-lock mr-1"></i>
                              Protected
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions + Expiry */}
                    <div className="flex items-center justify-between sm:justify-end gap-3">
                      <span
                        className={`px-2 py-0.5 sm:px-3 sm:py-1 text-[10px] sm:text-xs font-medium rounded-full ${expiryStatus.color}`}
                      >
                        {expiryStatus.text}
                      </span>
                      <div className="flex items-center gap-1 sm:gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyLink(file.id)}
                          className="p-1.5 sm:p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                        >
                          <i className="fas fa-link text-sm sm:text-base"></i>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => showQrCode(file)}
                          className="p-1.5 sm:p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                        >
                          <QrCode className="text-sm sm:text-base" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteFile(file.id)}
                          disabled={deleting === file.id}
                          className="p-1.5 sm:p-2 text-gray-400 hover:text-danger hover:bg-red-50"
                        >
                          <i className="fas fa-trash text-sm sm:text-base"></i>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </section>

      {
        <QRCodeModal
          isOpen={isQrModalOpen}
          onOpenChange={setIsQrModalOpen}
          url={qrUrl}
          shortCode={qrShortCode}
        />
      }
    </>
  );
}
