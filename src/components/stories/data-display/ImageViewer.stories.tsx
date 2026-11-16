import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, waitFor, within } from "storybook/test";
import { useState, type ReactElement } from "react";
import {
  ImageViewer,
  ImageZoomToggle,
  getNormalizedImagePoint,
  type IImageViewerProps,
  type INormalizedImagePoint,
  type ImageZoom,
} from "../../image-viewer";
import { Button } from "../../Button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../../Dialog";
import { fixture_brokenImage, fixture_largeScreenshot, fixture_smallScreenshot } from "./fixtures/screenshots";

const LARGE_SIZE = { width: 1600, height: 1000 };

async function findRenderedImage(canvasElement: HTMLElement, name: string): Promise<HTMLElement> {
  const image = await within(canvasElement.ownerDocument.body).findByRole("img", { name });
  await waitFor(() => expect(image.getBoundingClientRect().width).toBeGreaterThan(0));
  return image;
}

async function expectFitted(image: HTMLElement, aspectRatio: number): Promise<void> {
  const viewport = image.closest<HTMLElement>("[data-slot=image-viewport]");
  await expect(viewport).not.toBeNull();
  if (!viewport) return;
  await waitFor(() => {
    const bounds = image.getBoundingClientRect();
    const frame = viewport.getBoundingClientRect();
    expect(bounds.width).toBeLessThanOrEqual(viewport.clientWidth + 0.5);
    expect(bounds.height).toBeLessThanOrEqual(viewport.clientHeight + 0.5);
    expect(bounds.width / bounds.height).toBeCloseTo(aspectRatio, 2);
    expect(Math.max(bounds.width / viewport.clientWidth, bounds.height / viewport.clientHeight)).toBeCloseTo(1, 2);
    expect(bounds.left - frame.left).toBeCloseTo((viewport.clientWidth - bounds.width) / 2, 0);
    expect(bounds.top - frame.top).toBeCloseTo((viewport.clientHeight - bounds.height) / 2, 0);
    expect(viewport.scrollWidth).toBeLessThanOrEqual(viewport.clientWidth);
    expect(viewport.scrollHeight).toBeLessThanOrEqual(viewport.clientHeight);
  });
}

async function expectOriginalCentered(image: HTMLElement): Promise<void> {
  const viewport = image.closest<HTMLElement>("[data-slot=image-viewport]");
  await expect(viewport).not.toBeNull();
  if (!viewport) return;
  await waitFor(() => {
    const bounds = image.getBoundingClientRect();
    expect(bounds.width).toBe(LARGE_SIZE.width);
    expect(bounds.height).toBe(LARGE_SIZE.height);
    expect(viewport.scrollWidth).toBeGreaterThan(viewport.clientWidth);
    expect(viewport.scrollHeight).toBeGreaterThan(viewport.clientHeight);
    expect(Math.abs(viewport.scrollLeft - (LARGE_SIZE.width - viewport.clientWidth) / 2)).toBeLessThanOrEqual(1);
    expect(Math.abs(viewport.scrollTop - (LARGE_SIZE.height - viewport.clientHeight) / 2)).toBeLessThanOrEqual(1);
  });
}

function OverlayExample(props: IImageViewerProps): ReactElement {
  const [zoom, setZoom] = useState<ImageZoom>("fit");
  const [point, setPoint] = useState<INormalizedImagePoint>();
  return (
    <div className="flex h-96 flex-col gap-2">
      <ImageZoomToggle zoom={zoom} onZoomChange={setZoom} />
      <ImageViewer
        {...props}
        zoom={zoom}
        onZoomChange={setZoom}
        overlay={
          <div
            aria-label="Select a point"
            className="absolute inset-0 cursor-crosshair"
            onPointerDown={(event) =>
              setPoint(getNormalizedImagePoint(event, event.currentTarget.getBoundingClientRect()))
            }
          >
            {point && (
              <span
                aria-hidden="true"
                className="absolute size-3 -translate-1/2 rounded-full border-2 border-background bg-primary"
                style={{ left: `${point.x * 100}%`, top: `${point.y * 100}%` }}
              />
            )}
          </div>
        }
      />
      <output aria-label="Selected point" className="text-sm">
        {point ? `${point.x.toFixed(2)}, ${point.y.toFixed(2)}` : "None"}
      </output>
    </div>
  );
}

