import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { Button } from "../../Button";
import { ImageRegionMarker, ImageRegionMarkerBadge } from "../../image-viewer";

const screenshots = [
  { label: "White screenshot", background: "#ffffff" },
  { label: "Dark chart", background: "#1e293b" },
] as const;

const meta: Meta<typeof ImageRegionMarker> = {
  title: "@alexgorbatchev/shadcn/components/data-display/ImageRegionMarker",
  component: ImageRegionMarker,
  tags: ["autodocs", "test"],
  parameters: {
    docs: {
      description: {
        component:
          "Import from `@alexgorbatchev/shadcn/image-viewer`. Outlines a region over an image: a 2px outline 1px outside the region over a 4px halo in the page background, so the outline keeps 3:1 against any screenshot in both themes; forced colours draw it in Highlight. Variants: `comment` (a saved comment's region), `draft` (dashed, a region being drawn) and `difference` (changed pixels, used by ImageComparison's Highlight differences). Position it with `style` over a positioned image box. `ImageRegionMarkerBadge` pins an interactive control, such as a comment count, beside the marker with the same outline and halo. The theme's `target-emphasis` utility is the matching two-tone mark for a jump target on the page.",
      },
    },
  },
  args: { variant: "comment" },
  argTypes: { variant: { control: "inline-radio", options: ["comment", "draft", "difference"] } },
  render: (args) => (
    <div className="flex flex-wrap gap-6">
      {screenshots.map((screenshot) => (
        <figure key={screenshot.label} className="flex flex-col gap-2">
          <div
            role="img"
            aria-label={screenshot.label}
            className="relative h-40 w-72"
            style={{ background: screenshot.background }}
          >
            <ImageRegionMarker {...args} style={{ left: "20%", top: "35%", width: "45%", height: "30%" }}>
              <ImageRegionMarkerBadge style={{ left: "calc(100% + 8px)", top: -32 }}>
                <Button size="sm" variant="secondary" aria-label={`Open comments on ${screenshot.label}`}>
                  3
                </Button>
              </ImageRegionMarkerBadge>
            </ImageRegionMarker>
          </div>
          <figcaption className="text-sm text-muted-foreground">{screenshot.label}</figcaption>
        </figure>
      ))}
    </div>
  ),
};
export default meta;
type Story = StoryObj<typeof ImageRegionMarker>;

export const Comment: Story = {
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const markers = canvasElement.querySelectorAll<HTMLElement>("[data-slot=image-region-marker]");
    await expect(markers).toHaveLength(2);
    for (const marker of markers) {
      await expect(marker).toHaveAttribute("data-variant", "comment");
      await expect(getComputedStyle(marker).pointerEvents).toBe("none");
    }
    const badge = canvas.getByRole("button", { name: "Open comments on Dark chart" });
    await userEvent.click(badge);
    await expect(badge).toHaveFocus();
  },
};

export const Draft: Story = {
  args: { variant: "draft" },
  play: async ({ canvasElement }) => {
    const marker = canvasElement.querySelector<HTMLElement>("[data-slot=image-region-marker]");
    await expect(marker).toHaveAttribute("data-variant", "draft");
    await expect(getComputedStyle(marker ?? canvasElement).outlineStyle).toBe("dashed");
  },
};

export const Difference: Story = {
  args: { variant: "difference" },
  play: async ({ canvasElement }) => {
    const marker = canvasElement.querySelector<HTMLElement>("[data-slot=image-region-marker]");
    await expect(marker).toHaveAttribute("data-variant", "difference");
    await expect(getComputedStyle(marker ?? canvasElement).outlineStyle).toBe("solid");
  },
};

export const TargetEmphasis: Story = {
  render: () => (
    <div className="flex flex-col gap-6 p-4">
      <p className="w-fit target-emphasis">A paragraph a jump landed on keeps a two-tone mark until you move on.</p>
      <div className="h-24 w-72 target-emphasis" style={{ background: "#1e293b" }} role="img" aria-label="Dark chart" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const style = getComputedStyle(canvas.getByRole("img", { name: "Dark chart" }));
    await expect(style.outlineWidth).toBe("2px");
    await expect(style.outlineOffset).toBe("2px");
    await expect(style.boxShadow).toContain("2px");
  },
};
