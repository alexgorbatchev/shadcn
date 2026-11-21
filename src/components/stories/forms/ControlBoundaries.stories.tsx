import { useState } from "react";
import type { ReactElement } from "react";
import { EllipsisIcon } from "lucide-react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { Button } from "../../Button";
import { ButtonGroup } from "../../ButtonGroup";
import { Checkbox } from "../../Checkbox";
import { Input } from "../../Input";
import { OptionCard, OptionCardGroup } from "../../OptionCardGroup";
import { RadioGroup, RadioGroupItem } from "../../RadioGroup";
import { Textarea } from "../../Textarea";
import { Toggle } from "../../Toggle";
import { ToggleGroup, ToggleGroupItem } from "../../ToggleGroup";
import { Toolbar, ToolbarButton, ToolbarGroup, ToolbarLink } from "../../Toolbar";
import {
  boundaryContrast,
  findBorderlessTextButtons,
  minimumBoundaryContrast,
} from "../../../../.storybook/controlBoundary";
import { findMismatchedSiblingHeights } from "../../../../.storybook/controlHeights";

function ControlBoundaryGallery(): ReactElement {
  return (
    <div className="flex max-w-xl flex-col gap-4 p-panel">
      <Input data-boundary="Input" aria-label="Project name" placeholder="Project name" />
      <Textarea data-boundary="Textarea" aria-label="Notes" placeholder="Notes" />
      {/* Shows the boundary of each size side by side, so its sizes differ on purpose. */}
      <div data-size-showcase className="flex flex-wrap items-center gap-2">
        <Button data-boundary="Outline button" variant="outline">
          Later
        </Button>
        <Button data-boundary="Ghost text button" variant="ghost">
          Cancel
        </Button>
        <Button data-boundary="Small ghost text button" variant="ghost" size="sm">
          Close
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
    await expect(new Set(controls.map((control) => control.getAttribute("data-boundary"))).size).toBe(17);
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

function BorderlessTextDetection(): ReactElement {
  const [showsLabelLikeButton, setShowsLabelLikeButton] = useState(true);
  return (
    // Shows label-like and boundaryless controls side by side, so its sizes differ on purpose.
    <div data-size-showcase className="flex flex-wrap items-center gap-2 p-panel">
      {showsLabelLikeButton && <Button variant="plain">Looks like a label</Button>}
      <Button variant="ghost" size="icon-sm" aria-label="More actions">
        <EllipsisIcon />
      </Button>
      <Button variant="ghost" size="inline">
        Show details
      </Button>
      <Button variant="link">Read the guide</Button>
      <Button variant="outline" onClick={() => setShowsLabelLikeButton(false)}>
        Remove the label-like button
      </Button>
    </div>
  );
}

/**
 * The catalog-wide check: a text button with no border, no fill and no link styling is reported; icon buttons and
 * link-styled actions are not. Every story test runs this check after it finishes.
 */
export const BorderlessTextButtonsAreReported: Story = {
  render: () => <BorderlessTextDetection />,
  play: async ({ canvasElement, userEvent }) => {
    await expect(findBorderlessTextButtons(canvasElement)).toEqual(["Looks like a label"]);
    await userEvent.click(within(canvasElement).getByRole("button", { name: "Remove the label-like button" }));
    await expect(findBorderlessTextButtons(canvasElement)).toEqual([]);
  },
};

function SiblingHeightDetection(): ReactElement {
  const [isMismatched, setMismatched] = useState(true);
  return (
    <div className="flex flex-col gap-3 p-panel">
      {/* A composer row: Close at the default size beside a small Post comment until the sizes are matched. */}
      <div className="flex items-center gap-2">
        <Button size="sm">Post comment</Button>
        <Button variant="outline" size={isMismatched ? "default" : "sm"}>
          Close
        </Button>
      </div>
      <Button variant="outline" size="sm" className="self-start" onClick={() => setMismatched(false)}>
        Match the sizes
      </Button>
    </div>
  );
}

/** Sibling buttons of different heights on one row are reported until they share a size (visual QA "sizing"). */
export const SiblingHeightsAreReported: Story = {
  render: () => <SiblingHeightDetection />,
  play: async ({ canvasElement, userEvent }) => {
    await expect(findMismatchedSiblingHeights(canvasElement)).toEqual([
      { label: "Close", height: 28, siblingLabel: "Post comment", siblingHeight: 26 },
    ]);
    await userEvent.click(within(canvasElement).getByRole("button", { name: "Match the sizes" }));
    await expect(findMismatchedSiblingHeights(canvasElement)).toEqual([]);
  },
};

/** One size on a group: filled, outline and icon buttons that name no size share its height. */
export const GroupSizeSharesOneHeight: Story = {
  render: () => (
    <ButtonGroup size="sm" aria-label="Comment actions">
      <Button>Comment on whole page</Button>
      <Button variant="outline">Comment on…</Button>
      <Button variant="outline" size="icon-sm" aria-label="More">
        <EllipsisIcon />
      </Button>
    </ButtonGroup>
  ),
  play: async ({ canvasElement }) => {
    const heights = [...canvasElement.querySelectorAll("[data-slot='button']")].map(
      (button) => button.getBoundingClientRect().height,
    );
    await expect(new Set(heights).size).toBe(1);
    await expect(canvasElement.querySelector("[data-slot='button']")).toHaveAttribute("data-size", "sm");
    await expect(findMismatchedSiblingHeights(canvasElement)).toEqual([]);
  },
};
