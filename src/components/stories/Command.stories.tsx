import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { CalendarIcon, SettingsIcon, UserIcon } from "lucide-react";
import { DirectionProvider } from "../DirectionProvider";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { Button } from "../Button";
import { DialogTrigger } from "../Dialog";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "../command/Command";

const meta: Meta<typeof Command> = {
  title: "shadcn-alexgorbatchev/components/Command",
  component: Command,
  tags: ["autodocs", "test"],
  args: { loop: true },
  render: function Render(args) {
    const [action, setAction] = useState("None");
    return (
      <div className="w-80 border border-border">
        <Command {...args} label="Search commands">
          <CommandInput placeholder="Search commands" aria-label="Search commands" />
          <CommandList label="Commands">
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup heading="Workspace">
              <CommandItem value="new-file" keywords={["create"]} onSelect={setAction}>
                New file<CommandShortcut>Ctrl+N</CommandShortcut>
              </CommandItem>
              <CommandItem value="delete" disabled>
                Delete workspace
              </CommandItem>
              <CommandItem value="settings" onSelect={setAction}>
                Settings
              </CommandItem>
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="Help">
              <CommandItem value="support" onSelect={setAction}>
                Contact support
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
        <output aria-label="Executed command">{action}</output>
      </div>
    );
  },
};
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("combobox", { name: "Search commands" });
    await userEvent.click(input);
    const first = canvas.getByRole("option", { name: "New file Ctrl+N" });
    const settings = canvas.getByRole("option", { name: "Settings" });
    await expect(first).toHaveAttribute("aria-selected", "true");
    await expect(getComputedStyle(first).backgroundColor).not.toBe(getComputedStyle(settings).backgroundColor);
    await userEvent.keyboard("{ArrowDown}{Enter}");
    await expect(canvas.getByLabelText("Executed command")).toHaveTextContent("settings");
    await userEvent.type(input, "create");
    await expect(canvas.getByRole("option", { name: "New file Ctrl+N" })).toBeVisible();
    await expect(canvas.queryByRole("option", { name: "Settings" })).toBeNull();
    await userEvent.keyboard("{Enter}");
    await expect(canvas.getByLabelText("Executed command")).toHaveTextContent("new-file");
    await userEvent.clear(input);
    await userEvent.type(input, "no-such-command");
    await expect(canvas.getByText("No results found.")).toBeVisible();
  },
};
export const Compact: Story = {
  ...Default,
  args: { density: "compact" },
  play: async (context) => {
    await Default.play?.(context);
    const input = within(context.canvasElement).getByRole("combobox", { name: "Search commands" });
    await expect(input.getBoundingClientRect().height).toBe(20);
  },
};
export const ExternalFiltering: Story = {
  args: { shouldFilter: false },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByRole("combobox", { name: "Search commands" }), "create");
    await expect(canvas.getAllByRole("option")).toHaveLength(4);
    await userEvent.click(canvas.getByRole("option", { name: "Contact support" }));
    await expect(canvas.getByLabelText("Executed command")).toHaveTextContent("support");
  },
};
export const Dialog: Story = {
  render: function Render() {
    const [isOpen, setOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Open command palette</Button>
        <CommandDialog open={isOpen} onOpenChange={setOpen} density="compact" showCloseButton>
          <Command label="Search commands">
            <CommandInput />
            <CommandList>
              <CommandGroup heading="Workspace">
                <CommandItem value="settings" onSelect={() => setOpen(false)}>
                  Settings
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </CommandDialog>
      </>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole("button", { name: "Open command palette" });
    await userEvent.click(trigger);
    const dialog = await body.findByRole("dialog", { name: "Command Palette" });
    const input = within(dialog).getByRole("combobox", { name: "Search commands" });
    await waitFor(() => expect(input).toHaveFocus());
    await expect(input.getBoundingClientRect().height).toBe(20);
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(dialog).not.toBeInTheDocument());
    await expect(trigger).toHaveFocus();
    await userEvent.click(trigger);
    await userEvent.click(await body.findByRole("option", { name: "Settings" }));
    await waitFor(() => expect(body.queryByRole("dialog")).toBeNull());
  },
};

