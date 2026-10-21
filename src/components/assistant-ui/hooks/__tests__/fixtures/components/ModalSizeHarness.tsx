import { useRef, type JSX } from "react";
import { useModalSize } from "../../../useModalSize.js";
export function ModalSizeHarness(): JSX.Element {
  const contentRef = useRef<HTMLDivElement>(null);
  const { size, handleProps, reset } = useModalSize(contentRef);
  return (
    <div
      data-testid="ModalSizeHarness"
      ref={contentRef}
      aria-label="Resizable conversation"
      style={{ width: size?.width ?? 600, height: size?.height ?? 500 }}
    >
      <button type="button" {...handleProps}>
        Resize conversation
      </button>
      <button type="button" onClick={reset}>
        Reset size
      </button>
      <output>{size === null ? "Default size" : `${size.width} by ${size.height}`}</output>
    </div>
  );
}
