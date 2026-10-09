import type { ComponentProps, ReactElement } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import { useState } from "react";
import { FileIcon, SaveIcon, TrashIcon } from "lucide-react";
import { Button } from "../Button";
import { DirectionProvider } from "../DirectionProvider";
import { Toggle } from "../Toggle";
import { NativeSelect, NativeSelectOption } from "../NativeSelect";
import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "../ContextMenu";

type ContextMenuStoryProps = ComponentProps<typeof ContextMenu> & {
  triggerClassName?: ComponentProps<typeof ContextMenuTrigger>["className"];
  contentClassName?: ComponentProps<typeof ContextMenuContent>["className"];
  labelClassName?: ComponentProps<typeof ContextMenuLabel>["className"];
  itemClassName?: ComponentProps<typeof ContextMenuItem>["className"];
  checkboxClassName?: ComponentProps<typeof ContextMenuCheckboxItem>["className"];
  radioClassName?: ComponentProps<typeof ContextMenuRadioItem>["className"];
  subTriggerClassName?: ComponentProps<typeof ContextMenuSubTrigger>["className"];
  separatorClassName?: ComponentProps<typeof ContextMenuSeparator>["className"];
};
const meta: Meta<ContextMenuStoryProps> = {
  title: "shadcn-alexgorbatchev/components/ContextMenu",
  component: ContextMenu,
  tags: ["autodocs", "test"],
};
export default meta;
type Story = StoryObj<typeof meta>;
const itemClassName = fn(() => "font-normal");

type PhysicalSide = "top" | "left" | "right";
type SideMenuProps = { side: PhysicalSide };

function SideMenu({ side }: SideMenuProps): ReactElement {
  const [action, setAction] = useState("No action");
  return (
    <div className="flex flex-col items-center gap-4 p-32">
      <Button onClick={() => setAction("Opened")}>Open project</Button>
      <ContextMenu>
        <ContextMenuTrigger className="w-64 border p-panel">Right click for side menu</ContextMenuTrigger>
        <ContextMenuContent side={side} align="start" alignOffset={0} aria-label="Side actions">
          <ContextMenuGroup>
            <ContextMenuItem onClick={() => setAction("Opened")}>Open</ContextMenuItem>
          </ContextMenuGroup>
        </ContextMenuContent>
      </ContextMenu>
      <output aria-label="Side action">{action}</output>
    </div>
  );
}

