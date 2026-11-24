import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, waitFor, within } from "storybook/test";
import { useState, type ReactElement } from "react";
import { ImageGallery, MediaShell, type IImageGalleryItem, type IImageGalleryProps } from "../../image-viewer";
import { Button } from "../../Button";
import { fixture_afterScreenshot, fixture_beforeScreenshot, fixture_largeScreenshot } from "../fixtures";

const ITEMS: IImageGalleryItem[] = [
  { key: "quiet", src: fixture_beforeScreenshot, alt: "Quiet", label: "Quiet" },
  { key: "bold", src: fixture_afterScreenshot, alt: "Bold", label: "Bold" },
  { key: "playful", src: fixture_largeScreenshot, alt: "Playful", label: "Playful" },
];

const chooseSpy = fn();

type Canvas = ReturnType<typeof within>;

async function findShown(canvas: Canvas, name: string): Promise<HTMLElement> {
  const image = await canvas.findByRole("img", { name });
  await waitFor(() => expect(image.getBoundingClientRect().width).toBeGreaterThan(0));
  return image;
}

interface IGalleryDemoProps extends Omit<IImageGalleryProps, "index" | "onIndexChange" | "toolbar"> {
  onIndexChange?: (index: number) => void;
  onChoose?: (key: string) => void;
}

/** A gallery inside the media shell, titled by the shown item, with a Choose action for it. */
function GalleryInShell({ items, onIndexChange, onChoose, ...props }: IGalleryDemoProps): ReactElement {
  const [isOpen, setIsOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const [chosen, setChosen] = useState<string>();
  const item = items[index];
  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Open options</Button>
      <MediaShell
        open={isOpen}
        onOpenChange={setIsOpen}
        title={item ? `${item.label} · ${index + 1} of ${items.length}` : "Options"}
        description="Left and Right step through the options at Fit."
      >
        <ImageGallery
          {...props}
          items={items}
          index={index}
          previousLabel="Previous option"
          nextLabel="Next option"
          onIndexChange={(next) => {
            setIndex(next);
            onIndexChange?.(next);
          }}
          toolbar={
            item && (
              <Button
                size="sm"
                disabledReason={chosen === item.key ? `${item.label} is your answer` : undefined}
                onClick={() => {
                  setChosen(item.key);
                  onChoose?.(item.key);
                }}
              >
                {chosen === item.key ? `${item.label} chosen` : `Choose ${item.label}`}
              </Button>
            )
          }
          renderItemFooter={(entry) => (
            <Button
              size="sm"
              disabledReason={chosen === entry.key ? `${entry.label} is your answer` : undefined}
              onClick={() => {
                setChosen(entry.key);
                onChoose?.(entry.key);
              }}
            >
              {chosen === entry.key ? `${entry.label} chosen` : `Choose ${entry.label}`}
            </Button>
          )}
        />
      </MediaShell>
    </>
  );
}

const meta: Meta<typeof ImageGallery> = {
  title: "@alexgorbatchev/shadcn/components/data-display/ImageGallery",
  component: ImageGallery,
  tags: ["autodocs", "test"],
  parameters: {
    docs: {
      description: {
        component:
          'Import `ImageGallery` and `MediaShell` from `@alexgorbatchev/shadcn/image-viewer`. `MediaShell` is the full-screen shell every image, comparison, gallery and diagram opens in: `title` (one line, truncated) and an optional `description` in the header, an always visible Close, and `children` filling the stage; `onOpenChange` receives Base UI\'s change details, so Escape can close an inner layer first with `details.cancel()`. `ImageGallery` steps through `items` (`{ key, src, alt, label }`) in one `ImageViewer` at the controlled `index`, keeping the zoom and viewed position between items so the same area of each can be compared. Its toolbar holds the zoom bar, Previous, "n of m" and Next (named by `previousLabel` and `nextLabel`, disabled with a reason at either end), an optional "Compare all" toggle (enabled by `allowCompareAll` or `renderItemFooter`) that shows every item side by side with synchronized scrolling and per-item footers, and then `toolbar`, such as a Choose action; Left and Right step on the focused stage only at Fit, where arrows do not pan, and each step is announced politely as "<label> · n of m". `overlay`, `imageRef`, `stageRef`, `onStageKeyDown` and `stageKeyShortcuts` pass to the viewer. Name the shell after the shown item.',
      },
    },
  },
  args: { items: ITEMS, index: 0, onIndexChange: fn() },
  render: (args) => <GalleryInShell items={args.items} onIndexChange={args.onIndexChange} />,
};
export default meta;
type Story = StoryObj<typeof ImageGallery>;

