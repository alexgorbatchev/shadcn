import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { usePanelRef } from "react-resizable-panels";
import { Button } from "../Button";
import { DirectionProvider } from "../DirectionProvider";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import { Resizable, ResizableHandle, ResizablePanel } from "../Resizable";

const meta: Meta<typeof Resizable> = {
  title: "shadcn-alexgorbatchev/components/Resizable",
  component: Resizable,
  tags: ["autodocs", "test"],
  args: { orientation: "horizontal", onLayoutChanged: fn() },
  argTypes: { orientation: { control: "select", options: ["horizontal", "vertical"] } },
  render: (args) => (
    <div className="h-64 w-96 border border-border">
      <Resizable {...args}>
        <ResizablePanel id="primary" defaultSize="50%" minSize="20%" maxSize="80%">
          <div className="flex size-full items-center justify-center">Primary</div>
        </ResizablePanel>
        <ResizableHandle withHandle aria-label="Resize panels" />
        <ResizablePanel id="secondary" defaultSize="50%" minSize="20%">
          <div className="flex size-full items-center justify-center">Secondary</div>
        </ResizablePanel>
      </Resizable>
    </div>
  ),
};
export default meta;
type Story = StoryObj<typeof meta>;

export const Horizontal: Story = {
  play: async ({ canvasElement, args }) => {
    const separator = within(canvasElement).getByRole("separator", { name: "Resize panels" });
    await expect(separator).toHaveAttribute("aria-orientation", "vertical");
    await userEvent.tab();
    await expect(separator).toHaveFocus();
    const primary = canvasElement.querySelector<HTMLElement>('[data-slot="resizable-panel"]');
    const initialWidth = primary?.getBoundingClientRect().width ?? 0;
    await userEvent.keyboard("{ArrowRight}");
    await waitFor(() => expect(primary?.getBoundingClientRect().width).toBeGreaterThan(initialWidth));
    await expect(args.onLayoutChanged).toHaveBeenCalledWith(
      expect.any(Object),
      expect.objectContaining({ isUserInteraction: true }),
    );
    await userEvent.keyboard("{Home}");
    await waitFor(() => expect(Number(separator.getAttribute("aria-valuenow"))).toBeCloseTo(20, 0));
    await userEvent.keyboard("{End}");
    await waitFor(() => expect(Number(separator.getAttribute("aria-valuenow"))).toBeCloseTo(80, 0));
  },
};
export const Vertical: Story = {
  args: { orientation: "vertical" },
  play: async ({ canvasElement }) => {
    const separator = within(canvasElement).getByRole("separator", { name: "Resize panels" });
    await expect(separator).toHaveAttribute("aria-orientation", "horizontal");
    await userEvent.tab();
    const primary = canvasElement.querySelector<HTMLElement>('[data-slot="resizable-panel"]');
    const initialHeight = primary?.getBoundingClientRect().height ?? 0;
    await userEvent.keyboard("{ArrowDown}");
    await waitFor(() => expect(primary?.getBoundingClientRect().height).toBeGreaterThan(initialHeight));
  },
};
export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ canvasElement, args }) => {
    const separator = within(canvasElement).getByRole("separator", { name: "Resize panels" });
    const primary = canvasElement.querySelector<HTMLElement>('[data-slot="resizable-panel"]');
    const initialWidth = primary?.getBoundingClientRect().width;
    await userEvent.tab();
    await expect(separator).toHaveFocus();
    await userEvent.keyboard("{ArrowRight}");
    await expect(primary?.getBoundingClientRect().width).toBe(initialWidth);
    await expect(args.onLayoutChanged).not.toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ isUserInteraction: true }),
    );
  },
};

export const Nested: Story = {
  render: (args) => (
    <div className="h-64 w-96 border border-border">
      <Resizable {...args} orientation="horizontal">
        <ResizablePanel defaultSize="50%" minSize="20%" role="region" aria-label="Navigation panel">
          <div className="p-panel">Navigation</div>
        </ResizablePanel>
        <ResizableHandle withHandle aria-label="Resize navigation" />
        <ResizablePanel defaultSize="50%" minSize="20%">
          <Resizable orientation="vertical">
            <ResizablePanel defaultSize="25%" minSize="10%" role="region" aria-label="Editor panel">
              <div className="p-panel">Editor</div>
            </ResizablePanel>
            <ResizableHandle withHandle aria-label="Resize editor" />
            <ResizablePanel defaultSize="75%" minSize="20%" role="region" aria-label="Preview panel">
              <div className="p-panel">Preview</div>
            </ResizablePanel>
          </Resizable>
        </ResizablePanel>
      </Resizable>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const outer = canvas.getByRole("separator", { name: "Resize navigation" });
    const inner = canvas.getByRole("separator", { name: "Resize editor" });
    const editor = canvas.getByRole("region", { name: "Editor panel" });
    const navigation = canvas.getByRole("region", { name: "Navigation panel" });
    const editorHeight = editor.getBoundingClientRect().height;
    const initial = outer.getBoundingClientRect().left;
    outer.focus();
    await userEvent.keyboard("{ArrowRight}");
    await waitFor(() => expect(outer.getBoundingClientRect().left).toBeGreaterThan(initial));
    await expect(editor.getBoundingClientRect().height).toBeCloseTo(editorHeight, 0);
    const navigationWidth = navigation.getBoundingClientRect().width;
    inner.focus();
    await userEvent.keyboard("{ArrowDown}");
    await waitFor(() => expect(editor.getBoundingClientRect().height).toBeGreaterThan(editorHeight));
    await expect(navigation.getBoundingClientRect().width).toBeCloseTo(navigationWidth, 0);
    await expect(outer).toHaveAttribute("aria-orientation", "vertical");
    await expect(inner).toHaveAttribute("aria-orientation", "horizontal");
  },
};
export const RightToLeftNested: Story = {
  ...Nested,
  decorators: [
    (Story) => (
      <DirectionProvider direction="rtl">
        <div dir="rtl">
          <Story />
        </div>
      </DirectionProvider>
    ),
  ],
};

