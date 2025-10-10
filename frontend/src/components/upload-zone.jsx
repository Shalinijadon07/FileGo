import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { apiRequest } from "@/lib/api";
import toast from "react-hot-toast";
import ShareModal from "./share-model";

export default function UploadZone() {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [expiry, setExpiry] = useState("7d");
  const [password, setPassword] = useState("");
  const [uploadedFile, setUploadedFile] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback((acceptedFiles) => {
    const maxSize = 2 * 1024 * 1024 * 1024; // 2GB
    const validFiles = acceptedFiles.filter((file) => {
      if (file.size > maxSize) {
        toast.error(`${file.name} exceeds the 2GB limit.`);
        return false;
      }
      return true;
    });
    setSelectedFiles(validFiles);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
  });

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFiles.length) {
      toast.error("No files selected. Please choose a file.");
      return;
    }

    setIsUploading(true);

    try {
      const file = selectedFiles[0];

      // Step 1: Get presigned upload URL
      const {
        id,
        uploadUrl,
        file: fileMeta,
      } = await apiRequest("post", "/api/files/upload-url", {
        name: file.name,
        type: file.type,
        size: file.size,
        expiresAt: expiry,
        password: password || undefined,
      });

      if (!uploadUrl) {
        toast.error("Failed to get upload URL");
      }

      // Step 2: Upload directly to S3
      await fetch(uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type": file.type,
        },
        body: file,
      });

      // Step 3: Construct share URL
      const shareUrl = `${import.meta.env.VITE_FRONTEND_URL}/download/${id}`;

      setUploadedFile({ file: fileMeta, shareUrl });
      setShowShareModal(true);
      setSelectedFiles([]);
      setPassword("");
      toast.success("Upload successful! Your file is ready to share.");
      document.dispatchEvent(new Event("fileUploaded"));
    } catch (error) {
      toast.error(`Upload failed: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  return (
    <>
      <section className="mb-12">
        {/* Dropzone */}
        {selectedFiles.length === 0 ? (
          <div
            {...getRootProps()}
            className={`bg-white rounded-xl shadow-sm border-2 border-dashed transition-colors 
    p-6 sm:p-8 md:p-10 text-center cursor-pointer
    ${
      isDragActive
        ? "border-primary bg-blue-50"
        : "border-gray-300 hover:border-primary"
    }`}
          >
            <input {...getInputProps()} />
            <div className="mx-auto w-12 h-12 sm:w-14 sm:h-14 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <i className="fas fa-cloud-upload-alt text-xl sm:text-2xl text-gray-400"></i>
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-1">
              {isDragActive ? "Drop your file here" : "Drop your file here"}
            </h3>
            <p className="text-sm text-gray-600 mb-4 sm:mb-6">
              or click to browse from your device
            </p>
            <div className="flex flex-wrap justify-center gap-3 sm:gap-4 text-xs sm:text-sm text-gray-500">
              <span className="flex items-center">
                <i className="fas fa-check text-success mr-1 sm:mr-2"></i>Max
                2GB per file
              </span>
              <span className="flex items-center">
                <i className="fas fa-check text-success mr-1 sm:mr-2"></i>All
                file types supported
              </span>
              <span className="flex items-center">
                <i className="fas fa-check text-success mr-1 sm:mr-2"></i>Secure
                encryption
              </span>
            </div>
          </div>
        ) : (
          <Card className="mt-4 shadow-sm">
            <CardContent className="pt-6">
              <h4 className="font-semibold text-gray-900 mb-4">
                Selected Files
              </h4>
              {selectedFiles.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg mb-2"
                >
                  <div className="flex items-center space-x-3">
                    <i className="fas fa-file text-gray-400"></i>
                    <div>
                      <p className="font-medium text-gray-900">{file.name}</p>
                      <p className="text-sm text-gray-500">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setSelectedFiles((files) =>
                        files.filter((_, i) => i !== index)
                      )
                    }
                  >
                    <i className="fas fa-times"></i>
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Upload Options */}
        <Card className="mt-6 bg-gray-50 shadow-2xs">
          <CardContent className="pt-6">
            <h4 className="font-semibold text-gray-900 mb-4">Upload Options</h4>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="expiry" className="mb-2 block">
                  Expiry Date
                </Label>
                <Select value={expiry} onValueChange={setExpiry}>
                  <SelectTrigger id="expiry" className="w-full bg-white">
                    <SelectValue placeholder="Select expiry" />
                  </SelectTrigger>
                  <SelectContent className="w-[var(--radix-select-trigger-width)]">
                    <SelectItem value="1h">1 hour</SelectItem>
                    <SelectItem value="1d">1 day</SelectItem>
                    <SelectItem value="7d">7 days</SelectItem>
                    <SelectItem value="30d">30 days</SelectItem>
                    <SelectItem value="never">Never</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="fileKey" className="mb-2 block">
                  Password Protection
                </Label>
                <Input
                  id="fileKey"
                  type="password"
                  placeholder="Optional password"
                  value={password}
                  autoComplete="username"
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white"
                />
              </div>
            </div>

            {/* Upload button */}
            <div className="mt-6 flex justify-between items-center">
              <div className="text-sm text-gray-500">
                {selectedFiles.length} file
                {selectedFiles.length !== 1 ? "s" : ""} selected
              </div>
              <Button
                onClick={handleUpload}
                disabled={selectedFiles.length === 0 || isUploading}
              >
                {isUploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Uploading...
                  </>
                ) : (
                  "Upload Files"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Share Modal */}
      {uploadedFile && (
        <ShareModal
          isOpen={showShareModal}
          onClose={() => {
            setShowShareModal(false);
            setUploadedFile(null);
          }}
          uploadedFile={uploadedFile}
        />
      )}
    </>
  );
}
