import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import { useState } from "react";
import { DirectionProvider } from "../DirectionProvider";
import { FileIcon, SaveIcon, SettingsIcon } from "lucide-react";
import {
  Menubar,
  MenubarCheckboxItem,
  MenubarContent,
  MenubarGroup,
  MenubarItem,
  MenubarLabel,
  MenubarMenu,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSeparator,
  MenubarShortcut,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from "../Menubar";

const meta: Meta<typeof Menubar> = {
  title: "shadcn-alexgorbatchev/components/Menubar",
  component: Menubar,
  tags: ["autodocs", "test"],
};
export default meta;
type Story = StoryObj<typeof meta>;
const itemClassName = fn(() => "font-normal");
const stateClassName = fn(() => "font-normal");
export const Default: Story = {
  render: function Render(args) {
    const [action, setAction] = useState("No action");
    const [checked, setChecked] = useState(false);
    const [zoom, setZoom] = useState("100");
    return (
      <div>
        <Menubar {...args} className={stateClassName} aria-label="Editor commands">
          <MenubarMenu>
            <MenubarTrigger className={stateClassName}>File</MenubarTrigger>
            <MenubarContent className={stateClassName}>
              <MenubarGroup>
                <MenubarLabel className={stateClassName}>Document</MenubarLabel>
                <MenubarItem className={itemClassName} onClick={() => setAction("Created")}>
                  New document<MenubarShortcut>Ctrl+N</MenubarShortcut>
                </MenubarItem>
                <MenubarItem disabled>Export</MenubarItem>
              </MenubarGroup>
              <MenubarSeparator className={stateClassName} />
              <MenubarSub>
                <MenubarSubTrigger className={stateClassName}>Share</MenubarSubTrigger>
                <MenubarSubContent className={stateClassName}>
                  <MenubarGroup aria-label="Sharing">
                    <MenubarItem onClick={() => setAction("Link copied")}>Copy link</MenubarItem>
                  </MenubarGroup>
                </MenubarSubContent>
              </MenubarSub>
            </MenubarContent>
          </MenubarMenu>
          <MenubarMenu>
            <MenubarTrigger>View</MenubarTrigger>
            <MenubarContent>
              <MenubarGroup aria-label="View settings">
                <MenubarCheckboxItem
                  checked={checked}
                  onCheckedChange={setChecked}
                  className={(state) => (state.checked ? "font-bold" : "font-normal")}
                >
                  Show details
                </MenubarCheckboxItem>
                <MenubarRadioGroup value={zoom} onValueChange={setZoom}>
                  <MenubarRadioItem value="100" className={stateClassName}>
                    100 percent
                  </MenubarRadioItem>
                  <MenubarRadioItem value="200">200 percent</MenubarRadioItem>
                </MenubarRadioGroup>
              </MenubarGroup>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>
        <output aria-label="Document action">{action}</output>
        <output aria-label="Details enabled">{String(checked)}</output>
        <output aria-label="Zoom">{zoom}</output>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const file = canvas.getByRole("menuitem", { name: "File" });
    await expect(canvas.getByRole("menubar", { name: "Editor commands" })).toBeVisible();
    await userEvent.click(file);
    await expect(await body.findByRole("menuitem", { name: "Export" })).toHaveAttribute("aria-disabled", "true");
    await userEvent.click(body.getByRole("menuitem", { name: "New document Ctrl+N" }));
    await expect(canvas.getByRole("status", { name: "Document action" })).toHaveTextContent("Created");
    await expect(itemClassName).toHaveBeenCalledWith(expect.any(Object));
    await userEvent.click(canvas.getByRole("menuitem", { name: "View" }));
    const viewSettings = await body.findByRole("group", { name: "View settings" });
    await userEvent.click(within(viewSettings).getByRole("menuitemcheckbox", { name: "Show details" }));
    await expect(
      getComputedStyle(within(viewSettings).getByRole("menuitemcheckbox", { name: "Show details" })).fontWeight,
    ).toBe("700");
    await expect(stateClassName).toHaveBeenCalledWith(expect.any(Object));
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(body.queryByRole("menu")).not.toBeInTheDocument());
    await expect(canvas.getByRole("status", { name: "Details enabled" })).toHaveTextContent("true");
    await userEvent.click(canvas.getByRole("menuitem", { name: "View" }));
    await userEvent.click(await body.findByRole("menuitemradio", { name: "200 percent" }));
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(body.queryByRole("menu")).not.toBeInTheDocument());
    await expect(canvas.getByRole("status", { name: "Zoom" })).toHaveTextContent("200");
    await userEvent.click(file);
    await userEvent.click(await body.findByRole("menuitem", { name: "Share" }));
    const sharing = await body.findByRole("group", { name: "Sharing" });
    await userEvent.click(within(sharing).getByRole("menuitem", { name: "Copy link" }));
    await expect(canvas.getByRole("status", { name: "Document action" })).toHaveTextContent("Link copied");
    await waitFor(() => expect(body.queryByRole("menu")).not.toBeInTheDocument());
  },
};
export const Compact: Story = {
  ...Default,
  globals: { density: "compact" },
  play: async (context) => {
    await Default.play?.(context);
    const canvas = within(context.canvasElement);
    const root = canvas.getByRole("menubar", { name: "Editor commands" }).getBoundingClientRect();
    const trigger = canvas.getByRole("menuitem", { name: "File" }).getBoundingClientRect();
    await expect(trigger.top).toBeGreaterThanOrEqual(root.top + 1);
    await expect(trigger.bottom).toBeLessThanOrEqual(root.bottom - 1);
  },
};
export const Keyboard: Story = {
  ...Default,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    canvas.getByRole("menuitem", { name: "File" }).focus();
    await userEvent.keyboard("{ArrowRight}");
    await expect(canvas.getByRole("menuitem", { name: "View" })).toHaveFocus();
    await userEvent.keyboard("{ArrowDown}");
    const checkbox = await body.findByRole("menuitemcheckbox", { name: "Show details" });
    await waitFor(() => expect(checkbox).toHaveFocus());
    await userEvent.keyboard("{Enter}");
    await expect(checkbox).toHaveAttribute("aria-checked", "true");
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(body.queryByRole("menu")).not.toBeInTheDocument());
    await expect(canvas.getByRole("menuitem", { name: "View" })).toHaveFocus();
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
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const view = canvas.getByRole("menuitem", { name: "View" });
    await userEvent.click(view);
    const checkbox = await body.findByRole("menuitemcheckbox", { name: "Show details" });
    await userEvent.click(checkbox);
    await expect(checkbox).toHaveAttribute("aria-checked", "true");
    const indicator = checkbox.querySelector("svg")!;
    await expect(indicator.getBoundingClientRect().left).toBeGreaterThan(
      checkbox.getBoundingClientRect().left + checkbox.getBoundingClientRect().width / 2,
    );
    const style = getComputedStyle(checkbox);
    await expect(parseFloat(style.paddingRight)).toBeGreaterThan(parseFloat(style.paddingLeft));
    const radio = body.getByRole("menuitemradio", { name: "100 percent" });
    await expect(radio.querySelector("svg")!.getBoundingClientRect().left).toBeGreaterThan(
      radio.getBoundingClientRect().left + radio.getBoundingClientRect().width / 2,
    );
    await userEvent.click(body.getByRole("menuitemradio", { name: "200 percent" }));
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(body.queryByRole("menu")).not.toBeInTheDocument());
    await expect(canvas.getByRole("status", { name: "Zoom" })).toHaveTextContent("200");
    await expect(view).toHaveFocus();
  },
};