export const RightToLeft: Story = {
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
    const canvas = within(context.canvasElement);
    const option = canvas.getByRole("option", { name: "New file Ctrl+N" });
    const shortcut = option.querySelector<HTMLElement>('[data-slot="command-shortcut"]')!;
    await expect(shortcut.getBoundingClientRect().right).toBeLessThan(
      option.getBoundingClientRect().left + option.getBoundingClientRect().width / 2,
    );
    await Default.play?.(context);
  },
};

export const CheckedItem: Story = {
  render: function Render() {
    const [selection, setSelection] = useState("calendar");
    return (
      <div className="w-80">
        <Command label="Choose a destination">
          <CommandInput aria-label="Find destination" />
          <CommandList label="Destinations">
            <CommandGroup heading="Navigation">
              <CommandItem value="calendar" data-checked={selection === "calendar"} onSelect={setSelection}>
                <span>Calendar</span>
              </CommandItem>
              <CommandItem value="settings" data-checked={selection === "settings"} onSelect={setSelection}>
                <span>Settings</span>
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
        <output aria-label="Chosen destination">{selection}</output>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const calendar = canvas.getByRole("option", { name: "Calendar" });
    const check = calendar.querySelector("svg")!;
    const label = calendar.querySelector("span")!;
    await expect(getComputedStyle(check).opacity).toBe("1");
    await expect(Math.abs(check.getBoundingClientRect().x - label.getBoundingClientRect().x)).toBeGreaterThan(100);
    await userEvent.click(canvas.getByRole("option", { name: "Settings" }));
    await expect(canvas.getByLabelText("Chosen destination")).toHaveTextContent("settings");
    await expect(getComputedStyle(check).opacity).toBe("0");
    await expect(getComputedStyle(canvas.getByRole("option", { name: "Settings" }).querySelector("svg")!).opacity).toBe(
      "1",
    );
  },
};
export const RightToLeftCheckedItem: Story = { ...CheckedItem, decorators: RightToLeft.decorators };

export const Shortcuts: Story = {
  render: function Render() {
    const [isOpen, setOpen] = useState(false);
    const [action, setAction] = useState("None");
    return (
      <>
        <Button onClick={() => setOpen(true)}>Open account commands</Button>
        <CommandDialog
          open={isOpen}
          onOpenChange={setOpen}
          title="Account commands"
          description="Choose an account action."
          showCloseButton
        >
          <Command label="Account actions">
            <CommandInput />
            <CommandList label="Account actions">
              <CommandEmpty>No account actions.</CommandEmpty>
              <CommandGroup heading="Account">
                <CommandItem
                  value="profile"
                  onSelect={(value) => {
                    setAction(value);
                    setOpen(false);
                  }}
                >
                  <UserIcon aria-hidden="true" />
                  <span>Profile</span>
                  <CommandShortcut>Ctrl+P</CommandShortcut>
                </CommandItem>
                <CommandItem
                  value="settings"
                  onSelect={(value) => {
                    setAction(value);
                    setOpen(false);
                  }}
                >
                  <SettingsIcon aria-hidden="true" />
                  <span>Settings</span>
                  <CommandShortcut>Ctrl+S</CommandShortcut>
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </CommandDialog>
        <output aria-label="Account command">{action}</output>
      </>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement),
      body = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole("button", { name: "Open account commands" });
    await userEvent.click(trigger);
    const dialog = await body.findByRole("dialog", { name: "Account commands" });
    const input = within(dialog).getByRole("combobox", { name: "Account actions" });
    await waitFor(() => expect(input).toHaveFocus());
    const close = within(dialog).getByRole("button", { name: "Close" });
    const field = input.closest('[data-slot="input-group"]')!;
    await waitFor(() => {
      const fieldBounds = field.getBoundingClientRect(),
        closeBounds = close.getBoundingClientRect();
      const separation: Record<string, number> = {
        ltr: closeBounds.left - fieldBounds.right,
        rtl: fieldBounds.left - closeBounds.right,
      };
      expect(separation[getComputedStyle(input).direction]).toBeGreaterThanOrEqual(4);
    });
    const profile = within(dialog).getByRole("option", { name: "Profile Ctrl+P" });
    await expect(profile.querySelector("svg")!.getBoundingClientRect().width).toBe(16);
    const shortcut = profile.querySelector<HTMLElement>('[data-slot="command-shortcut"]')!;
    const direction = getComputedStyle(profile).direction;
    const edge: Record<string, number> = {
      ltr: profile.getBoundingClientRect().right - shortcut.getBoundingClientRect().right,
      rtl: shortcut.getBoundingClientRect().left - profile.getBoundingClientRect().left,
    };
    await expect(edge[direction]).toBeLessThanOrEqual(10);
    await userEvent.keyboard("{ArrowDown}{Enter}");
    await waitFor(() => expect(dialog).not.toBeInTheDocument());
    await expect(canvas.getByLabelText("Account command")).toHaveTextContent("settings");
    await expect(trigger).toHaveFocus();
  },
};
export const RightToLeftShortcuts: Story = { ...Shortcuts, decorators: RightToLeft.decorators };

export const Groups: Story = {
  render: function Render() {
    const [isOpen, setOpen] = useState(false),
      [action, setAction] = useState("None");
    return (
      <>
        <Button onClick={() => setOpen(true)}>Open grouped commands</Button>
        <CommandDialog open={isOpen} onOpenChange={setOpen} title="Grouped commands">
          <Command label="Grouped actions">
            <CommandInput />
            <CommandList label="Grouped actions">
              <CommandEmpty>No grouped actions.</CommandEmpty>
              <CommandGroup heading="Suggestions">
                <CommandItem value="calendar" onSelect={setAction}>
                  <CalendarIcon aria-hidden="true" />
                  Calendar
                </CommandItem>
              </CommandGroup>
              <CommandSeparator />
              <CommandGroup heading="Settings">
                <CommandItem value="profile" onSelect={setAction}>
                  <UserIcon aria-hidden="true" />
                  Profile
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </CommandDialog>
        <output aria-label="Grouped command">{action}</output>
      </>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement),
      body = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole("button", { name: "Open grouped commands" });
    await userEvent.click(trigger);
    const dialog = await body.findByRole("dialog", { name: "Grouped commands" });
    const input = within(dialog).getByRole("combobox", { name: "Grouped actions" });
    await waitFor(() => expect(input).toHaveFocus());
    await waitFor(() => expect(within(dialog).getByRole("group", { name: "Suggestions" })).toBeVisible());
    await waitFor(() => expect(within(dialog).getByRole("group", { name: "Settings" })).toBeVisible());
    await userEvent.type(input, "profile");
    await waitFor(() => expect(within(dialog).queryByRole("group", { name: "Suggestions" })).toBeNull());
    await userEvent.keyboard("{Enter}");
    await expect(canvas.getByLabelText("Grouped command")).toHaveTextContent("profile");
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(dialog).not.toBeInTheDocument());
    await expect(trigger).toHaveFocus();
  },
};
export const RightToLeftGroups: Story = { ...Groups, decorators: RightToLeft.decorators };

