import type { ReactElement } from "react";
import { ResizablePanelGroup } from "../../resizable/Resizable.js";
import { ResizablePanel } from "../../resizable/Resizable.js";
import { ResizableHandle } from "../../resizable/Resizable.js";
import { type PropsWithChildren } from "react";
import { Thread } from "./Thread.js";
export function AssistantSidebar({ children }: PropsWithChildren): ReactElement {
  return (
    <ResizablePanelGroup orientation="horizontal">
      <ResizablePanel>{children}</ResizablePanel>
      <ResizableHandle />
      <ResizablePanel>
        <Thread />
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