async function exerciseSide(canvasElement: HTMLElement, side: PhysicalSide): Promise<void> {
  const canvas = within(canvasElement),
    body = within(canvasElement.ownerDocument.body);
  const trigger = canvas.getByText("Right click for side menu");
  const bounds = trigger.getBoundingClientRect();
  const clientX = bounds.left + bounds.width / 2,
    clientY = bounds.top + bounds.height / 2;
  await userEvent.pointer({ target: trigger, coords: { clientX, clientY }, keys: "[MouseRight]" });
  const menu = await body.findByRole("menu", { name: "Side actions" });
  await waitFor(() => {
    expect(menu).toHaveAttribute("data-side", side);
    const rect = menu.getBoundingClientRect();
    const distances = { top: clientY - rect.bottom, left: clientX - rect.right, right: rect.left - clientX };
    expect(Math.abs(distances[side])).toBeLessThanOrEqual(1);
  });
  await userEvent.click(within(menu).getByRole("menuitem", { name: "Open" }));
  await waitFor(() => expect(body.queryByRole("menu")).not.toBeInTheDocument());
  await expect(canvas.getByRole("status", { name: "Side action" })).toHaveTextContent("Opened");
}
export const Default: Story = {
  render: function Render(args) {
    const [action, setAction] = useState("No action");
    const [checked, setChecked] = useState(false);
    const [sort, setSort] = useState("name");
    return (
      <div className="flex flex-col gap-4">
        <Button onClick={() => setAction("Opened")}>Open project</Button>
        <Button onClick={() => setAction("Link copied")}>Copy project link</Button>
        <Button disabled>Delete project</Button>
        <Toggle aria-label="Show details" pressed={checked} onPressedChange={setChecked}>
          Show details
        </Toggle>
        <NativeSelect aria-label="Sort projects" value={sort} onChange={(event) => setSort(event.currentTarget.value)}>
          <NativeSelectOption value="name">Sort by name</NativeSelectOption>
          <NativeSelectOption value="date">Sort by date</NativeSelectOption>
        </NativeSelect>
        <ContextMenu {...args}>
          <ContextMenuTrigger className="border border-border p-panel">Right click the project</ContextMenuTrigger>
          <ContextMenuContent aria-label="Project actions">
            <ContextMenuGroup>
              <ContextMenuLabel>Project</ContextMenuLabel>
              <ContextMenuItem className={itemClassName} onClick={() => setAction("Opened")}>
                Open<ContextMenuShortcut>Enter</ContextMenuShortcut>
              </ContextMenuItem>
              <ContextMenuItem disabled>Delete</ContextMenuItem>
            </ContextMenuGroup>
            <ContextMenuSeparator />
            <ContextMenuCheckboxItem checked={checked} onCheckedChange={setChecked}>
              Show details
            </ContextMenuCheckboxItem>
            <ContextMenuRadioGroup value={sort} onValueChange={setSort}>
              <ContextMenuRadioItem value="name">Sort by name</ContextMenuRadioItem>
              <ContextMenuRadioItem value="date">Sort by date</ContextMenuRadioItem>
            </ContextMenuRadioGroup>
            <ContextMenuSub>
              <ContextMenuSubTrigger>Share</ContextMenuSubTrigger>
              <ContextMenuSubContent>
                <ContextMenuGroup>
                  <ContextMenuItem onClick={() => setAction("Link copied")}>Copy link</ContextMenuItem>
                </ContextMenuGroup>
              </ContextMenuSubContent>
            </ContextMenuSub>
          </ContextMenuContent>
        </ContextMenu>
        <output aria-label="Project action">{action}</output>
        <output aria-label="Details enabled">{String(checked)}</output>
        <output aria-label="Sort order">{sort}</output>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByText("Right click the project");
    await userEvent.pointer({ target: trigger, keys: "[MouseRight]" });
    const menu = await body.findByRole("menu", { name: "Project actions" });
    await expect(within(menu).getByRole("menuitem", { name: "Delete" })).toHaveAttribute("aria-disabled", "true");
    await userEvent.click(within(menu).getByRole("menuitemcheckbox", { name: "Show details" }));
    await expect(within(menu).getByRole("menuitemcheckbox", { name: "Show details" })).toHaveAttribute(
      "aria-checked",
      "true",
    );
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(body.queryByRole("menu")).not.toBeInTheDocument());
    await expect(canvas.getByRole("status", { name: "Details enabled" })).toHaveTextContent("true");
    await userEvent.pointer({ target: trigger, keys: "[MouseRight]" });
    await userEvent.click(await body.findByRole("menuitemradio", { name: "Sort by date" }));
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(body.queryByRole("menu")).not.toBeInTheDocument());
    await expect(canvas.getByRole("status", { name: "Sort order" })).toHaveTextContent("date");
    await userEvent.pointer({ target: trigger, keys: "[MouseRight]" });
    await userEvent.click(await body.findByRole("menuitem", { name: "Share" }));
    await userEvent.click(await body.findByRole("menuitem", { name: "Copy link" }));
    await expect(canvas.getByRole("status", { name: "Project action" })).toHaveTextContent("Link copied");
    await expect(itemClassName).toHaveBeenCalledWith(expect.any(Object));
    await waitFor(() => expect(body.queryByRole("menu")).not.toBeInTheDocument());
  },
};
export const Compact: Story = { ...Default, globals: { density: "compact" } };
export const Disabled: Story = {
  ...Default,
  args: { disabled: true },
  play: async ({ canvasElement }) => {
    await userEvent.pointer({
      target: within(canvasElement).getByText("Right click the project"),
      keys: "[MouseRight]",
    });
    await expect(within(canvasElement.ownerDocument.body).queryByRole("menu")).not.toBeInTheDocument();
  },
};

