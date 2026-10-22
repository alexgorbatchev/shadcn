import { expect, test } from "vitest";
import { commands } from "vitest/browser";
import { render } from "vitest-browser-react";
import { Resizable, ResizableHandle, ResizablePanel } from "../resizable/Resizable";
import { ScrollArea } from "../ScrollArea";
import "../../../.storybook/preview.css";

test("resizable panels stay stationary while an explicit nested ScrollArea can scroll", async () => {
  const screen = await render(
    <div className="h-48 w-96">
      <Resizable>
        <ResizablePanel aria-label="Stationary panel">
          <div className="h-96">Long panel content</div>
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel aria-label="Scrolling body panel">
          <ScrollArea className="h-full">
            <div className="h-96">Scrollable panel content</div>
          </ScrollArea>
        </ResizablePanel>
      </Resizable>
    </div>,
  );
  const surface = screen.getByText("Long panel content").element().parentElement;
  await commands.nativeWheel('[aria-label="Stationary panel"]', 60);
  await new Promise(requestAnimationFrame);
  await new Promise(requestAnimationFrame);
  expect(surface?.scrollTop).toBe(0);
  await commands.nativeWheel('[aria-label="Scrolling body panel"]', 60);
  const viewport = screen.getByText("Scrollable panel content").element().closest('[data-slot="scroll-area-viewport"]');
  await expect.poll(() => viewport?.scrollTop).toBeGreaterThan(0);
});
