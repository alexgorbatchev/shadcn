import { act, cleanup, renderHook } from "@testing-library/react";
import type { RefObject } from "react";
import { afterEach, describe, expect, test } from "vitest";
import { useFitInComposer } from "../useFitInComposer.js";

interface IAlignmentProps {
  align: "start" | "end";
}
afterEach(cleanup);

describe("useFitInComposer", () => {
  test("fits a menu inside its real composer and follows container resizing", async () => {
    const bounds = document.createElement("div");
    bounds.dataset.slot = "composer";
    Object.assign(bounds.style, { position: "relative", width: "200px", height: "40px" });
    const menu = document.createElement("div");
    Object.assign(menu.style, { position: "absolute", left: "-40px", width: "140px", height: "20px" });
    bounds.append(menu);
    document.body.append(bounds);
    const menuRef: RefObject<HTMLDivElement | null> = { current: menu };
    try {
      const { result } = renderHook(() => useFitInComposer(menuRef, "start"));
      expect(result.current).toEqual({ shift: 40, maxWidth: 200 });
      await act(async () => {
        const resized = new Promise<void>((resolve) => {
          const observer = new ResizeObserver(() => {
            observer.disconnect();
            resolve();
          });
          observer.observe(bounds);
        });
        bounds.style.width = "300px";
        await resized;
      });
      expect(result.current).toEqual({ shift: 40, maxWidth: 300 });
    } finally {
      cleanup();
      bounds.remove();
    }
  });

  test("remeasures a menu when its alignment changes", () => {
    const bounds = document.createElement("div");
    bounds.dataset.slot = "composer";
    Object.assign(bounds.style, { position: "relative", width: "200px", height: "40px" });
    const menu = document.createElement("div");
    Object.assign(menu.style, { position: "absolute", left: "0px", width: "140px", height: "20px" });
    bounds.append(menu);
    document.body.append(bounds);
    const menuRef: RefObject<HTMLDivElement | null> = { current: menu };
    const initialProps: IAlignmentProps = { align: "start" };
    try {
      const { result, rerender } = renderHook(({ align }: IAlignmentProps) => useFitInComposer(menuRef, align), {
        initialProps,
      });
      expect(result.current).toEqual({ shift: 0, maxWidth: 200 });
      menu.style.left = "150px";
      rerender({ align: "end" });
      expect(result.current).toEqual({ shift: -90, maxWidth: 200 });
    } finally {
      cleanup();
      bounds.remove();
    }
  });
});
