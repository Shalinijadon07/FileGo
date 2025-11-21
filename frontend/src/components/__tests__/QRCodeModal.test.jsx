import {
  render,
  screen,
  waitFor,
  fireEvent,
  cleanup,
} from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";
import QRCode from "qrcode";
import { toast } from "react-hot-toast";
import { QRCodeModal } from "../qr-code-modal";

vi.mock("qrcode", () => ({
  default: { toDataURL: vi.fn() },
}));

vi.mock("react-hot-toast", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const openModalProps = {
  isOpen: true,
  onOpenChange: vi.fn(),
  url: "https://example.com/test",
  shortCode: "abc123",
};

describe("QRCodeModal", () => {
  beforeEach(() => {
    cleanup();
    QRCode.toDataURL.mockReset();
    toast.success.mockReset();
    toast.error.mockReset();
    vi.restoreAllMocks();
  });

  test("renders and shows loading initially", () => {
    QRCode.toDataURL.mockResolvedValue("data:image/png;base64,MOCK_QR");
    render(<QRCodeModal {...openModalProps} />);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText(/QR Code/i)).toBeInTheDocument();
  });

  test("shows loading spinner while generating", () => {
    QRCode.toDataURL.mockResolvedValue("data:image/png;base64,MOCK_QR");
    render(<QRCodeModal {...openModalProps} />);
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  test("shows generated QR code after creation", async () => {
    QRCode.toDataURL.mockResolvedValue("data:image/png;base64,MOCK_QR");
    render(<QRCodeModal {...openModalProps} />);
    await waitFor(() =>
      expect(screen.getByAltText("QR Code")).toBeInTheDocument()
    );
  });

  test("download button works", async () => {
    QRCode.toDataURL.mockResolvedValue("data:image/png;base64,MOCK_QR");
    render(<QRCodeModal {...openModalProps} />);

    await waitFor(() =>
      expect(screen.getByAltText("QR Code")).toBeInTheDocument()
    );

    // Use a REAL anchor element to satisfy jsdom
    const realAnchor = document.createElement("a");

    const clickSpy = vi.spyOn(realAnchor, "click").mockImplementation(() => {});
    vi.spyOn(realAnchor, "remove").mockImplementation(() => {});

    // Intercept createElement only for <a>
    vi.spyOn(document, "createElement").mockImplementation((tag) => {
      if (tag === "a") return realAnchor;
      return document.__proto__.createElement.call(document, tag);
    });

    fireEvent.click(screen.getByRole("button", { name: /download/i }));

    expect(clickSpy).toHaveBeenCalled();
    expect(toast.success).toHaveBeenCalledWith("QR Code downloaded");
  });

  test("handles QR generation failure gracefully", async () => {
    QRCode.toDataURL.mockRejectedValue(new Error("QR_FAIL"));
    render(<QRCodeModal {...openModalProps} />);

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith("Failed to generate QR Code")
    );
  });

  test("resets state when modal closes", async () => {
    QRCode.toDataURL.mockResolvedValue("data:image/png;base64,MOCK_QR");

    const { rerender } = render(<QRCodeModal {...openModalProps} />);

    await waitFor(() =>
      expect(screen.getByAltText("QR Code")).toBeInTheDocument()
    );

    rerender(<QRCodeModal {...openModalProps} isOpen={false} />);

    expect(screen.queryByAltText("QR Code")).not.toBeInTheDocument();
  });
});
