import { useEffect, useRef, useState } from "react";
import type { ReactElement } from "react";

interface SnapshotThumbnailProps {
  url: string;
  name: string;
  isTrimmed: boolean;
}

export function SnapshotThumbnail({ url, name, isTrimmed }: SnapshotThumbnailProps): ReactElement {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [hasFailed, setHasFailed] = useState(false);
  useEffect(() => {
    const image = new Image();
    let isActive = true;
    image.onload = () => {
      const element = canvas.current;
      const context = element?.getContext("2d", { willReadFrequently: true });
      if (!isActive || !element || !context) return;
      element.width = image.naturalWidth;
      element.height = image.naturalHeight;
      context.drawImage(image, 0, 0);
      if (!isTrimmed) return;
      const { data, width, height } = context.getImageData(0, 0, element.width, element.height);
      let left = width;
      let top = height;
      let right = -1;
      let bottom = -1;
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const offset = (y * width + x) * 4;
          const isBackground =
            data[offset] === data[0] &&
            data[offset + 1] === data[1] &&
            data[offset + 2] === data[2] &&
            data[offset + 3] === data[3];
          if (isBackground) continue;
          left = Math.min(left, x);
          top = Math.min(top, y);
          right = Math.max(right, x);
          bottom = Math.max(bottom, y);
        }
      }
      if (right < left) return;
      const padding = 8;
      left = Math.max(0, left - padding);
      top = Math.max(0, top - padding);
      const cropWidth = Math.min(width, right + padding + 1) - left;
      const cropHeight = Math.min(height, bottom + padding + 1) - top;
      element.width = cropWidth;
      element.height = cropHeight;
      context.drawImage(image, left, top, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);
    };
    image.onerror = () => {
      if (isActive) setHasFailed(true);
    };
    image.src = url;
    return () => {
      isActive = false;
    };
  }, [url, isTrimmed]);
  return hasFailed ? <span>Could not load {name}</span> : <canvas ref={canvas} role="img" aria-label={name} />;
}