export const RightToLeftInset: Story = {
  decorators: RightToLeft.decorators,
  render: (args) => (
    <Menubar {...args} aria-label="Inset editor commands">
      <MenubarMenu>
        <MenubarTrigger>Document</MenubarTrigger>
        <MenubarContent className="min-w-56">
          <MenubarGroup>
            <MenubarLabel inset>Document actions</MenubarLabel>
            <MenubarItem inset>
              New document<MenubarShortcut>Ctrl+N</MenubarShortcut>
            </MenubarItem>
            <MenubarSub>
              <MenubarSubTrigger inset>Share document</MenubarSubTrigger>
              <MenubarSubContent>
                <MenubarGroup>
                  <MenubarItem>Copy document link</MenubarItem>
                </MenubarGroup>
              </MenubarSubContent>
            </MenubarSub>
          </MenubarGroup>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole("menuitem", { name: "Document" });
    await userEvent.click(trigger);
    const menu = await body.findByRole("menu");
    for (const element of [
      within(menu).getByText("Document actions"),
      within(menu).getByRole("menuitem", { name: "New document Ctrl+N" }),
      within(menu).getByRole("menuitem", { name: "Share document" }),
    ]) {
      const style = getComputedStyle(element);
      await expect(parseFloat(style.paddingRight)).toBeGreaterThan(parseFloat(style.paddingLeft));
    }
    await expect(within(menu).getByText("Ctrl+N").getBoundingClientRect().right).toBeLessThan(
      menu.getBoundingClientRect().left + menu.getBoundingClientRect().width / 2,
    );
    await userEvent.click(within(menu).getByRole("menuitem", { name: "Share document" }));
    const copy = await body.findByRole("menuitem", { name: "Copy document link" });
    await expect(getComputedStyle(copy).direction).toBe("rtl");
    await userEvent.click(copy);
    await waitFor(() => expect(body.queryByRole("menu")).not.toBeInTheDocument());
    await expect(trigger).toHaveFocus();
  },
};