export const NativePartCallbacks: Story = {
  args: {
    triggerClassName: fn(() => "p-panel"),
    contentClassName: fn(() => "min-w-64"),
    labelClassName: fn(() => "py-2"),
    itemClassName: fn(() => "py-2"),
    checkboxClassName: fn(() => "py-2"),
    radioClassName: fn(() => "py-2"),
    subTriggerClassName: fn(() => "py-2"),
    separatorClassName: fn(() => "my-2"),
  },
  render: (args) => {
    const [checked, setChecked] = useState(false);
    const [sort, setSort] = useState("name");
    const [action, setAction] = useState("No action");
    return (
      <div className="flex flex-col gap-4">
        <Button onClick={() => setAction("Opened")}>Open project</Button>
        <Button onClick={() => setAction("Link copied")}>Copy project link</Button>
        <Toggle aria-label="Show details" pressed={checked} onPressedChange={setChecked}>
          Show details
        </Toggle>
        <NativeSelect aria-label="Sort projects" value={sort} onChange={(event) => setSort(event.currentTarget.value)}>
          <NativeSelectOption value="name">Sort by name</NativeSelectOption>
          <NativeSelectOption value="date">Sort by date</NativeSelectOption>
        </NativeSelect>
        <ContextMenu>
          <ContextMenuTrigger className={args.triggerClassName}>Right click for callbacks</ContextMenuTrigger>
          <ContextMenuContent aria-label="Callback actions" className={args.contentClassName}>
            <ContextMenuGroup>
              <ContextMenuLabel className={args.labelClassName}>Project</ContextMenuLabel>
              <ContextMenuItem className={args.itemClassName} onClick={() => setAction("Opened")}>
                Open
              </ContextMenuItem>
              <ContextMenuCheckboxItem
                checked={checked}
                onCheckedChange={setChecked}
                className={args.checkboxClassName}
              >
                Show details
              </ContextMenuCheckboxItem>
            </ContextMenuGroup>
            <ContextMenuSeparator className={args.separatorClassName} />
            <ContextMenuRadioGroup value={sort} onValueChange={setSort}>
              <ContextMenuRadioItem value="name" className={args.radioClassName}>
                Sort by name
              </ContextMenuRadioItem>
              <ContextMenuRadioItem value="date" className={args.radioClassName}>
                Sort by date
              </ContextMenuRadioItem>
            </ContextMenuRadioGroup>
            <ContextMenuSub>
              <ContextMenuSubTrigger className={args.subTriggerClassName}>Share</ContextMenuSubTrigger>
              <ContextMenuSubContent aria-label="Sharing actions" className={args.contentClassName}>
                <ContextMenuGroup>
                  <ContextMenuItem onClick={() => setAction("Link copied")}>Copy link</ContextMenuItem>
                </ContextMenuGroup>
              </ContextMenuSubContent>
            </ContextMenuSub>
          </ContextMenuContent>
        </ContextMenu>
        <output aria-label="Project action">{action}</output>
      </div>
    );
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement),
      body = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByText("Right click for callbacks");
    await userEvent.pointer({ target: trigger, keys: "[MouseRight]" });
    const menu = await body.findByRole("menu", { name: "Callback actions" });
    await waitFor(() => expect(menu).toBeVisible());
    await expect(args.triggerClassName).toHaveBeenCalledWith(expect.objectContaining({ open: true }));
    await expect(args.contentClassName).toHaveBeenCalledWith(expect.objectContaining({ open: true }));
    await expect(args.labelClassName).toHaveBeenCalled();
    await expect(args.itemClassName).toHaveBeenCalledWith(expect.objectContaining({ disabled: false }));
    await expect(args.separatorClassName).toHaveBeenCalledWith(expect.objectContaining({ orientation: "horizontal" }));
    await expect(menu.getBoundingClientRect().width).toBeGreaterThanOrEqual(256);
    await expect(within(menu).getByRole("menuitem", { name: "Open" }).getBoundingClientRect().height).toBeGreaterThan(
      24,
    );
    await userEvent.click(within(menu).getByRole("menuitemcheckbox", { name: "Show details" }));
    await expect(args.checkboxClassName).toHaveBeenCalledWith(expect.objectContaining({ checked: true }));
    await expect(within(menu).getByRole("menuitemcheckbox", { name: "Show details" })).toHaveAttribute(
      "aria-checked",
      "true",
    );
    await userEvent.click(within(menu).getByRole("menuitemradio", { name: "Sort by date" }));
    await expect(args.radioClassName).toHaveBeenCalledWith(expect.objectContaining({ checked: true }));
    await expect(within(menu).getByRole("menuitemradio", { name: "Sort by date" })).toHaveAttribute(
      "aria-checked",
      "true",
    );
    await userEvent.click(within(menu).getByRole("menuitem", { name: "Share" }));
    const submenu = await body.findByRole("menu", { name: "Sharing actions" });
    await waitFor(() => expect(submenu).toBeVisible());
    await expect(args.subTriggerClassName).toHaveBeenCalledWith(expect.objectContaining({ open: true }));
    await userEvent.click(within(submenu).getByRole("menuitem", { name: "Copy link" }));
    await waitFor(() => expect(body.queryByRole("menu", { name: "Callback actions" })).not.toBeInTheDocument());
    await expect(canvas.getByRole("status", { name: "Project action" })).toHaveTextContent("Link copied");
  },
};

