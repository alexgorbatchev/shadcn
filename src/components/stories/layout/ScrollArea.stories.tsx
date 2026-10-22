import type { ComponentProps } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import { ScrollArea, ScrollBar } from "../../ScrollArea";
import { cn } from "../../../utils/cn";
import { DirectionProvider } from "../../DirectionProvider";

type ScrollAreaStoryProps = ComponentProps<typeof ScrollArea> & {
  barClassName?: ComponentProps<typeof ScrollBar>["className"];
};
const meta: Meta<ScrollAreaStoryProps> = {
  title: "@alexgorbatchev/shadcn/components/layout/ScrollArea",
  component: ScrollArea,
  tags: ["autodocs", "test"],
};
export default meta;
type Story = StoryObj<typeof meta>;
export const NativeScrollbars: Story = {
  tags: ["visual"],
  render: () => (
    <div
      role="region"
      aria-label="Native release history"
      tabIndex={0}
      className="h-48 w-64 overflow-auto border border-border bg-background focus-visible:outline-1 focus-visible:outline-ring"
    >
      <ol className="flex w-192 flex-col gap-4 p-panel">
        {Array.from({ length: 30 }, (_, index) => (
          <li key={index}>Release {index + 1} — native browser scrolling in both directions</li>
        ))}
      </ol>
    </div>
  ),
  play: async ({ canvasElement }) => {
    await document.fonts.ready;
    const viewport = within(canvasElement).getByRole("region", { name: "Native release history" });
    viewport.focus();
    viewport.scrollTo({ top: 100, left: 100 });
    await waitFor(() => expect(viewport.scrollTop).toBeGreaterThan(0));
    await waitFor(() => expect(viewport.scrollLeft).toBeGreaterThan(0));
    await expect(viewport).toHaveFocus();
    viewport.scrollTo({ top: viewport.scrollHeight / 3, left: 100 });
    await waitFor(() => expect(viewport.scrollTop).toBeGreaterThan(viewport.clientHeight));
    viewport.blur();
  },
};

export const Default: Story = {
  render: ({ barClassName, ...args }) => (
    <ScrollArea
      {...args}
      aria-label="Release history"
      scrollbars={<ScrollBar className={barClassName} />}
      className={(state) =>
        cn(
          "h-48 w-64 border border-border",
          typeof args.className === "function" ? args.className(state) : args.className,
        )
      }
    >
      <ol className="flex flex-col gap-4 p-panel">
        {Array.from({ length: 30 }, (_, index) => (
          <li key={index}>Release {index + 1}</li>
        ))}
      </ol>
    </ScrollArea>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Release 1")).toBeVisible();
    const viewport = canvasElement.querySelector<HTMLElement>('[data-slot="scroll-area-viewport"]');
    await waitFor(() => expect(canvasElement.querySelector('[data-slot="scroll-area-scrollbar"]')).toBeInTheDocument());
    const track = canvasElement.querySelector<HTMLElement>('[data-slot="scroll-area-scrollbar"]');
    await waitFor(() => expect(track?.getBoundingClientRect().width).toBeGreaterThan(8));
    await expect(track?.getBoundingClientRect().height).toBeGreaterThan(100);
    await expect(track?.parentElement?.getAttribute("data-slot")).toBe("scroll-area");
    viewport?.focus();
    await expect(viewport).toHaveFocus();
    const rect = track?.getBoundingClientRect();
    await userEvent.pointer({
      target: track ?? undefined,
      keys: "[MouseLeft]",
      coords: {
        clientX: (rect?.left ?? 0) + (rect?.width ?? 0) / 2,
        clientY: (rect?.top ?? 0) + (rect?.height ?? 0) * 0.75,
      },
    });
    await waitFor(() => expect(viewport?.scrollTop).toBeGreaterThan(0));
    await expect(viewport).toHaveFocus();
    viewport?.scrollTo({ top: 0 });
    await waitFor(() => expect(viewport?.scrollTop).toBe(0));
  },
};

