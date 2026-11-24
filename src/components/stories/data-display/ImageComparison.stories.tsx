import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, waitFor, within } from "storybook/test";
import { useState, type ReactElement } from "react";
import {
  ImageComparison,
  type IImageComparisonProps,
  type ImageComparisonMode,
  type ImageComparisonOrientation,
  type ImageZoom,
} from "../../image-viewer";
import { Button } from "../../Button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../../Dialog";
import {
  fixture_afterScreenshot,
  fixture_beforeScreenshot,
  fixture_brokenImage,
  fixture_changedRegion,
  fixture_widerBeforeScreenshot,
} from "../fixtures";

const AFTER_SIZE = { width: 960, height: 600 };
const BEFORE_ALT = "Checkout before the button change";
const AFTER_ALT = "Checkout after the button change";

type Canvas = ReturnType<typeof within>;

async function findAfterImage(canvas: Canvas): Promise<HTMLElement> {
  const image = await canvas.findByRole("img", { name: AFTER_ALT });
  await waitFor(() => expect(image.getBoundingClientRect().width).toBeGreaterThan(0));
  return image;
}

function getViewport(element: HTMLElement): HTMLElement {
  return element.closest<HTMLElement>("[data-slot=image-viewport]")!;
}

function elementAt(image: HTMLElement, x: number, y: number): Element | null {
  const bounds = image.getBoundingClientRect();
  return image.ownerDocument.elementFromPoint(bounds.left + bounds.width * x, bounds.top + bounds.height * y);
}

async function expectZoomModes(
  canvas: Canvas,
  image: HTMLElement,
  click: (element: Element) => Promise<void>,
): Promise<void> {
  const viewport = getViewport(image);
  await waitFor(() => {
    expect(image.getBoundingClientRect().width).toBeLessThanOrEqual(viewport.clientWidth + 0.5);
    expect(image.getBoundingClientRect().height).toBeLessThanOrEqual(viewport.clientHeight + 0.5);
    expect(viewport.scrollWidth).toBeLessThanOrEqual(viewport.clientWidth);
  });
  await click(canvas.getByRole("button", { name: "Original size" }));
  await waitFor(() => {
    expect(image.getBoundingClientRect().width).toBe(AFTER_SIZE.width);
    expect(image.getBoundingClientRect().height).toBe(AFTER_SIZE.height);
    expect(viewport.scrollWidth).toBeGreaterThan(viewport.clientWidth);
  });
  await click(canvas.getByRole("button", { name: "Fit to screen" }));
  await waitFor(() => expect(viewport.scrollWidth).toBeLessThanOrEqual(viewport.clientWidth));
}

function ControlledComparison(props: IImageComparisonProps): ReactElement {
  const [mode, setMode] = useState<ImageComparisonMode>("swipe");
  const [orientation, setOrientation] = useState<ImageComparisonOrientation>("vertical");
  const [zoom, setZoom] = useState<ImageZoom>("fit");
  const [showDifferences, setShowDifferences] = useState(true);
  return (
    <div className="flex h-[36rem] w-full flex-col gap-2 border border-border">
      <ImageComparison
        {...props}
        mode={mode}
        onModeChange={(next) => {
          setMode(next);
          props.onModeChange?.(next);
        }}
        orientation={orientation}
        onOrientationChange={(next) => {
          setOrientation(next);
          props.onOrientationChange?.(next);
        }}
        zoom={zoom}
        onZoomChange={(next) => {
          setZoom(next);
          props.onZoomChange?.(next);
        }}
        showDifferences={showDifferences}
        onShowDifferencesChange={(next) => {
          setShowDifferences(next);
          props.onShowDifferencesChange?.(next);
        }}
      />
      <output aria-label="Comparison state" className="px-2 pb-2 text-sm">
        {[mode, orientation, zoom, showDifferences ? "differences" : "plain"].join(" ")}
      </output>
    </div>
  );
}