export const RightToLeft: Story = {
  ...Default,
  globals: { density: "compact" },
  decorators: [
    (Story) => (
      <DirectionProvider direction="rtl">
        <div dir="rtl">
          <Story />
        </div>
      </DirectionProvider>
    ),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement),
      body = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByText("Right click the project");
    const bounds = trigger.getBoundingClientRect();
    await userEvent.pointer({
      target: trigger,
      coords: { clientX: bounds.x + bounds.width / 2, clientY: bounds.y + bounds.height / 2 },
      keys: "[MouseRight]",
    });
    const menu = await body.findByRole("menu", { name: "Project actions" });
    await waitFor(() => expect(menu).toBeVisible());
    await expect(menu).toHaveAttribute("dir", "rtl");
    await expect(menu).toHaveAttribute("data-density", "compact");
    await expect(getComputedStyle(menu).direction).toBe("rtl");
    const checkbox = within(menu).getByRole("menuitemcheckbox", { name: "Show details" });
    await userEvent.click(checkbox);
    await waitFor(() => expect(checkbox.querySelector("svg")).toBeVisible());
    await expect(checkbox.querySelector("svg")?.getBoundingClientRect().right).toBeLessThan(
      checkbox.getBoundingClientRect().x + checkbox.getBoundingClientRect().width / 2,
    );
    await expect(Number.parseFloat(getComputedStyle(checkbox).paddingLeft)).toBeGreaterThan(
      Number.parseFloat(getComputedStyle(checkbox).paddingRight),
    );
    const radio = within(menu).getByRole("menuitemradio", { name: "Sort by name" });
    await expect(radio.querySelector("svg")?.getBoundingClientRect().right).toBeLessThan(
      radio.getBoundingClientRect().x + radio.getBoundingClientRect().width / 2,
    );
    const share = within(menu).getByRole("menuitem", { name: "Share" });
    await userEvent.click(share);
    const submenu = await body.findByRole("menu", { name: "Share" });
    await waitFor(() => expect(submenu).toBeVisible());
    await expect(submenu).toHaveAttribute("dir", "rtl");
    await expect(submenu.getBoundingClientRect().right).toBeLessThanOrEqual(share.getBoundingClientRect().left + 1);
    await expect(share.querySelector("svg")?.getBoundingClientRect().right).toBeLessThan(
      share.getBoundingClientRect().x + share.getBoundingClientRect().width / 2,
    );
    await userEvent.click(within(submenu).getByRole("menuitem", { name: "Copy link" }));
    await waitFor(() => expect(body.queryByRole("menu")).not.toBeInTheDocument());
    await expect(canvas.getByRole("status", { name: "Project action" })).toHaveTextContent("Link copied");
  },
};
export const MotionPreference: Story = {
  ...Default,
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.pointer({
      target: within(canvasElement).getByText("Right click the project"),
      keys: "[MouseRight]",
    });
    const menu = await body.findByRole("menu", { name: "Project actions" });
    await waitFor(() => expect(menu).toBeVisible());
    await expect(getComputedStyle(menu).animationName === "none").toBe(
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    );
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(body.queryByRole("menu")).not.toBeInTheDocument());
  },
};

