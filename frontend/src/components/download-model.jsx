import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function DownloadModal({
  isOpen,
  onClose,
  onDownload,
  isLoading,
}) {
  const [password, setPassword] = useState("");

  const handleDownload = () => {
    onDownload(password);
    setPassword("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader className="text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-lock text-primary text-2xl"></i>
          </div>
          <DialogTitle className="text-xl">Protected File</DialogTitle>
          <p className="text-gray-600 mt-2">
            This file is password protected. Enter the password to download.
          </p>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              autoFocus
              id="password"
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleDownload()}
              className="mt-2"
            />
          </div>

          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDownload}
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Downloading...
                </>
              ) : (
                "Download"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
