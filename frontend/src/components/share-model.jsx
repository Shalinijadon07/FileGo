import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import toast from "react-hot-toast";

export default function ShareModal({ isOpen, onClose, uploadedFile }) {
  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const copyToClipboard = () => {
    navigator.clipboard
      .writeText(uploadedFile.shareUrl)
      .then(() => {
        toast.success("Link copied to clipboard!");
      })
      .catch(() => {
        toast.error("Failed to copy link");
      });
  };

  const shareViaEmail = () => {
    const subject = encodeURIComponent(
      `File shared: ${uploadedFile.file.name}`
    );
    const body = encodeURIComponent(
      `I've shared a file with you using FileGo.\n\nFile: ${
        uploadedFile.file.name
      }\nSize: ${formatFileSize(uploadedFile.file.size)}\n\nDownload link: ${
        uploadedFile.shareUrl
      }\n\n${
        uploadedFile.file.hasPassword ? "This file is password protected." : ""
      }`
    );
    window.open(`mailto:?subject=${subject}&body=${body}`);
    toast("Opened your email client to share the file");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-check text-green-600 text-2xl"></i>
          </div>
          <DialogTitle className="text-xl">
            File Uploaded Successfully!
          </DialogTitle>
          <p className="text-gray-600 mt-2">
            Your file is ready to share. Use the link below:
          </p>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="shareLink">Share Link</Label>
            <div className="flex mt-2">
              <Input
                autoFocus
                id="shareLink"
                type="text"
                readOnly
                value={uploadedFile.shareUrl}
                className="flex-1 rounded-r-none bg-gray-50"
              />
              <Button
                onClick={copyToClipboard}
                className="rounded-l-none"
                type="button"
              >
                <i className="fas fa-copy"></i>
              </Button>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">File Details</h4>
            <div className="space-y-1 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>File name:</span>
                <span className="font-medium">{uploadedFile.file.name}</span>
              </div>
              <div className="flex justify-between">
                <span>File size:</span>
                <span className="font-medium">
                  {formatFileSize(uploadedFile.file.size)}
                </span>
              </div>
              {uploadedFile.file.expiry && (
                <div className="flex justify-between">
                  <span>Expires:</span>
                  <span className="font-medium">
                    {uploadedFile.file.expiry}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Password protected:</span>
                <span className="font-medium">
                  {uploadedFile.file.hasPassword ? "Yes" : "No"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex space-x-3">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Close
            </Button>
            <Button onClick={shareViaEmail} className="flex-1">
              Share via Email
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