function FullscreenExample(props: IImageViewerProps): ReactElement {
  const [zoom, setZoom] = useState<ImageZoom>("fit");
  return (
    <Dialog>
      <DialogTrigger render={<Button />}>Open screenshot</DialogTrigger>
      <DialogContent size="fullscreen">
        <DialogHeader>
          <DialogTitle>Dashboard screenshot</DialogTitle>
          <ImageZoomToggle zoom={zoom} onZoomChange={setZoom} />
        </DialogHeader>
        <ImageViewer {...props} zoom={zoom} onZoomChange={setZoom} />
      </DialogContent>
    </Dialog>
  );
}

const meta: Meta<typeof ImageViewer> = {
  title: "@alexgorbatchev/shadcn/components/data-display/ImageViewer",
  component: ImageViewer,
  tags: ["autodocs", "test"],
  parameters: {
    docs: {
      description: {
        component:
          'Import from `@alexgorbatchev/shadcn/image-viewer`. ImageViewer fills the container it is given, such as a `DialogContent size="fullscreen"` body, and shows one image in a native scroll viewport. `fit` (the default) scales the image down proportionally to fit both dimensions, centered and without scrollbars, and never upscales it; `original` shows natural size in CSS pixels, centered on axes where it is smaller and scrolling where it is larger. Switching zoom keeps the viewed center. Control zoom with `zoom` and `onZoomChange`, or leave it uncontrolled with `defaultZoom`; place `ImageZoomToggle` in a header or toolbar, or set `showZoomControl` for the built-in toggle. `overlay` renders content sized and positioned exactly over the rendered image at every zoom, `imageRef` and `overlayRef` expose the rendered image box, and `getNormalizedImagePoint(event, box)` maps pointer coordinates to 0–1 image coordinates.',
      },
    },
  },
  args: { src: fixture_largeScreenshot, alt: "Dashboard screenshot", onZoomChange: fn() },
  argTypes: {
    defaultZoom: { control: "inline-radio", options: ["fit", "original"] },
    showZoomControl: { control: "boolean" },
    density: { control: "select", options: ["compact", "comfortable"] },
  },
  render: (args) => (
    <div className="h-80 w-full border border-border">
      <ImageViewer {...args} />
    </div>
  ),
};
export default meta;
type Story = StoryObj<typeof ImageViewer>;

export const FitToScreen: Story = {
  play: async ({ canvasElement }) => {
    const image = await findRenderedImage(canvasElement, "Dashboard screenshot");
    await expectFitted(image, LARGE_SIZE.width / LARGE_SIZE.height);
    await expect(within(canvasElement).getByRole("region", { name: "Dashboard screenshot" })).toHaveAttribute(
      "data-zoom",
      "fit",
    );
  },
};

export const OriginalSize: Story = {
  args: { defaultZoom: "original" },
  play: async ({ canvasElement, userEvent }) => {
    const image = await findRenderedImage(canvasElement, "Dashboard screenshot");
    await expectOriginalCentered(image);
    const viewport = within(canvasElement).getByRole("region", { name: "Dashboard screenshot" });
    await userEvent.tab();
    await expect(viewport).toHaveFocus();
    await expect(viewport).toHaveAttribute("data-zoom", "original");
  },
};

export const SmallImage: Story = {
  args: { src: fixture_smallScreenshot, alt: "Toolbar screenshot" },
  play: async ({ canvasElement }) => {
    const image = await findRenderedImage(canvasElement, "Toolbar screenshot");
    const viewport = within(canvasElement).getByRole("region", { name: "Toolbar screenshot" });
    await waitFor(() => {
      const bounds = image.getBoundingClientRect();
      const frame = viewport.getBoundingClientRect();
      expect(bounds.width).toBe(240);
      expect(bounds.height).toBe(150);
      expect(bounds.left - frame.left).toBeCloseTo((viewport.clientWidth - 240) / 2, 0);
      expect(bounds.top - frame.top).toBeCloseTo((viewport.clientHeight - 150) / 2, 0);
    });
  },
};