function FullscreenComparison(props: IImageComparisonProps): ReactElement {
  return (
    <Dialog>
      <DialogTrigger render={<Button />}>Compare screenshots</DialogTrigger>
      <DialogContent size="fullscreen">
        <DialogHeader>
          <DialogTitle>Checkout evidence</DialogTitle>
        </DialogHeader>
        <ImageComparison {...props} />
      </DialogContent>
    </Dialog>
  );
}

const meta: Meta<typeof ImageComparison> = {
  title: "@alexgorbatchev/shadcn/components/data-display/ImageComparison",
  component: ImageComparison,
  tags: ["autodocs", "test"],
  parameters: {
    docs: {
      description: {
        component:
          'Import from `@alexgorbatchev/shadcn/image-viewer`. ImageComparison fills its container and compares `before` and `after` images (`{ src, alt, crossOrigin? }`) labelled by `beforeLabel` and `afterLabel` (default "Before" and "After"). `toggle` (the default) shows one image, chosen by the "Shown image" control or B and A on the focused stage (`side`, default `after`), and the "Hold to show before" (or "after") button shows the other image while a pointer, Space, or Enter is held; the header announces the shown image. `swipe` stacks both images; the divider is a slider (0–100, arrows ±1, Page Up/Page Down ±10, Home/End) whose handle drags with pointer capture. `side-by-side` shows labelled panes left and right (`horizontal`) or top and bottom (`vertical`, chosen automatically when the stage is taller than wide unless controlled) that scroll in sync when zoomed. Every mode starts fitted and offers original size (zoom `1`) with edge-fade scroll hints when content extends out of view; the focused stage also takes the ImageViewer stage keys, Mod+wheel and pinch, and its name ends with the zoom percent. A differently sized before image is drawn inside the after image box, and the toolbar reports the mismatch. "Highlight differences" compares pixels on first use, caches the result per image pair, outlines changed regions, and offers a "Change n of m" stepper (`N` / `Shift+N` on the stage, centering each change in every shown pane, and jumping to the first change at original size); it is disabled with a reason when pixels cannot be read. `toolbar`, `beforeOverlay`, `afterOverlay`, `stageOverlay`, and `onCommentDifference` let consumers host region comments in every mode. Controls sit in a single horizontal wrapping row above the stage so images use the full width.',
      },
    },
  },
  args: {
    before: { src: fixture_beforeScreenshot, alt: BEFORE_ALT },
    after: { src: fixture_afterScreenshot, alt: AFTER_ALT },
    onModeChange: fn(),
    onSideChange: fn(),
    onOrientationChange: fn(),
    onZoomChange: fn(),
    onShowDifferencesChange: fn(),
  },
  argTypes: {
    defaultMode: { control: "inline-radio", options: ["toggle", "swipe", "side-by-side"] },
    defaultOrientation: { control: "inline-radio", options: ["horizontal", "vertical"] },
    defaultZoom: { control: "inline-radio", options: ["fit", 1, 2] },
    defaultShowDifferences: { control: "boolean" },
    showToolbar: { control: "boolean" },
    density: { control: "select", options: ["compact", "comfortable"] },
  },
  render: (args) => (
    <div className="h-[36rem] w-full border border-border">
      <ImageComparison {...args} />
    </div>
  ),
};
export default meta;
type Story = StoryObj<typeof ImageComparison>;