export const BottomAligned: Story = {
  render: function Render(args) {
    const [action, setAction] = useState("No action");
    return (
      <div className="flex flex-col items-center gap-4 p-12">
        <Button onClick={() => setAction("Opened")}>Open project</Button>
        <ContextMenu {...args}>
          <ContextMenuTrigger className="w-64 border p-panel">Right click for bottom menu</ContextMenuTrigger>
          <ContextMenuContent side="bottom" align="start" alignOffset={0} aria-label="Bottom actions">
            <ContextMenuGroup>
              <ContextMenuItem onClick={() => setAction("Opened")}>Open</ContextMenuItem>
            </ContextMenuGroup>
          </ContextMenuContent>
        </ContextMenu>
        <output aria-label="Bottom action">{action}</output>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByText("Right click for bottom menu");
    const bounds = trigger.getBoundingClientRect();
    const clientX = bounds.left + bounds.width / 2;
    const clientY = bounds.top + bounds.height / 2;
    await userEvent.pointer({ target: trigger, coords: { clientX, clientY }, keys: "[MouseRight]" });
    const menu = await body.findByRole("menu", { name: "Bottom actions" });
    await waitFor(() => expect(Math.abs(menu.getBoundingClientRect().left - clientX)).toBeLessThanOrEqual(1));
    await expect(Math.abs(menu.getBoundingClientRect().top - clientY)).toBeLessThanOrEqual(1);
    await userEvent.click(within(menu).getByRole("menuitem", { name: "Open" }));
    await waitFor(() => expect(body.queryByRole("menu")).not.toBeInTheDocument());
    await expect(canvas.getByRole("status", { name: "Bottom action" })).toHaveTextContent("Opened");
  },
};

export const RightToLeftBottomAligned: Story = {
  ...BottomAligned,
  decorators: RightToLeft.decorators,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByText("Right click for bottom menu");
    const bounds = trigger.getBoundingClientRect();
    const clientX = bounds.left + bounds.width / 2;
    const clientY = bounds.top + bounds.height / 2;
    await userEvent.pointer({ target: trigger, coords: { clientX, clientY }, keys: "[MouseRight]" });
    const menu = await body.findByRole("menu", { name: "Bottom actions" });
    await waitFor(() => expect(Math.abs(menu.getBoundingClientRect().right - clientX)).toBeLessThanOrEqual(1));
    await expect(Math.abs(menu.getBoundingClientRect().top - clientY)).toBeLessThanOrEqual(1);
    await userEvent.click(within(menu).getByRole("menuitem", { name: "Open" }));
    await waitFor(() => expect(body.queryByRole("menu")).not.toBeInTheDocument());
    await expect(canvas.getByRole("status", { name: "Bottom action" })).toHaveTextContent("Opened");
  },
};