export const Payload: Story = {
  render: (args) => (
    <Menubar {...args} aria-label="Project commands">
      <MenubarMenu<string>>
        {({ payload }) => (
          <>
            <MenubarTrigger<string> payload="Project alpha">Project</MenubarTrigger>
            <MenubarContent>
              <MenubarGroup>
                <MenubarLabel>{payload?.toUpperCase()}</MenubarLabel>
                <MenubarItem>Open project</MenubarItem>
              </MenubarGroup>
            </MenubarContent>
          </>
        )}
      </MenubarMenu>
    </Menubar>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole("menuitem", { name: "Project" });
    trigger.focus();
    await userEvent.keyboard("{ArrowDown}");
    const menu = await body.findByRole("menu");
    await waitFor(() => expect(within(menu).getByText("PROJECT ALPHA")).toBeVisible());
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(body.queryByRole("menu")).not.toBeInTheDocument());
    await expect(trigger).toHaveFocus();
  },
};

export const WithIcons: Story = {
  render: function Render(args) {
    const [action, setAction] = useState("No action");
    return (
      <>
        <Menubar {...args} aria-label="File commands">
          <MenubarMenu>
            <MenubarTrigger>File</MenubarTrigger>
            <MenubarContent className="min-w-56">
              <MenubarGroup>
                <MenubarLabel>Document</MenubarLabel>
                <MenubarItem onClick={() => setAction("Created")}>
                  <FileIcon aria-hidden="true" />
                  New file<MenubarShortcut>Ctrl+N</MenubarShortcut>
                </MenubarItem>
                <MenubarSeparator />
                <MenubarItem onClick={() => setAction("Saved")}>
                  <SaveIcon aria-hidden="true" />
                  Save<MenubarShortcut>Ctrl+S</MenubarShortcut>
                </MenubarItem>
              </MenubarGroup>
            </MenubarContent>
          </MenubarMenu>
          <MenubarMenu>
            <MenubarTrigger>More</MenubarTrigger>
            <MenubarContent>
              <MenubarGroup>
                <MenubarItem onClick={() => setAction("Settings opened")}>
                  <SettingsIcon aria-hidden="true" />
                  Settings
                </MenubarItem>
              </MenubarGroup>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>
        <output aria-label="File command">{action}</output>
      </>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement),
      body = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole("menuitem", { name: "File" });
    trigger.focus();
    await userEvent.keyboard("{ArrowDown}");
    const save = await body.findByRole("menuitem", { name: "Save Ctrl+S" });
    await waitFor(() => expect(save).toBeVisible());
    await expect(save.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
    await expect(save.querySelector("svg")!.getBoundingClientRect().width).toBe(16);
    await waitFor(() => expect(body.getByRole("menuitem", { name: "New file Ctrl+N" })).toHaveFocus());
    await userEvent.keyboard("{End}{Enter}");
    await waitFor(() => expect(body.queryByRole("menu")).not.toBeInTheDocument());
    await expect(canvas.getByRole("status", { name: "File command" })).toHaveTextContent("Saved");
    await expect(trigger).toHaveFocus();
    await userEvent.click(canvas.getByRole("menuitem", { name: "More" }));
    const settings = await body.findByRole("menuitem", { name: "Settings" });
    await waitFor(() => expect(settings).toBeVisible());
    await userEvent.click(settings);
    await waitFor(() => expect(body.queryByRole("menu")).not.toBeInTheDocument());
    await expect(canvas.getByRole("status", { name: "File command" })).toHaveTextContent("Settings opened");
  },
};
export const RightToLeftWithIcons: Story = { ...WithIcons, decorators: RightToLeft.decorators };