export const Scrollable: Story = {
  render: function Render() {
    const [isOpen, setOpen] = useState(false),
      [action, setAction] = useState("None");
    return (
      <>
        <Button onClick={() => setOpen(true)}>Open project commands</Button>
        <CommandDialog open={isOpen} onOpenChange={setOpen} title="Project commands">
          <Command label="Project actions">
            <CommandInput />
            <CommandList label="Project actions">
              <CommandEmpty>No project actions.</CommandEmpty>
              <CommandGroup heading="Projects">
                {Array.from({ length: 40 }, (_, index) => (
                  <CommandItem key={index} value={`project-${index + 1}`} onSelect={setAction}>
                    Project {index + 1}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </CommandDialog>
        <output aria-label="Project command">{action}</output>
      </>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement),
      body = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole("button", { name: "Open project commands" });
    await userEvent.click(trigger);
    const dialog = await body.findByRole("dialog", { name: "Project commands" });
    const input = within(dialog).getByRole("combobox", { name: "Project actions" });
    await waitFor(() => expect(input).toHaveFocus());
    const list = within(dialog).getByRole("listbox", { name: "Project actions" });
    await expect(list.scrollHeight).toBeGreaterThan(list.clientHeight);
    await userEvent.keyboard("{End}");
    const last = within(dialog).getByRole("option", { name: "Project 40" });
    await waitFor(() => expect(last).toHaveAttribute("aria-selected", "true"));
    await waitFor(() => expect(list.scrollTop).toBeGreaterThan(0));
    await expect(last.getBoundingClientRect().bottom).toBeLessThanOrEqual(list.getBoundingClientRect().bottom + 1);
    await userEvent.keyboard("{Enter}");
    await expect(canvas.getByLabelText("Project command")).toHaveTextContent("project-40");
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(dialog).not.toBeInTheDocument());
    await expect(trigger).toHaveFocus();
  },
};
export const RightToLeftScrollable: Story = { ...Scrollable, decorators: RightToLeft.decorators };

export const Payload: Story = {
  render: function Render() {
    const [handle] = useState(() => DialogPrimitive.createHandle<string>());
    const [selected, setSelected] = useState("None");
    return (
      <>
        <div className="flex gap-control-gap">
          <DialogTrigger handle={handle} payload="Alex" render={<Button />}>
            Commands for Alex
          </DialogTrigger>
          <DialogTrigger handle={handle} payload="Blair" render={<Button />}>
            Commands for Blair
          </DialogTrigger>
          <Button onClick={() => handle.openWithPayload("Casey")}>Commands for Casey</Button>
        </div>
        <CommandDialog handle={handle} title="Account commands" showCloseButton>
          {({ payload }) => (
            <Command label="Payload actions">
              <CommandInput />
              <CommandList>
                <CommandGroup heading={payload?.toUpperCase()}>
                  <CommandItem
                    value="profile"
                    onSelect={() => {
                      setSelected(`Profile for ${payload?.toUpperCase()}`);
                      handle.close();
                    }}
                  >
                    View profile for {payload}
                  </CommandItem>
                </CommandGroup>
              </CommandList>
            </Command>
          )}
        </CommandDialog>
        <output aria-label="Payload command">{selected}</output>
      </>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement),
      body = within(canvasElement.ownerDocument.body);
    const alex = canvas.getByRole("button", { name: "Commands for Alex" });
    await userEvent.click(alex);
    let dialog = await body.findByRole("dialog", { name: "Account commands" });
    await waitFor(() => expect(within(dialog).getByRole("option", { name: "View profile for Alex" })).toBeVisible());
    await waitFor(() => expect(within(dialog).getByRole("combobox", { name: "Payload actions" })).toHaveFocus());
    await userEvent.keyboard("{Enter}");
    await waitFor(() => expect(dialog).not.toBeInTheDocument());
    await expect(canvas.getByLabelText("Payload command")).toHaveTextContent("Profile for ALEX");
    await waitFor(() => expect(alex).toHaveFocus());
    const blair = canvas.getByRole("button", { name: "Commands for Blair" });
    await userEvent.click(blair);
    dialog = await body.findByRole("dialog", { name: "Account commands" });
    await waitFor(() => expect(within(dialog).getByRole("option", { name: "View profile for Blair" })).toBeVisible());
    await userEvent.click(within(dialog).getByRole("button", { name: "Close" }));
    await waitFor(() => expect(dialog).not.toBeInTheDocument());
    await waitFor(() => expect(blair).toHaveFocus());
    await userEvent.click(canvas.getByRole("button", { name: "Commands for Casey" }));
    dialog = await body.findByRole("dialog", { name: "Account commands" });
    const input = within(dialog).getByRole("combobox", { name: "Payload actions" });
    await waitFor(() => expect(input).toHaveFocus());
    await userEvent.keyboard("{Enter}");
    await waitFor(() => expect(dialog).not.toBeInTheDocument());
    await expect(canvas.getByLabelText("Payload command")).toHaveTextContent("Profile for CASEY");
  },
};
export const RightToLeftPayload: Story = { ...Payload, decorators: RightToLeft.decorators };