export const Toggle: Story = {
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const afterImage = await findAfterImage(canvas);
    const showing = canvas.getByText("Showing After");
    const hold = canvas.getByRole("button", { name: "Hold to show before" });
    await expect(showing).toHaveTextContent("Showing After");
    await expect(canvas.queryByRole("img", { name: BEFORE_ALT })).toBeNull();
    await expect(canvas.queryByRole("button", { name: "Horizontal" })).toBeNull();

    await userEvent.pointer({ keys: "[MouseLeft>]", target: hold });
    await expect(showing).toHaveTextContent("Showing Before");
    await expect(canvas.getByRole("img", { name: BEFORE_ALT })).toBeVisible();
    await expect(afterImage).not.toBeVisible();
    await userEvent.pointer({ keys: "[/MouseLeft]", target: hold });
    await expect(showing).toHaveTextContent("Showing After");
    await expect(afterImage).toBeVisible();

    await userEvent.pointer({ keys: "[MouseLeft>]", target: hold });
    await expect(showing).toHaveTextContent("Showing Before");
    await userEvent.pointer({ target: afterImage });
    await expect(showing).toHaveTextContent("Showing After");
    await userEvent.pointer({ keys: "[/MouseLeft]", target: afterImage });

    await userEvent.pointer({ keys: "[MouseRight]", target: hold });
    await expect(showing).toHaveTextContent("Showing After");

    hold.focus();
    await userEvent.keyboard("[Space>]");
    await expect(showing).toHaveTextContent("Showing Before");
    await userEvent.keyboard("[/Space]");
    await expect(showing).toHaveTextContent("Showing After");
    await userEvent.keyboard("{Enter>}");
    await expect(showing).toHaveTextContent("Showing Before");
    await userEvent.keyboard("{/Enter}");
    await expect(showing).toHaveTextContent("Showing After");
    await userEvent.keyboard("[Space>]");
    await expect(showing).toHaveTextContent("Showing Before");
    await userEvent.tab();
    await expect(showing).toHaveTextContent("Showing After");
    await userEvent.keyboard("[/Space]");

    await expectZoomModes(canvas, afterImage, (element) => userEvent.click(element));
  },
};

export const ShownSide: Story = {
  args: { defaultSide: "before" },
  play: async ({ args, canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const beforeImage = await canvas.findByRole("img", { name: BEFORE_ALT });
    const showing = canvas.getByText("Showing Before");
    const before = canvas.getByRole("button", { name: "Before" });
    const after = canvas.getByRole("button", { name: "After" });
    await expect(before).toHaveAttribute("aria-pressed", "true");
    await expect(beforeImage).toBeVisible();
    await expect(canvas.queryByRole("img", { name: AFTER_ALT })).toBeNull();
    const hold = canvas.getByRole("button", { name: "Hold to show after" });
    await userEvent.pointer({ keys: "[MouseLeft>]", target: hold });
    await expect(showing).toHaveTextContent("Showing After");
    await userEvent.pointer({ keys: "[/MouseLeft]", target: hold });
    await expect(showing).toHaveTextContent("Showing Before");

    const stage = canvas.getByRole("region", { name: /^Before, \d+%$/ });
    await expect(stage).toHaveAttribute("aria-keyshortcuts", expect.stringContaining("B A"));
    stage.focus();
    await userEvent.keyboard("a");
    await expect(showing).toHaveTextContent("Showing After");
    await expect(after).toHaveAttribute("aria-pressed", "true");
    await expect(args.onSideChange).toHaveBeenLastCalledWith("after");
    canvas.getByRole("region", { name: /^After, \d+%$/ }).focus();
    await userEvent.keyboard("b");
    await expect(showing).toHaveTextContent("Showing Before");
    await expect(args.onSideChange).toHaveBeenLastCalledWith("before");
    // Modified letters stay with the browser and the page.
    canvas.getByRole("region", { name: /^Before, \d+%$/ }).focus();
    await userEvent.keyboard("{Shift>}A{/Shift}");
    await expect(showing).toHaveTextContent("Showing Before");

    await userEvent.click(after);
    await expect(showing).toHaveTextContent("Showing After");
    await userEvent.click(canvas.getByRole("button", { name: "Side by side" }));
    await expect(canvas.queryByRole("button", { name: "Before" })).toBeNull();
    await expect(canvas.queryByRole("button", { name: "Hold to show before" })).toBeNull();
  },
};

export const Swipe: Story = {
  args: { defaultMode: "swipe" },
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const afterImage = await findAfterImage(canvas);
    const beforeImage = canvas.getByRole("img", { name: BEFORE_ALT });
    const slider = await canvas.findByRole("slider", { name: "Swipe divider" });
    await expect(canvas.queryByRole("button", { name: "Hold to show before" })).toBeNull();
    await expect(canvas.queryByRole("button", { name: "Horizontal" })).toBeNull();
    await expect(slider).toHaveAttribute("aria-valuenow", "50");
    await expect(slider).toHaveAttribute("aria-valuetext", "Before 50%, After 50%");
    await expect(elementAt(afterImage, 0.25, 0.3)).toBe(beforeImage);
    await expect(elementAt(afterImage, 0.75, 0.3)).toBe(afterImage);

    slider.focus();
    await userEvent.keyboard("{ArrowRight}");
    await expect(slider).toHaveAttribute("aria-valuenow", "51");
    await userEvent.keyboard("{ArrowLeft}{ArrowLeft}");
    await expect(slider).toHaveAttribute("aria-valuenow", "49");
    await userEvent.keyboard("{PageUp}");
    await expect(slider).toHaveAttribute("aria-valuenow", "59");
    await userEvent.keyboard("{PageDown}{PageDown}");
    await expect(slider).toHaveAttribute("aria-valuenow", "39");
    await userEvent.keyboard("{End}");
    await expect(slider).toHaveAttribute("aria-valuenow", "100");
    await expect(elementAt(afterImage, 0.75, 0.3)).toBe(beforeImage);
    await userEvent.keyboard("{Home}{PageUp}");
    await expect(slider).toHaveAttribute("aria-valuenow", "10");
    await expect(elementAt(afterImage, 0.25, 0.3)).toBe(afterImage);

    const handle = slider.closest<HTMLElement>("[data-slot=image-swipe-divider-handle]")!;
    const handleBounds = handle.getBoundingClientRect();
    const imageBounds = afterImage.getBoundingClientRect();
    const y = imageBounds.top + imageBounds.height / 2;
    await userEvent.pointer([
      {
        keys: "[MouseLeft>]",
        target: handle,
        coords: { clientX: handleBounds.left + handleBounds.width / 2, clientY: y },
      },
      { target: handle, coords: { clientX: imageBounds.left + imageBounds.width * 0.7, clientY: y } },
      {
        keys: "[/MouseLeft]",
        target: handle,
        coords: { clientX: imageBounds.left + imageBounds.width * 0.7, clientY: y },
      },
    ]);
    await waitFor(() => expect(slider).toHaveAttribute("aria-valuenow", "70"));
    await expect(elementAt(afterImage, 0.6, 0.3)).toBe(beforeImage);
    await expect(elementAt(afterImage, 0.8, 0.3)).toBe(afterImage);

    await expectZoomModes(canvas, afterImage, (element) => userEvent.click(element));
  },
};