export const StepAndChoose: Story = {
  render: (args) => <GalleryInShell items={args.items} onIndexChange={args.onIndexChange} onChoose={chooseSpy} />,
  play: async ({ args, canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Open options" }));
    const body = within(canvasElement.ownerDocument.body);
    const shell = await body.findByRole("dialog", { name: "Quiet · 1 of 3" });
    const dialog = within(shell);
    await findShown(dialog, "Quiet");
    await expect(dialog.getByText("1 of 3")).toBeVisible();
    await expect(dialog.getByRole("button", { name: "Previous option" })).toHaveAttribute("aria-disabled", "true");

    await userEvent.click(dialog.getByRole("button", { name: "Next option" }));
    await findShown(dialog, "Bold");
    await expect(shell).toHaveAccessibleName("Bold · 2 of 3");
    await expect(args.onIndexChange).toHaveBeenLastCalledWith(1);
    await expect(shell.querySelector("[data-slot=image-gallery-status]")).toHaveTextContent("Bold · 2 of 3");

    await userEvent.click(dialog.getByRole("button", { name: "Choose Bold" }));
    await expect(chooseSpy).toHaveBeenLastCalledWith("bold");
    const chosen = dialog.getByRole("button", { name: "Bold chosen" });
    await expect(chosen).toHaveAttribute("aria-disabled", "true");
    await expect(chosen).toHaveAccessibleDescription("Bold is your answer");

    // At Fit, Left and Right on the stage step options.
    const stage = dialog.getByRole("region", { name: /^Bold, \d+%$/ });
    stage.focus();
    await userEvent.keyboard("{ArrowRight}");
    await findShown(dialog, "Playful");
    await expect(dialog.getByText("3 of 3")).toBeVisible();
    await expect(dialog.getByRole("button", { name: "Next option" })).toHaveAttribute("aria-disabled", "true");
    // Past the last item nothing happens.
    dialog.getByRole("region", { name: /^Playful, \d+%$/ }).focus();
    await userEvent.keyboard("{ArrowRight}");
    await expect(dialog.getByText("3 of 3")).toBeVisible();
    await userEvent.keyboard("{ArrowLeft}");
    await findShown(dialog, "Bold");

    // Zoomed in, arrows pan instead, and stepping keeps the zoom.
    await userEvent.click(dialog.getByRole("button", { name: "Zoom in" }));
    const zoomed = await dialog.findByRole("region", { name: /^Bold, (?!100%)\d+%$/ });
    const percent = zoomed.getAttribute("aria-label")?.split(", ")[1];
    zoomed.focus();
    await userEvent.keyboard("{ArrowLeft}");
    await expect(dialog.getByText("2 of 3")).toBeVisible();
    await userEvent.click(dialog.getByRole("button", { name: "Previous option" }));
    await findShown(dialog, "Quiet");
    await expect(dialog.getByRole("region", { name: `Quiet, ${percent}` })).toBeVisible();

    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(body.queryByRole("dialog")).toBeNull());
  },
};

export const CompareAll: Story = {
  render: (args) => <GalleryInShell items={args.items} onIndexChange={args.onIndexChange} onChoose={chooseSpy} />,
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Open options" }));
    const body = within(canvasElement.ownerDocument.body);
    const shell = await body.findByRole("dialog", { name: "Quiet · 1 of 3" });
    const dialog = within(shell);
    await findShown(dialog, "Quiet");
    await userEvent.click(dialog.getByRole("button", { name: "Compare all" }));
    await findShown(dialog, "Quiet");
    await findShown(dialog, "Bold");
    await findShown(dialog, "Playful");
    await expect(dialog.getByRole("button", { name: "Choose Quiet" })).toBeVisible();
    await expect(dialog.getByRole("button", { name: "Choose Bold" })).toBeVisible();
    await expect(dialog.getByRole("button", { name: "Choose Playful" })).toBeVisible();
    await userEvent.click(dialog.getByRole("button", { name: "Choose Bold" }));
    await expect(chooseSpy).toHaveBeenLastCalledWith("bold");
    await expect(dialog.getByRole("button", { name: "Bold chosen" })).toHaveAttribute("aria-disabled", "true");
    await userEvent.click(dialog.getByRole("button", { name: "Compare all" }));
    await expect(dialog.getByText("1 of 3")).toBeVisible();
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(body.queryByRole("dialog")).toBeNull());
  },
};

export const Empty: Story = {
  args: { items: [] },
  render: (args) => (
    <div className="h-64">
      <ImageGallery items={args.items} index={0} onIndexChange={args.onIndexChange} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector("[data-slot=image-gallery]")).not.toBeNull();
    await expect(within(canvasElement).queryByRole("img")).toBeNull();
  },
};