export const Icons: Story = {
  render: function Render(args) {
    const [action, setAction] = useState("No action");
    return (
      <div className="flex flex-col gap-4">
        <Button onClick={() => setAction("Created")}>New project file</Button>
        <Button onClick={() => setAction("Saved")}>Save project</Button>
        <ContextMenu {...args}>
          <ContextMenuTrigger className="w-64 border p-panel">Right click for file actions</ContextMenuTrigger>
          <ContextMenuContent aria-label="File actions">
            <ContextMenuGroup>
              <ContextMenuLabel>File</ContextMenuLabel>
              <ContextMenuItem onClick={() => setAction("Created")}>
                <FileIcon aria-hidden="true" />
                New file<ContextMenuShortcut>Ctrl+N</ContextMenuShortcut>
              </ContextMenuItem>
              <ContextMenuSeparator />
              <ContextMenuItem onClick={() => setAction("Saved")}>
                <SaveIcon aria-hidden="true" />
                Save<ContextMenuShortcut>Ctrl+S</ContextMenuShortcut>
              </ContextMenuItem>
            </ContextMenuGroup>
          </ContextMenuContent>
        </ContextMenu>
        <output aria-label="File action">{action}</output>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement),
      body = within(canvasElement.ownerDocument.body);
    await userEvent.pointer({ target: canvas.getByText("Right click for file actions"), keys: "[MouseRight]" });
    const save = await body.findByRole("menuitem", { name: "Save Ctrl+S" });
    await waitFor(() => expect(save).toBeVisible());
    await expect(save.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
    await expect(save.querySelector("svg")!.getBoundingClientRect().width).toBe(16);
    await userEvent.click(save);
    await waitFor(() => expect(body.queryByRole("menu")).not.toBeInTheDocument());
    await expect(canvas.getByRole("status", { name: "File action" })).toHaveTextContent("Saved");
    await userEvent.click(canvas.getByRole("button", { name: "New project file" }));
    await expect(canvas.getByRole("status", { name: "File action" })).toHaveTextContent("Created");
    await userEvent.click(canvas.getByRole("button", { name: "Save project" }));
    await expect(canvas.getByRole("status", { name: "File action" })).toHaveTextContent("Saved");
  },
};
export const RightToLeftIcons: Story = { ...Icons, decorators: RightToLeft.decorators };

export const Destructive: Story = {
  render: function Render(args) {
    const [isPresent, setIsPresent] = useState(true);
    return (
      <div className="flex flex-col gap-4">
        <Button variant="destructive" disabled={!isPresent} onClick={() => setIsPresent(false)}>
          Discard project draft
        </Button>
        <ContextMenu {...args}>
          <ContextMenuTrigger className="w-64 border p-panel">Right click the draft</ContextMenuTrigger>
          <ContextMenuContent aria-label="Draft actions">
            <ContextMenuGroup>
              <ContextMenuItem variant="destructive" disabled={!isPresent} onClick={() => setIsPresent(false)}>
                <TrashIcon aria-hidden="true" />
                Discard draft
              </ContextMenuItem>
            </ContextMenuGroup>
          </ContextMenuContent>
        </ContextMenu>
        <output aria-label="Draft status">{isPresent ? "Draft available" : "Draft discarded"}</output>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement),
      body = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByText("Right click the draft");
    await userEvent.pointer({ target: trigger, keys: "[MouseRight]" });
    await userEvent.click(await body.findByRole("menuitem", { name: "Discard draft" }));
    await waitFor(() => expect(body.queryByRole("menu")).not.toBeInTheDocument());
    await expect(canvas.getByRole("status", { name: "Draft status" })).toHaveTextContent("Draft discarded");
    await expect(canvas.getByRole("button", { name: "Discard project draft" })).toBeDisabled();
    await userEvent.pointer({ target: trigger, keys: "[MouseRight]" });
    await expect(await body.findByRole("menuitem", { name: "Discard draft" })).toHaveAttribute("aria-disabled", "true");
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(body.queryByRole("menu")).not.toBeInTheDocument());
  },
};
export const RightToLeftDestructive: Story = { ...Destructive, decorators: RightToLeft.decorators };

export const Top: Story = {
  render: () => <SideMenu side="top" />,
  play: ({ canvasElement }) => exerciseSide(canvasElement, "top"),
};
export const Left: Story = {
  render: () => <SideMenu side="left" />,
  play: ({ canvasElement }) => exerciseSide(canvasElement, "left"),
};
export const Right: Story = {
  render: () => <SideMenu side="right" />,
  play: ({ canvasElement }) => exerciseSide(canvasElement, "right"),
};
export const RightToLeftTop: Story = { ...Top, decorators: RightToLeft.decorators };
export const RightToLeftLeft: Story = { ...Left, decorators: RightToLeft.decorators };
export const RightToLeftRight: Story = { ...Right, decorators: RightToLeft.decorators };
