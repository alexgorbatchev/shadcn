import { describe, expect, test } from "vitest";
import { BracesIcon, FileIcon, ImageIcon, MusicIcon, VideoIcon } from "lucide-react";
import {
  formatFileSize,
  getBase64Size,
  getDataUrlSize,
  getFileHref,
  getFileLabel,
  getMimeTypeIcon,
} from "../fileUtils.js";

describe("file sources", () => {
  test("turns raw base64 into a typed downloadable source", () => {
    expect(getFileHref("SGVsbG8=", "text/plain")).toBe("data:text/plain;base64,SGVsbG8=");
  });
  test("keeps actual URL sources and refuses opaque ids", () => {
    expect(getFileHref("https://example.com/report.pdf", "application/pdf", "url")).toBe(
      "https://example.com/report.pdf",
    );
    expect(getFileHref("attachment-123", "application/pdf", "id")).toBeNull();
    expect(getFileHref("attachment-123", "application/pdf", "url")).toBeNull();
  });
  test("rejects executable or malformed sources", () => {
    expect(getFileHref("javascript:alert(1)", "text/plain")).toBeNull();
    expect(getFileHref("data:text/plain", "text/plain")).toBeNull();
  });
  test("recognizes encoded sources even when native metadata labels them as URLs", () => {
    expect(getFileHref("data:text/plain;base64,YQ==", "text/plain", "url")).toBe("data:text/plain;base64,YQ==");
    expect(getFileHref("blob:https://example.com/asset", "image/png")).toBe("blob:https://example.com/asset");
  });
  test("chooses the actual native glyph from the supplied MIME", () => {
    expect(getMimeTypeIcon("IMAGE/PNG")).toBe(ImageIcon);
    expect(getMimeTypeIcon("application/json")).toBe(BracesIcon);
    expect(getMimeTypeIcon("audio/wav")).toBe(MusicIcon);
    expect(getMimeTypeIcon("video/webm")).toBe(VideoIcon);
    expect(getMimeTypeIcon("application/octet-stream")).toBe(FileIcon);
  });
});

describe("file metadata", () => {
  test("counts decoded bytes with padding, whitespace and invalid input", () => {
    expect(getBase64Size("S GVs\nbG8=")).toBe(5);
    expect(getBase64Size("YQ==")).toBe(1);
    expect(getBase64Size("?")).toBe(0);
    expect(getBase64Size("A")).toBe(0);
    expect(getBase64Size("YQ=")).toBe(0);
  });
  test("counts percent encoded bytes without requiring UTF8", () => {
    expect(getDataUrlSize("data:application/octet-stream,%FF%00a#fragment")).toBe(3);
    expect(getDataUrlSize("data:text/plain;base64,SGVsbG8%3D")).toBe(5);
    expect(getDataUrlSize("data:text/plain,é")).toBe(2);
    expect(getDataUrlSize("data:text/plain")).toBe(0);
    expect(getDataUrlSize("data:text/plain#fragment,ignored")).toBe(0);
    expect(getDataUrlSize("data:text/plain;base64,SGVs\nbG8=")).toBe(5);
    expect(getDataUrlSize("data:text/plain;base64,YQ==")).toBe(1);
  });
  test("derives human readable MIME labels and byte units", () => {
    expect(getFileLabel("text/plain;charset=utf-8")).toBe("Text file");
    expect(getFileLabel("application/vnd.example+json")).toBe("EXAMPLE file");
    expect(getFileLabel("application/octet-stream")).toBe("File");
    expect(getFileLabel("not-a-mime-type")).toBe("File");
    expect(getFileLabel("application/x-ndjson")).toBe("NDJSON file");
    expect(formatFileSize(512)).toBe("512 B");
    expect(formatFileSize(1536)).toBe("1.5 KB");
    expect(formatFileSize(1572864)).toBe("1.5 MB");
  });
});