export const SideBySide: Story = {
  args: { defaultMode: "side-by-side" },
  play: async ({ canvasElement, userEvent, args }) => {
    const canvas = within(canvasElement);
    const afterImage = await findAfterImage(canvas);
    const beforePane = canvas.getByRole("region", { name: /^Before, \d+%$/ });
    const afterPane = canvas.getByRole("region", { name: /^After, \d+%$/ });
    await expect(canvas.getByRole("img", { name: BEFORE_ALT })).toBeVisible();
    await expect(beforePane.getBoundingClientRect().right).toBeLessThanOrEqual(afterPane.getBoundingClientRect().left);
    await expect(beforePane.getBoundingClientRect().top).toBeCloseTo(afterPane.getBoundingClientRect().top, 0);

    const vertical = canvas.getByRole("button", { name: "Vertical" });
    await expect(vertical).toBeEnabled();
    await userEvent.click(vertical);
    await expect(vertical).toHaveAttribute("aria-pressed", "true");
    await expect(args.onOrientationChange).toHaveBeenLastCalledWith("vertical");
    await waitFor(() =>
      expect(beforePane.getBoundingClientRect().bottom).toBeLessThanOrEqual(afterPane.getBoundingClientRect().top),
    );
    await userEvent.click(canvas.getByRole("button", { name: "Horizontal" }));
    await waitFor(() =>
      expect(beforePane.getBoundingClientRect().right).toBeLessThanOrEqual(afterPane.getBoundingClientRect().left),
    );

    await userEvent.click(canvas.getByRole("button", { name: "Original size" }));
    await waitFor(() => expect(beforePane.scrollWidth).toBeGreaterThan(beforePane.clientWidth));
    await waitFor(() => expect(afterPane.scrollLeft).toBe(beforePane.scrollLeft));
    beforePane.scrollTo({ left: 40, top: 30, behavior: "instant" });
    await waitFor(() => {
      expect(afterPane.scrollLeft).toBe(40);
      expect(afterPane.scrollTop).toBe(30);
    });
    afterPane.scrollTo({ left: 120, top: 90, behavior: "instant" });
    await waitFor(() => {
      expect(beforePane.scrollLeft).toBe(120);
      expect(beforePane.scrollTop).toBe(90);
    });
    await expect(getViewport(afterImage)).toBe(afterPane);
  },
};