export const WithoutGrip: Story = {
  render: (args) => (
    <div className="h-64 w-96 border border-border">
      <Resizable {...args} orientation="horizontal">
        <ResizablePanel defaultSize="50%" minSize="20%" role="region" aria-label="First panel">
          <div className="p-panel">First</div>
        </ResizablePanel>
        <ResizableHandle aria-label="Resize without grip" />
        <ResizablePanel defaultSize="50%" minSize="20%" role="region" aria-label="Second panel">
          <div className="p-panel">Second</div>
        </ResizablePanel>
      </Resizable>
    </div>
  ),
  play: async ({ canvasElement, args }) => {
    const separator = within(canvasElement).getByRole("separator", { name: "Resize without grip" });
    await expect(separator.querySelector('[aria-hidden="true"]')).toBeNull();
    const bounds = separator.getBoundingClientRect();
    const x = bounds.left + bounds.width / 2,
      y = bounds.top + bounds.height / 2;
    await userEvent.pointer([
      { keys: "[MouseLeft>]", target: separator, coords: { clientX: x, clientY: y } },
      { target: separator, coords: { clientX: x + 40, clientY: y } },
      { keys: "[/MouseLeft]" },
    ]);
    await waitFor(() => expect(separator.getBoundingClientRect().left).toBeGreaterThan(bounds.left + 30));
    await expect(args.onLayoutChanged).toHaveBeenCalledWith(
      expect.any(Object),
      expect.objectContaining({ isUserInteraction: true }),
    );
  },
};
export const RightToLeftWithoutGrip: Story = { ...WithoutGrip, decorators: RightToLeftNested.decorators };

export const Collapsible: Story = {
  render: function Render() {
    const panelRef = usePanelRef();
    const [size, setSize] = useState(50);
    return (
      <div className="flex flex-col items-start gap-panel">
        <div className="flex gap-control-gap">
          <Button onClick={() => panelRef.current?.collapse()}>Collapse navigation</Button>
          <Button onClick={() => panelRef.current?.expand()}>Expand navigation</Button>
          <Button onClick={() => panelRef.current?.resize("60%")}>Resize to sixty</Button>
        </div>
        <div className="h-64 w-96 border border-border">
          <Resizable orientation="horizontal">
            <ResizablePanel
              panelRef={panelRef}
              defaultSize="50%"
              minSize="20%"
              maxSize="80%"
              collapsible
              collapsedSize="0%"
              onResize={(next) => setSize(next.asPercentage)}
              role="region"
              aria-label="Collapsible navigation"
            >
              <div className="p-panel">Navigation</div>
            </ResizablePanel>
            <ResizableHandle withHandle aria-label="Resize collapsible navigation" />
            <ResizablePanel defaultSize="50%" minSize="20%">
              <div className="p-panel">Editor</div>
            </ResizablePanel>
          </Resizable>
        </div>
        <output aria-label="Navigation size">{Math.round(size)}%</output>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const navigation = canvas.getByRole("region", { name: "Collapsible navigation" });
    const initial = navigation.getBoundingClientRect().width;
    await userEvent.click(canvas.getByRole("button", { name: "Collapse navigation" }));
    await waitFor(() => expect(navigation.getBoundingClientRect().width).toBe(0));
    await waitFor(() => expect(canvas.getByLabelText("Navigation size")).toHaveTextContent("0%"));
    await userEvent.click(canvas.getByRole("button", { name: "Expand navigation" }));
    await waitFor(() => expect(navigation.getBoundingClientRect().width).toBeCloseTo(initial, 0));
    await userEvent.click(canvas.getByRole("button", { name: "Resize to sixty" }));
    await waitFor(() => expect(navigation.getBoundingClientRect().width).toBeGreaterThan(initial));
    await waitFor(() => expect(canvas.getByLabelText("Navigation size")).toHaveTextContent("60%"));
  },
};
export const RightToLeftCollapsible: Story = { ...Collapsible, decorators: RightToLeftNested.decorators };
export const KeyboardCollapse: Story = {
  ...Collapsible,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const navigation = canvas.getByRole("region", { name: "Collapsible navigation" });
    const initial = navigation.getBoundingClientRect().width;
    const separator = canvas.getByRole("separator", { name: "Resize collapsible navigation" });
    separator.focus();
    await userEvent.keyboard("{Enter}");
    await waitFor(() => expect(navigation.getBoundingClientRect().width).toBe(0));
    await expect(separator).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await waitFor(() => expect(navigation.getBoundingClientRect().width).toBeCloseTo(initial, 0));
    await expect(separator).toHaveFocus();
  },
};