export const BuiltInZoomControl: Story = {
  args: { showZoomControl: true },
  play: async ({ canvasElement, userEvent, args }) => {
    const canvas = within(canvasElement);
    const image = await findRenderedImage(canvasElement, "Dashboard screenshot");
    const fit = canvas.getByRole("button", { name: "Fit to screen" });
    const original = canvas.getByRole("button", { name: "Original size" });
    await expect(canvas.getByRole("group", { name: "Zoom" })).toBeVisible();
    await expect(fit).toHaveAttribute("aria-pressed", "true");
    await expect(original).toHaveAttribute("aria-pressed", "false");
    await userEvent.click(original);
    await expect(original).toHaveAttribute("aria-pressed", "true");
    await expect(fit).toHaveAttribute("aria-pressed", "false");
    await expect(args.onZoomChange).toHaveBeenLastCalledWith("original");
    await expectOriginalCentered(image);
    await userEvent.keyboard("{ArrowLeft}");
    await expect(fit).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await expect(fit).toHaveAttribute("aria-pressed", "true");
    await expect(args.onZoomChange).toHaveBeenLastCalledWith("fit");
    await expectFitted(image, LARGE_SIZE.width / LARGE_SIZE.height);
    await userEvent.click(fit);
    await expect(fit).toHaveAttribute("aria-pressed", "true");
  },
};

export const RestoresViewedCenter: Story = {
  args: { showZoomControl: true, defaultZoom: "original" },
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const image = await findRenderedImage(canvasElement, "Dashboard screenshot");
    await expectOriginalCentered(image);
    const viewport = canvas.getByRole("region", { name: "Dashboard screenshot" });
    viewport.scrollTo({ left: 0, top: 0, behavior: "instant" });
    await waitFor(() => expect(viewport.scrollLeft).toBe(0));
    await userEvent.click(canvas.getByRole("button", { name: "Fit to screen" }));
    await expectFitted(image, LARGE_SIZE.width / LARGE_SIZE.height);
    await userEvent.click(canvas.getByRole("button", { name: "Original size" }));
    await expectOriginalCentered(image);
  },
};

export const OverlayCoordinates: Story = {
  render: (args) => <OverlayExample {...args} />,
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const image = await findRenderedImage(canvasElement, "Dashboard screenshot");
    const overlay = canvas.getByLabelText("Select a point");
    const output = canvas.getByRole("status", { name: "Selected point" });
    for (const zoom of ["Fit to screen", "Original size"]) {
      await userEvent.click(canvas.getByRole("button", { name: zoom }));
      await waitFor(() => expect(overlay.getBoundingClientRect().width).toBeGreaterThan(0));
      await waitFor(() =>
        expect(overlay.getBoundingClientRect().toJSON()).toEqual(image.getBoundingClientRect().toJSON()),
      );
      const bounds = overlay.getBoundingClientRect();
      await userEvent.pointer({
        keys: "[MouseLeft]",
        target: overlay,
        coords: { clientX: bounds.left + bounds.width * 0.45, clientY: bounds.top + bounds.height * 0.48 },
      });
      await expect(output).toHaveTextContent("0.45, 0.48");
      await userEvent.pointer({
        keys: "[MouseLeft]",
        target: overlay,
        coords: { clientX: bounds.right + 40, clientY: bounds.top - 40 },
      });
      await expect(output).toHaveTextContent("1.00, 0.00");
    }
  },
};

export const FullscreenDialog: Story = {
  render: (args) => <FullscreenExample {...args} />,
  parameters: { docs: { story: { inline: false, height: "480px" } } },
  play: async ({ canvasElement, userEvent }) => {
    await userEvent.click(within(canvasElement).getByRole("button", { name: "Open screenshot" }));
    const dialog = await within(canvasElement.ownerDocument.body).findByRole("dialog", {
      name: "Dashboard screenshot",
    });
    const image = await findRenderedImage(canvasElement, "Dashboard screenshot");
    const viewport = within(dialog).getByRole("region", { name: "Dashboard screenshot" });
    const style = getComputedStyle(dialog);
    const contentBottom =
      dialog.getBoundingClientRect().bottom - parseFloat(style.paddingBottom) - parseFloat(style.borderBottomWidth);
    await waitFor(() => expect(viewport.getBoundingClientRect().bottom).toBeCloseTo(contentBottom, 0));
    await expectFitted(image, LARGE_SIZE.width / LARGE_SIZE.height);
    await userEvent.click(within(dialog).getByRole("button", { name: "Original size" }));
    await expectOriginalCentered(image);
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(dialog).not.toBeInTheDocument());
  },
};

export const LoadError: Story = {
  args: { src: fixture_brokenImage, alt: "Missing screenshot" },
  play: async ({ canvasElement }) => {
    const viewport = within(canvasElement).getByRole("region", { name: "Missing screenshot" });
    await expect(await within(viewport).findByText("Image could not be loaded.")).toBeVisible();
    await expect(viewport.closest("[data-slot=image-viewer]")).toHaveAttribute("data-status", "error");
  },
};