export const HighlightDifferences: Story = {
  play: async ({ canvasElement, userEvent, args }) => {
    const canvas = within(canvasElement);
    const afterImage = await findAfterImage(canvas);
    const highlight = canvas.getByRole("switch", { name: "Highlight differences" });
    await expect(highlight).not.toBeChecked();
    await userEvent.click(highlight);
    await expect(args.onShowDifferencesChange).toHaveBeenLastCalledWith(true);
    await waitFor(() => expect(highlight).toHaveAccessibleDescription("1 changed region"));
    await expect(canvas.getByText("Changed region")).toBeVisible();

    const regions = canvasElement.querySelectorAll<HTMLElement>("[data-slot=image-difference-region]");
    await expect(regions).toHaveLength(1);
    const image = afterImage.getBoundingClientRect();
    const region = regions[0].getBoundingClientRect();
    await expect((region.left - image.left) / image.width).toBeCloseTo(fixture_changedRegion.x / AFTER_SIZE.width, 2);
    await expect((region.top - image.top) / image.height).toBeCloseTo(fixture_changedRegion.y / AFTER_SIZE.height, 2);
    await expect(region.width / image.width).toBeCloseTo(fixture_changedRegion.width / AFTER_SIZE.width, 2);
    await expect(region.height / image.height).toBeCloseTo(fixture_changedRegion.height / AFTER_SIZE.height, 2);

    await userEvent.pointer({
      keys: "[MouseLeft>]",
      target: canvas.getByRole("button", { name: "Hold to show before" }),
    });
    await expect(canvasElement.querySelectorAll("[data-slot=image-difference-region]")).toHaveLength(1);
    await userEvent.pointer({
      keys: "[/MouseLeft]",
      target: canvas.getByRole("button", { name: "Hold to show before" }),
    });

    await userEvent.click(highlight);
    await expect(highlight).not.toBeChecked();
    await expect(canvasElement.querySelector("[data-slot=image-difference-region]")).toBeNull();
    await expect(highlight).toHaveAccessibleDescription("");
    await userEvent.click(highlight);
    // The cached result returns without measuring again.
    await expect(highlight).toHaveAccessibleDescription("1 changed region");

    await userEvent.click(canvas.getByRole("button", { name: "Side by side" }));
    await waitFor(() => expect(canvasElement.querySelectorAll("[data-slot=image-difference-region]")).toHaveLength(2));
  },
};

export const NoDifferences: Story = {
  args: {
    before: { src: fixture_afterScreenshot, alt: BEFORE_ALT },
    defaultShowDifferences: true,
    defaultMode: "swipe",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await findAfterImage(canvas);
    const highlight = canvas.getByRole("switch", { name: "Highlight differences" });
    await expect(highlight).toBeChecked();
    await waitFor(() => expect(highlight).toHaveAccessibleDescription("No visible differences"));
    await expect(canvasElement.querySelector("[data-slot=image-difference-region]")).toBeNull();
  },
};