export const FlexHeight: Story = {
  render: () => (
    <section data-scroll="none" aria-label="Release panel" className="flex max-h-64 w-64 flex-col gap-3 border p-4">
      <h2 className="shrink-0">Release panel</h2>
      <ScrollArea>
        <ol className="flex flex-col gap-3">
          {Array.from({ length: 30 }, (_, index) => (
            <li key={index}>Release {index + 1}</li>
          ))}
        </ol>
      </ScrollArea>
      <p className="shrink-0">Stationary footer</p>
    </section>
  ),
  play: async ({ canvasElement }) => {
    const panel = within(canvasElement).getByRole("region", { name: "Release panel" });
    const viewport = panel.querySelector('[data-slot="scroll-area-viewport"]');
    const footer = within(panel).getByText("Stationary footer");
    const footerTop = footer.getBoundingClientRect().top;
    await expect(viewport?.scrollHeight).toBeGreaterThan(viewport?.clientHeight ?? 0);
    viewport?.scrollTo({ top: 100, behavior: "instant" });
    await waitFor(() => expect(viewport?.scrollTop).toBe(100));
    await expect(panel.scrollTop).toBe(0);
    await expect(footer.getBoundingClientRect().top).toBe(footerTop);
    await expect(footer.getBoundingClientRect().bottom).toBeLessThanOrEqual(panel.getBoundingClientRect().bottom);
  },
};
export const StateCallback: Story = {
  ...Default,
  args: { className: fn(() => "min-w-64"), barClassName: fn(() => "") },
  play: async (context) => {
    await Default.play?.(context);
    await expect(context.args.className).toHaveBeenCalledWith(expect.objectContaining({ hasOverflowY: true }));
    await expect(context.args.barClassName).toHaveBeenCalledWith(
      expect.objectContaining({ orientation: "vertical", hasOverflowY: true }),
    );
  },
};
export const Horizontal: Story = {
  render: () => (
    <ScrollArea
      aria-label="Horizontal releases"
      className="h-24 w-64 border border-border"
      scrollbars={<ScrollBar orientation="horizontal" />}
    >
      <ol className="flex w-max gap-4 p-panel">
        {Array.from({ length: 12 }, (_, index) => (
          <li key={index} className="w-32 shrink-0">
            Release {index + 1}
          </li>
        ))}
      </ol>
    </ScrollArea>
  ),
  play: async ({ canvasElement }) => {
    const viewport = canvasElement.querySelector<HTMLElement>('[data-slot="scroll-area-viewport"]');
    await waitFor(() => expect(canvasElement.querySelector('[data-orientation="horizontal"]')).toBeInTheDocument());
    const track = canvasElement.querySelector<HTMLElement>('[data-orientation="horizontal"]');
    await waitFor(() => expect(track?.getBoundingClientRect().height).toBeGreaterThan(8));
    await expect(track?.getBoundingClientRect().width).toBeGreaterThan(100);
    await expect(track?.parentElement?.getAttribute("data-slot")).toBe("scroll-area");
    const rect = track?.getBoundingClientRect();
    viewport?.focus();
    await userEvent.pointer({
      target: track ?? undefined,
      keys: "[MouseLeft]",
      coords: {
        clientX: (rect?.left ?? 0) + (rect?.width ?? 0) * 0.75,
        clientY: (rect?.top ?? 0) + (rect?.height ?? 0) / 2,
      },
    });
    await waitFor(() => expect(Math.abs(viewport?.scrollLeft ?? 0)).toBeGreaterThan(0));
    await expect(viewport).toHaveFocus();
    viewport?.scrollTo({ left: 0 });
    await waitFor(() => expect(viewport?.scrollLeft).toBe(0));
  },
};
export const RightToLeft: Story = {
  ...Horizontal,
  decorators: [
    (Story) => (
      <DirectionProvider direction="rtl">
        <div dir="rtl">
          <Story />
        </div>
      </DirectionProvider>
    ),
  ],
  play: async (context) => {
    await Horizontal.play?.(context);
    const viewport = context.canvasElement.querySelector<HTMLElement>('[data-slot="scroll-area-viewport"]');
    viewport?.scrollTo({ left: -200 });
    await waitFor(() => expect(viewport?.scrollLeft).toBeLessThan(0));
    await expect(getComputedStyle(viewport as HTMLElement).direction).toBe("rtl");
  },
};
export const BothDirections: Story = {
  render: () => (
    <ScrollArea
      aria-label="Release matrix"
      className="h-48 w-64 border border-border"
      scrollbars={
        <>
          <ScrollBar />
          <ScrollBar orientation="horizontal" />
        </>
      }
    >
      <ol className="grid w-192 grid-cols-3 gap-4 p-panel">
        {Array.from({ length: 90 }, (_, index) => (
          <li key={index}>Release {index + 1}</li>
        ))}
      </ol>
    </ScrollArea>
  ),
  play: async ({ canvasElement }) => {
    const viewport = canvasElement.querySelector<HTMLElement>('[data-slot="scroll-area-viewport"]');
    await waitFor(() => expect(canvasElement.querySelector('[data-orientation="horizontal"]')).toBeInTheDocument());
    const vertical = canvasElement.querySelector<HTMLElement>('[data-orientation="vertical"]');
    const horizontal = canvasElement.querySelector<HTMLElement>('[data-orientation="horizontal"]');
    await waitFor(() => expect(vertical?.getBoundingClientRect().width).toBeGreaterThan(8));
    await waitFor(() => expect(horizontal?.getBoundingClientRect().height).toBeGreaterThan(8));
    await waitFor(() =>
      expect(vertical?.getBoundingClientRect().bottom ?? Infinity).toBeLessThanOrEqual(
        horizontal?.getBoundingClientRect().top ?? 0,
      ),
    );
    await waitFor(() =>
      expect(horizontal?.getBoundingClientRect().right ?? Infinity).toBeLessThanOrEqual(
        vertical?.getBoundingClientRect().left ?? 0,
      ),
    );
    viewport?.scrollTo({ top: 200, left: 200 });
    await waitFor(() => expect(viewport?.scrollTop).toBeGreaterThan(0));
    await waitFor(() => expect(viewport?.scrollLeft).toBeGreaterThan(0));
  },
};
export const NoOverflow: Story = {
  render: () => (
    <ScrollArea aria-label="Short release history" className="h-48 w-64 border border-border">
      <p>Release 1</p>
    </ScrollArea>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Release 1")).toBeVisible();
    await expect(canvasElement.querySelector('[data-slot="scroll-area-scrollbar"]')).not.toBeInTheDocument();
    const viewport = canvasElement.querySelector<HTMLElement>('[data-slot="scroll-area-viewport"]');
    viewport?.scrollTo({ top: 200 });
    await expect(viewport?.scrollTop).toBe(0);
  },
};
export const KeepMounted: Story = {
  render: () => (
    <ScrollArea
      aria-label="Persistent track"
      className="h-48 w-64 border border-border"
      scrollbars={<ScrollBar keepMounted />}
    >
      <p>Release 1</p>
    </ScrollArea>
  ),
  play: async ({ canvasElement }) => {
    await waitFor(() => expect(canvasElement.querySelector('[data-slot="scroll-area-scrollbar"]')).toBeInTheDocument());
    const track = canvasElement.querySelector<HTMLElement>('[data-slot="scroll-area-scrollbar"]');
    await expect(track).toBeInTheDocument();
    await expect(track?.getBoundingClientRect().width).toBeGreaterThan(8);
    const viewport = canvasElement.querySelector<HTMLElement>('[data-slot="scroll-area-viewport"]');
    viewport?.scrollTo({ top: 200 });
    await expect(viewport?.scrollTop).toBe(0);
  },
};

export const VerticalRightToLeft: Story = {
  ...Default,
  decorators: [
    (Story) => (
      <DirectionProvider direction="rtl">
        <div dir="rtl">
          <Story />
        </div>
      </DirectionProvider>
    ),
  ],
  play: async (context) => {
    const root = context.canvasElement.querySelector('[data-slot="scroll-area"]') as HTMLElement;
    await waitFor(() => expect(root.querySelector('[data-slot="scroll-area-scrollbar"]')).toBeInTheDocument());
    const track = root.querySelector('[data-slot="scroll-area-scrollbar"]') as HTMLElement;
    const thumb = root.querySelector('[data-slot="scroll-area-thumb"]') as HTMLElement;
    await waitFor(() => expect(track.getBoundingClientRect().width).toBeGreaterThan(8));
    await expect(track.getBoundingClientRect().right).toBeLessThan(
      root.getBoundingClientRect().left + root.getBoundingClientRect().width / 2,
    );
    await expect(track.getBoundingClientRect().right - thumb.getBoundingClientRect().right).toBeGreaterThan(
      thumb.getBoundingClientRect().left - track.getBoundingClientRect().left,
    );
    await Default.play?.(context);
  },
};
