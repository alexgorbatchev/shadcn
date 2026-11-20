import type { ReactElement } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { Button } from "../../Button";
import { Checkbox } from "../../Checkbox";
import { Input } from "../../Input";
import { OptionCard, OptionCardGroup } from "../../OptionCardGroup";
import { RadioGroup, RadioGroupItem } from "../../RadioGroup";
import { Textarea } from "../../Textarea";
import { Toggle } from "../../Toggle";
import { ToggleGroup, ToggleGroupItem } from "../../ToggleGroup";
import { Toolbar, ToolbarButton, ToolbarGroup, ToolbarLink } from "../../Toolbar";

// WCAG 1.4.11: the visual boundary that identifies an interactive control needs 3:1 against the surface around it.
const minimumBoundaryContrast = 3;

type Rgb = readonly [number, number, number];

// Resolves any CSS colour, including translucent and color-mix() values, to the sRGB pixel it paints over `under`.
function paint(color: string, under: Rgb): Rgb {
  const canvas = document.createElement("canvas");
  canvas.width = 1;
  canvas.height = 1;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("A 2D canvas context is required to measure colours.");
  context.fillStyle = `rgb(${under.join(" ")})`;
  context.fillRect(0, 0, 1, 1);
  context.fillStyle = color;
  context.fillRect(0, 0, 1, 1);
  const [red = 0, green = 0, blue = 0] = context.getImageData(0, 0, 1, 1).data;
  return [red, green, blue];
}

function luminance([red, green, blue]: Rgb): number {
  const channel = (value: number): number => {
    const srgb = value / 255;
    return srgb <= 0.04045 ? srgb / 12.92 : ((srgb + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(red) + 0.7152 * channel(green) + 0.0722 * channel(blue);
}

function contrast(first: Rgb, second: Rgb): number {
  const [lighter, darker] = [luminance(first), luminance(second)].sort((a, b) => b - a);
  return ((lighter ?? 0) + 0.05) / ((darker ?? 0) + 0.05);
}

// The surface a control sits on: the nearest ancestor that paints a background, composited down to the page.
function surfaceBehind(element: Element): Rgb {
  const layers: string[] = [];
  for (let node = element.parentElement; node; node = node.parentElement) {
    const background = getComputedStyle(node).backgroundColor;
    layers.push(background);
    if (paint(background, [0, 0, 0]).join() === paint(background, [255, 255, 255]).join()) break;
  }
  return layers.reduceRight<Rgb>((under, layer) => paint(layer, under), [255, 255, 255]);
}

/** The strongest of a control's border and fill contrast against the surface behind it. */
function boundaryContrast(element: Element): number {
  const style = getComputedStyle(element);
  const surface = surfaceBehind(element);
  const borderWidth = Number.parseFloat(style.borderTopWidth);
  const border = borderWidth > 0 ? contrast(paint(style.borderTopColor, surface), surface) : 1;
  const fill = contrast(paint(style.backgroundColor, surface), surface);
  return Math.max(border, fill);
}

function ControlBoundaryGallery(): ReactElement {
  return (
    <div className="flex max-w-xl flex-col gap-4 p-panel">
      <Input data-boundary="Input" aria-label="Project name" placeholder="Project name" />
      <Textarea data-boundary="Textarea" aria-label="Notes" placeholder="Notes" />
      <div className="flex flex-wrap items-center gap-2">
        <Button data-boundary="Outline button" variant="outline">
          Later
        </Button>
        <Checkbox data-boundary="Checkbox" aria-label="Notify me" />
        <RadioGroup aria-label="Channel" className="flex gap-4">
          <RadioGroupItem data-boundary="Radio" value="email" aria-label="Email" />
        </RadioGroup>
      </div>
      <OptionCardGroup aria-label="Strategy" defaultValue="rolling">
        <OptionCard data-boundary="Selected option card" value="rolling" label="Rolling update" />
        <OptionCard data-boundary="Option card" value="recreate" label="Recreate" />
        <OptionCard data-boundary="Recommended option card" value="blue-green" label="Blue-green" recommended />
      </OptionCardGroup>
      <ToggleGroup aria-label="Channels" variant="outline" multiple defaultValue={["email"]}>
        <ToggleGroupItem data-boundary="Pressed toggle group item" value="email">
          Email
        </ToggleGroupItem>
        <ToggleGroupItem data-boundary="Toggle group item" value="phone">
          Phone
        </ToggleGroupItem>
      </ToggleGroup>
      <Toggle data-boundary="Pressed borderless toggle" aria-label="Bold" defaultPressed>
        B
      </Toggle>
      <Toolbar aria-label="Pages tools" variant="plain">
        <ToolbarGroup>
          <ToolbarButton data-boundary="Toolbar button">Find a page…</ToolbarButton>
          <ToolbarButton data-boundary="Pressed toolbar button" aria-pressed>
            Show archived
          </ToolbarButton>
          <ToolbarButton data-boundary="Pressed icon toolbar button" variant="ghost" aria-label="Italic" aria-pressed>
            I
          </ToolbarButton>
          <ToolbarLink data-boundary="Toolbar link" href="#help">
            Help
          </ToolbarLink>
        </ToolbarGroup>
      </Toolbar>
    </div>
  );
}

const meta: Meta<typeof ControlBoundaryGallery> = {
  title: "@alexgorbatchev/shadcn/components/forms/ControlBoundaries",
  component: ControlBoundaryGallery,
  tags: ["test"],
  parameters: {
    docs: {
      description: {
        component:
          "Every interactive control's resting boundary, and every pressed toggle's state, measures at least 3:1 against its surface in the current theme. The contrast suite runs it in light and dark.",
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof ControlBoundaryGallery>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    // Native-input controls repeat the attribute on their hidden input; only visible boxes carry a boundary.
    const controls = Array.from(canvasElement.querySelectorAll("[data-boundary]")).filter(
      (control) => control.getBoundingClientRect().width > 1,
    );
    await expect(new Set(controls.map((control) => control.getAttribute("data-boundary"))).size).toBe(15);
    const measured = controls.map((control) => ({
      control: control.getAttribute("data-boundary"),
      passes: boundaryContrast(control) >= minimumBoundaryContrast,
    }));
    await expect(measured.filter((entry) => !entry.passes)).toEqual([]);
    await expect(within(canvasElement).getByRole("button", { name: "Show archived" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  },
};