export const SizeMismatch: Story = {
  args: { before: { src: fixture_widerBeforeScreenshot, alt: BEFORE_ALT }, defaultMode: "side-by-side" },
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const afterImage = await findAfterImage(canvas);
    await expect(
      await canvas.findByText(
        "Sizes differ: Before 960 × 540, After 960 × 600. Before is fitted inside the After image box.",
      ),
    ).toBeVisible();
    const beforeImage = canvas.getByRole("img", { name: BEFORE_ALT });
    await expect(beforeImage.getBoundingClientRect().width).toBeCloseTo(afterImage.getBoundingClientRect().width, 1);
    await expect(beforeImage.getBoundingClientRect().height).toBeCloseTo(afterImage.getBoundingClientRect().height, 1);
    const highlight = canvas.getByRole("switch", { name: "Highlight differences" });
    await userEvent.click(highlight);
    await waitFor(() => expect(highlight).toHaveAccessibleDescription("5 changed regions"));
  },
};

export const UnreadablePixels: Story = {
  args: { before: { src: fixture_brokenImage, alt: BEFORE_ALT } },
  play: async ({ canvasElement, userEvent, args }) => {
    const canvas = within(canvasElement);
    const highlight = canvas.getByRole("switch", { name: "Highlight differences" });
    await waitFor(() => expect(highlight).toHaveAttribute("aria-disabled", "true"));
    await expect(highlight).toHaveAccessibleDescription("Pixels cannot be read: the Before image could not be loaded.");
    await expect(canvas.getByText("The Before image could not be loaded.")).toBeVisible();
    await userEvent.click(highlight);
    await expect(highlight).not.toBeChecked();
    await expect(args.onShowDifferencesChange).not.toHaveBeenCalled();
  },
};

export const ModeChangesKeepViewedCenter: Story = {
  args: { defaultZoom: 1 },
  play: async ({ canvasElement, userEvent, args }) => {
    const canvas = within(canvasElement);
    const afterImage = await findAfterImage(canvas);
    const toggleViewport = getViewport(afterImage);
    await waitFor(() => expect(toggleViewport.scrollWidth).toBeGreaterThan(toggleViewport.clientWidth));
    toggleViewport.scrollTo({
      left: toggleViewport.scrollWidth,
      top: toggleViewport.scrollHeight,
      behavior: "instant",
    });
    await waitFor(() =>
      expect(toggleViewport.scrollLeft).toBe(toggleViewport.scrollWidth - toggleViewport.clientWidth),
    );
    const expectedCenterX = (toggleViewport.scrollLeft + toggleViewport.clientWidth / 2) / toggleViewport.scrollWidth;
    const expectedCenterY = (toggleViewport.scrollTop + toggleViewport.clientHeight / 2) / toggleViewport.scrollHeight;
    await userEvent.click(canvas.getByRole("button", { name: "Swipe" }));
    await expect(args.onModeChange).toHaveBeenLastCalledWith("swipe");
    const swipeViewport = getViewport(await findAfterImage(canvas));
    await waitFor(() => {
      const targetLeft = Math.min(
        swipeViewport.scrollWidth - swipeViewport.clientWidth,
        Math.max(0, expectedCenterX * swipeViewport.scrollWidth - swipeViewport.clientWidth / 2),
      );
      const targetTop = Math.min(
        swipeViewport.scrollHeight - swipeViewport.clientHeight,
        Math.max(0, expectedCenterY * swipeViewport.scrollHeight - swipeViewport.clientHeight / 2),
      );
      expect(swipeViewport.scrollLeft).toBeCloseTo(targetLeft, 0);
      expect(swipeViewport.scrollTop).toBeCloseTo(targetTop, 0);
    });
    await expect(args.onZoomChange).not.toHaveBeenCalled();
  },
};

