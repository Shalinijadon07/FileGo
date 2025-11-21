import { useCallback, useEffect, useState } from "react";
import QRCode from "qrcode";
import { toast } from "react-hot-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Download } from "lucide-react";

export function QRCodeModal({ isOpen, onOpenChange, url, shortCode }) {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Reset QR when closed
  useEffect(() => {
    if (!isOpen) {
      setQrCodeDataUrl(null);
      setIsGenerating(false);
    }
  }, [isOpen]);

  const generateQRCode = useCallback(async () => {
    if (!url) return;
    setIsGenerating(true);

    try {
      const dataUrl = await QRCode.toDataURL(url, {
        width: 320,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#ffffff",
        },
      });

      setQrCodeDataUrl(dataUrl);
    } catch (error) {
      console.error("QR Generation Error:", error);
      toast.error("Failed to generate QR Code");
    } finally {
      setIsGenerating(false);
    }
  }, [url]);

  // Generate only when modal is opened
  useEffect(() => {
    if (isOpen && url && !qrCodeDataUrl) {
      generateQRCode();
    }
  }, [isOpen, url, qrCodeDataUrl, generateQRCode]);

  const downloadQRCode = () => {
    if (!qrCodeDataUrl) return;

    const link = document.createElement("a");
    link.href = qrCodeDataUrl;
    link.download = shortCode ? `qr-${shortCode}.png` : "qr-code.png";

    document.body.appendChild(link);
    link.click();
    link.remove();

    toast.success("QR Code downloaded");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" aria-describedby="qr-description">
        <DialogHeader>
          <DialogTitle>QR Code</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center p-4">
          {/* Loading State */}
          {isGenerating && (
            <div className="flex items-center justify-center w-[300px] h-[300px]">
              <div
                role="status"
                className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent"
              />
            </div>
          )}

          {/* Display QR Code */}
          {!isGenerating && qrCodeDataUrl && (
            <div className="flex flex-col items-center gap-4">
              <img
                src={qrCodeDataUrl}
                alt="QR Code"
                width={300}
                height={300}
                className="border rounded-md shadow-sm"
              />

              <p
                className="text-sm text-center text-muted-foreground"
                id="qr-description"
              >
                Scan with your device to open the link.
              </p>

              <Button onClick={downloadQRCode} className="w-full">
                <Download className="size-4 mr-2" />
                Download QR Code
              </Button>
            </div>
          )}

          {/* Fallback */}
          {!isGenerating && !qrCodeDataUrl && (
            <p className="text-muted-foreground">Unable to generate QR code.</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
