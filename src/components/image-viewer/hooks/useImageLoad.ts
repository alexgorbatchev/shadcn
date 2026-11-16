import { useState, type SyntheticEvent } from "react";
import type { IImageLoadState } from "../types.js";

interface ITrackedImageLoad extends IImageLoadState {
  src: string;
}

interface IImageLoadHandlers {
  onLoad: (event: SyntheticEvent<HTMLImageElement>) => void;
  onError: () => void;
}

/** Tracks whether the image at `src` has loaded and its natural size; a new `src` starts loading again. */
export function useImageLoad(src: string): readonly [IImageLoadState, IImageLoadHandlers] {
  const [state, setState] = useState<ITrackedImageLoad>({ src, status: "loading" });
  const handlers: IImageLoadHandlers = {
    onLoad: (event) => {
      const image = event.currentTarget;
      setState({ src, status: "loaded", size: { width: image.naturalWidth, height: image.naturalHeight } });
    },
    onError: () => setState({ src, status: "error" }),
  };
  return [state.src === src ? state : { status: "loading" }, handlers];
}