export const Controlled: Story = {
  render: (args) => <ControlledComparison {...args} />,
  play: async ({ canvasElement, userEvent, args }) => {
    const canvas = within(canvasElement);
    await findAfterImage(canvas);
    const state = canvas.getByRole("status", { name: "Comparison state" });
    await expect(state).toHaveTextContent("swipe vertical fit differences");
    await expect(canvas.getByRole("switch", { name: "Highlight differences" })).toBeChecked();
    await userEvent.click(canvas.getByRole("button", { name: "Side by side" }));
    await userEvent.click(canvas.getByRole("button", { name: "Horizontal" }));
    await userEvent.click(canvas.getByRole("button", { name: "Original size" }));
    await userEvent.click(canvas.getByRole("switch", { name: "Highlight differences" }));
    await expect(state).toHaveTextContent("side-by-side horizontal 1 plain");
    await expect(args.onModeChange).toHaveBeenLastCalledWith("side-by-side");
    await expect(args.onOrientationChange).toHaveBeenLastCalledWith("horizontal");
    await expect(args.onZoomChange).toHaveBeenLastCalledWith(1);
    await expect(args.onShowDifferencesChange).toHaveBeenLastCalledWith(false);
    await userEvent.click(canvas.getByRole("button", { name: "Toggle" }));
    await expect(state).toHaveTextContent("toggle horizontal 1 plain");
  },
};

export const WithoutToolbar: Story = {
  args: { showToolbar: false, defaultMode: "swipe", beforeLabel: "Baseline", afterLabel: "Candidate" },
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    await findAfterImage(canvas);
    await expect(canvas.queryByRole("group", { name: "Comparison controls" })).toBeNull();
    const slider = canvas.getByRole("slider", { name: "Swipe divider" });
    await expect(slider).toHaveAttribute("aria-valuetext", "Baseline 50%, Candidate 50%");
    await expect(canvas.getByText("Baseline")).toBeVisible();
    await expect(canvas.getByText("Candidate")).toBeVisible();
    slider.focus();
    await userEvent.keyboard("{PageDown}");
    await expect(slider).toHaveAttribute("aria-valuetext", "Baseline 40%, Candidate 60%");
  },
};

export const StepThroughChanges: Story = {
  args: {
    before: { src: fixture_widerBeforeScreenshot, alt: BEFORE_ALT },
    defaultMode: "side-by-side",
    defaultShowDifferences: true,
    onCommentDifference: fn(),
  },
  play: async ({ args, canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    await findAfterImage(canvas);
    const stepper = within(await canvas.findByRole("group", { name: "Changed regions" }));
    await expect(stepper.getByText("Change 1 of 5")).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Next change" }));
    await expect(stepper.getByText("Change 2 of 5")).toBeVisible();
    await expect(canvasElement.querySelector("[data-slot=image-comparison-change-announcement]")).toHaveTextContent(
      "Change 2 of 5",
    );
    const afterStage = canvas.getByRole("region", { name: /^After, \d+%$/ });
    afterStage.focus();
    await userEvent.keyboard("n");
    await expect(stepper.getByText("Change 3 of 5")).toBeVisible();
    await userEvent.keyboard("{Shift>}N{/Shift}");
    await expect(stepper.getByText("Change 2 of 5")).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Comment on change 2 of 5" }));
    await expect(args.onCommentDifference).toHaveBeenCalledTimes(1);
  },
};

export const FullscreenDialog: Story = {
  render: (args) => <FullscreenComparison {...args} />,
  parameters: { docs: { story: { inline: false, height: "560px" } } },
  play: async ({ canvasElement, userEvent }) => {
    await userEvent.click(within(canvasElement).getByRole("button", { name: "Compare screenshots" }));
    const dialog = await within(canvasElement.ownerDocument.body).findByRole("dialog", { name: "Checkout evidence" });
    const content = within(dialog);
    await findAfterImage(content);
    const comparison = content.getByRole("group", { name: "Image comparison" });
    const style = getComputedStyle(dialog);
    const contentBottom =
      dialog.getBoundingClientRect().bottom - parseFloat(style.paddingBottom) - parseFloat(style.borderBottomWidth);
    await expect(comparison.getBoundingClientRect().bottom).toBeCloseTo(contentBottom, 0);
    await userEvent.click(content.getByRole("button", { name: "Swipe" }));
    await expect(await content.findByRole("slider", { name: "Swipe divider" })).toBeVisible();
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(dialog).not.toBeInTheDocument());
  },
};
