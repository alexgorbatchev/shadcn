import { afterEach, assert, describe, expect, test, vi } from "vitest";
import { copyImagePart, dataUriToBlob, downloadImagePart } from "../imageUtils.js";

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  vi.useRealTimers();
});
describe("image data decoding", () => {
  test("decodes base64 image bytes and MIME", async () => {
    const blob = dataUriToBlob("data:image/png;base64,AQID");
    expect(blob?.type).toBe("image/png");
    expect(await blob?.bytes()).toEqual(new Uint8Array([1, 2, 3]));
  });
  test("decodes percent octets without assuming valid UTF8", async () => {
    const blob = dataUriToBlob("data:image/png,%FF%00a");
    expect(await blob?.bytes()).toEqual(new Uint8Array([255, 0, 97]));
  });
  test("refuses malformed data and invalid base64", () => {
    expect(dataUriToBlob("data:image/png")).toBeNull();
    expect(dataUriToBlob("https://example.com/image.png")).toBeNull();
    expect(dataUriToBlob("data:image/png;base64,?")).toBeNull();
  });
  test("keeps plain Unicode text, literal percent characters and escaped octets", async () => {
    const blob = dataUriToBlob("DATA:text/plain,hello%20é%FF%25z%invalid");
    expect(blob?.type).toBe("text/plain");
    expect(await blob?.bytes()).toEqual(
      new Uint8Array([104, 101, 108, 108, 111, 32, 195, 169, 255, 37, 122, 37, 105, 110, 118, 97, 108, 105, 100]),
    );
  });
  test("defaults an omitted MIME and decodes URL-escaped base64", async () => {
    const blob = dataUriToBlob("data:;base64,%2Bw%3D%3D");
    expect(blob?.type).toBe("application/octet-stream");
    expect(await blob?.bytes()).toEqual(new Uint8Array([251]));
  });
});

describe("native image downloads", () => {
  test.each([
    ["https://example.com/a%20b.png", "a b.png"],
    ["http://example.com/photo.JPEG", "photo.JPEG"],
    ["/image.svg", "image.svg"],
    ["https://example.com/%E0.png", "%E0.png"],
    ["https://example.com/image", "image.png"],
    ["blob:https://example.com/id", "image.png"],
  ])("activates a native download for %s", (image, filename) => {
    const activation = vi.fn();
    document.addEventListener(
      "click",
      (event) => {
        event.preventDefault();
        const anchor = event.target;
        assert(anchor instanceof HTMLAnchorElement);
        activation({ href: anchor.getAttribute("href"), filename: anchor.download, rel: anchor.rel });
      },
      { once: true },
    );
    downloadImagePart({ image });
    expect(activation).toHaveBeenCalledExactlyOnceWith({ href: image, filename, rel: "noopener" });
    expect(document.querySelector("a[download]")).toBeNull();
  });
  test.each([
    ["image/png", "png"],
    ["image/jpeg", "jpg"],
    ["image/jpg", "jpg"],
    ["image/webp", "webp"],
    ["image/gif", "gif"],
    ["image/svg+xml", "svg"],
    ["image/unknown", "png"],
  ])("downloads decoded %s data and revokes its object URL", async (mime, extension) => {
    vi.useFakeTimers();
    const create = vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:https://example.com/download");
    const revoke = vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});
    const activation = vi.fn();
    document.addEventListener(
      "click",
      (event) => {
        event.preventDefault();
        const anchor = event.target;
        assert(anchor instanceof HTMLAnchorElement);
        activation(anchor.download);
      },
      { once: true },
    );
    downloadImagePart({ image: `data:${mime};base64,AQID` });
    expect(activation).toHaveBeenCalledExactlyOnceWith(`image.${extension}`);
    expect(create).toHaveBeenCalledOnce();
    const blob = create.mock.calls[0]?.[0];
    assert(blob instanceof Blob);
    expect(await blob.bytes()).toEqual(new Uint8Array([1, 2, 3]));
    expect(revoke).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(40_000);
    expect(revoke).toHaveBeenCalledExactlyOnceWith("blob:https://example.com/download");
  });
  test("retains the supplied filename", () => {
    const activation = vi.fn();
    document.addEventListener(
      "click",
      (event) => {
        event.preventDefault();
        const anchor = event.target;
        assert(anchor instanceof HTMLAnchorElement);
        activation(anchor.download);
      },
      { once: true },
    );
    downloadImagePart({ image: "https://example.com/image.png", filename: "report.png" });
    expect(activation).toHaveBeenCalledExactlyOnceWith("report.png");
  });
  test.each(["javascript:alert(1)", "file:///private.png", "data:image/png", "data:image/png;base64,?", "http://["])(
    "rejects an unsafe or invalid source %s",
    (image) => {
      const activation = vi.spyOn(HTMLAnchorElement.prototype, "click");
      downloadImagePart({ image });
      expect(activation).not.toHaveBeenCalled();
    },
  );
});

describe("image clipboard operations", () => {
  test("copies exact decoded bytes through a native ClipboardItem", async () => {
    const write = vi.spyOn(navigator.clipboard, "write").mockResolvedValue();
    await copyImagePart({ image: "data:image/png;base64,AQID" });
    expect(write).toHaveBeenCalledOnce();
    const item = write.mock.calls[0]?.[0][0];
    expect(item).toBeInstanceOf(ClipboardItem);
    expect(item?.types).toEqual(["image/png"]);
    expect(await (await item?.getType("image/png"))?.bytes()).toEqual(new Uint8Array([1, 2, 3]));
  });
  test("fetches an actual URL source before copying its MIME and bytes", async () => {
    const write = vi.spyOn(navigator.clipboard, "write").mockResolvedValue();
    const objectURL = URL.createObjectURL(new Blob([new Uint8Array([4, 5])], { type: "image/png" }));
    try {
      await copyImagePart({ image: objectURL });
      expect(write).toHaveBeenCalledOnce();
      const item = write.mock.calls[0]?.[0][0];
      expect(await (await item?.getType("image/png"))?.bytes()).toEqual(new Uint8Array([4, 5]));
    } finally {
      URL.revokeObjectURL(objectURL);
    }
  });
  test("does not send malformed data to the clipboard", async () => {
    const write = vi.spyOn(navigator.clipboard, "write").mockResolvedValue();
    await expect(copyImagePart({ image: "data:image/png;base64,?" })).rejects.toThrow(
      "Image data could not be decoded.",
    );
    expect(write).not.toHaveBeenCalled();
  });
  test("propagates clipboard permission denial", async () => {
    vi.spyOn(navigator.clipboard, "write").mockRejectedValue(new DOMException("Permission denied", "NotAllowedError"));
    await expect(copyImagePart({ image: "data:image/png;base64,AQID" })).rejects.toThrow("Permission denied");
  });
  test("reports unavailable clipboard support", async () => {
    vi.stubGlobal("ClipboardItem", undefined);
    await expect(copyImagePart({ image: "data:image/png;base64,AQID" })).rejects.toThrow(
      "Clipboard API is not available in this environment.",
    );
  });
});
