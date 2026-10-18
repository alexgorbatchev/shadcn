import type { Input } from "@base-ui/react/input";
import type { ComponentProps, ReactElement } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useRef, useState } from "react";
import { expect, fn, waitFor, within } from "storybook/test";
import { FileIcon, HomeIcon, PlusIcon } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
} from "../Sidebar";
import { useSidebar } from "../../hooks/useSidebar";
import { Button } from "../Button";
import { DensityProvider } from "../DensityProvider";
import { DirectionProvider } from "../DirectionProvider";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../Collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../DropdownMenu";

type LayoutProps = ComponentProps<typeof Sidebar>;

function Toolbar(): ReactElement {
  const { state, openMobile, isMobile, setOpen, setOpenMobile } = useSidebar();
  return (
    <>
      <SidebarTrigger />
      <Button onClick={() => setOpen(false)}>Collapse desktop</Button>
      <Button onClick={() => setOpen(true)}>Expand desktop</Button>
      <Button onClick={() => setOpenMobile(true)}>Open mobile</Button>
      <output aria-label="Sidebar state">{JSON.stringify({ state, openMobile, isMobile })}</output>
    </>
  );
}

function Layout(args: LayoutProps): ReactElement {
  return (
    <>
      <Sidebar aria-label="Project navigation" {...args}>
        <SidebarHeader>
          <span>Workspace</span>
          <SidebarInput aria-label="Search projects" />
        </SidebarHeader>
        <SidebarSeparator />
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Projects</SidebarGroupLabel>
            <SidebarGroupAction aria-label="Add project" onClick={fn()}>
              <PlusIcon />
            </SidebarGroupAction>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton isActive tooltip="Home" render={<a href="#home" aria-current="page" />}>
                    <HomeIcon aria-hidden />
                    <span>Home</span>
                  </SidebarMenuButton>
                  <SidebarMenuBadge>3</SidebarMenuBadge>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton tooltip={{ children: "Documents" }} render={<a href="#documents" />}>
                    <FileIcon aria-hidden />
                    <span>Documents</span>
                  </SidebarMenuButton>
                  <SidebarMenuAction aria-label="Document actions" showOnHover onClick={fn()}>
                    <PlusIcon />
                  </SidebarMenuAction>
                  <SidebarMenuSub>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton href="#recent">Recent documents</SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton href="#archive" size="sm">
                        Archive
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  </SidebarMenuSub>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton disabled>
                    <FileIcon aria-hidden />
                    <span>Unavailable</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton>Settings</SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
        <SidebarRail aria-label="Toggle navigation rail" />
      </Sidebar>
      <SidebarInset>
        <Toolbar />
      </SidebarInset>
    </>
  );
}

const meta: Meta<typeof Sidebar> = {
  title: "shadcn-alexgorbatchev/components/Sidebar",
  component: Sidebar,
  tags: ["autodocs", "test"],
  args: { collapsible: "icon" },
  render: (args) => (
    <SidebarProvider>
      <Layout {...args} />
    </SidebarProvider>
  ),
};
export default meta;
type Story = StoryObj<typeof meta>;

function WorkspaceLayout(): ReactElement {
  const [workspace, setWorkspace] = useState("Design workspace");
  const [account, setAccount] = useState("Account ready");
  return (
    <SidebarProvider>
      <Sidebar aria-label="Workspace navigation" collapsible="icon">
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger render={<SidebarMenuButton aria-label="Choose workspace" />}>
                  <HomeIcon aria-hidden="true" />
                  <span>{workspace}</span>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuGroup>
                    <DropdownMenuItem onClick={() => setWorkspace("Design workspace")}>
                      Design workspace
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setWorkspace("Engineering workspace")}>
                      Engineering workspace
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Projects</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton render={<a href="#workspace-project" />}>Current project</SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger render={<SidebarMenuButton aria-label="Account actions" />}>
                  <FileIcon aria-hidden="true" />
                  <span>Alex</span>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="top">
                  <DropdownMenuGroup>
                    <DropdownMenuItem onClick={() => setAccount("Profile opened")}>Open profile</DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <SidebarTrigger />
        <output aria-label="Current workspace">{workspace}</output>
        <output aria-label="Account result">{account}</output>
      </SidebarInset>
    </SidebarProvider>
  );
}
export const WorkspaceMenus: Story = {
  render: () => <WorkspaceLayout />,
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const workspace = canvas.getByRole("button", { name: "Choose workspace" });
    workspace.focus();
    await userEvent.keyboard("{Enter}");
    const menu = await body.findByRole("menu");
    const engineering = within(menu).getByRole("menuitem", { name: "Engineering workspace" });
    await waitFor(() => {
      const bounds = engineering.getBoundingClientRect();
      const target = canvasElement.ownerDocument.elementFromPoint(
        bounds.left + bounds.width / 2,
        bounds.top + bounds.height / 2,
      );
      expect(engineering.contains(target)).toBe(true);
    });
    await userEvent.click(engineering);
    await expect(canvas.getByLabelText("Current workspace")).toHaveTextContent("Engineering workspace");
    await waitFor(() => expect(workspace).toHaveFocus());
    await userEvent.click(canvas.getByRole("button", { name: "Toggle Sidebar" }));
    await expect(canvas.getByRole("button", { name: "Toggle Sidebar" })).toHaveAttribute("aria-expanded", "false");
    const account = canvas.getByRole("button", { name: "Account actions" });
    account.focus();
    await userEvent.keyboard("{Enter}");
    const accountMenu = await body.findByRole("menu");
    const profile = within(accountMenu).getByRole("menuitem", { name: "Open profile" });
    await waitFor(() => {
      const bounds = profile.getBoundingClientRect();
      const target = canvasElement.ownerDocument.elementFromPoint(
        bounds.left + bounds.width / 2,
        bounds.top + bounds.height / 2,
      );
      expect(profile.contains(target)).toBe(true);
    });
    await userEvent.click(profile);
    await expect(canvas.getByLabelText("Account result")).toHaveTextContent("Profile opened");
    await waitFor(() => expect(account).toHaveFocus());
  },
};

function RenderContracts(): ReactElement {
  const linkRef = useRef<HTMLAnchorElement>(null);
  const [result, setResult] = useState("No submission");
  return (
    <SidebarProvider defaultOpen={false}>
      <Sidebar aria-label="Custom navigation" collapsible="icon">
        <SidebarContent>
          <SidebarGroup>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive
                  tooltip="Custom destination"
                  render={(props, state) => (
                    <a {...props} ref={linkRef} href="#custom" aria-current={state.active ? "page" : undefined}>
                      Custom destination
                    </a>
                  )}
                />
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <Button onClick={() => linkRef.current?.focus()}>Focus destination</Button>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            setResult("Submitted");
          }}
        >
          <SidebarMenuButton onClick={() => setResult("Action selected")}>Native action</SidebarMenuButton>
          <SidebarGroupAction aria-label="Native group action" onClick={() => setResult("Group selected")} />
          <SidebarMenuAction aria-label="Native menu action" onClick={() => setResult("Menu selected")} />
          <output aria-label="Action result">{result}</output>
        </form>
        <SidebarTrigger onClick={(event) => event.preventDefault()} />
        <SidebarRail aria-label="Cancelled rail" onClick={(event) => event.preventDefault()} />
      </SidebarInset>
    </SidebarProvider>
  );
}

export const NativeRenderContracts: Story = {
  render: () => <RenderContracts />,
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const destination = canvas.getByRole("link", { name: "Custom destination" });
    await expect(destination).toHaveAttribute("aria-current", "page");
    await userEvent.click(canvas.getByRole("button", { name: "Focus destination" }));
    await expect(destination).toHaveFocus();
    await waitFor(() =>
      expect(canvasElement.ownerDocument.querySelector('[data-slot="tooltip-content"]')).toHaveTextContent(
        "Custom destination",
      ),
    );
    await userEvent.click(canvas.getByRole("button", { name: "Native action" }));
    await expect(canvas.getByRole("status", { name: "Action result" })).toHaveTextContent("Action selected");
    await userEvent.click(canvas.getByRole("button", { name: "Native group action" }));
    await expect(canvas.getByRole("status", { name: "Action result" })).toHaveTextContent("Group selected");
    await userEvent.click(canvas.getByRole("button", { name: "Native menu action" }));
    await expect(canvas.getByRole("status", { name: "Action result" })).toHaveTextContent("Menu selected");
    await userEvent.click(canvas.getByRole("button", { name: "Toggle Sidebar" }));
    await expect(canvas.getByRole("button", { name: "Toggle Sidebar" })).toHaveAttribute("aria-expanded", "false");
    await userEvent.click(canvas.getByRole("button", { name: "Cancelled rail" }));
    await expect(canvas.getByRole("button", { name: "Cancelled rail" })).toHaveAttribute("aria-expanded", "false");
  },
};

export const IconCollapse: Story = {
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: "Toggle Sidebar" });
    const panel = canvas.getByRole("complementary", { name: "Project navigation" });
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    const expandedWidth = panel.getBoundingClientRect().width;
    await userEvent.click(trigger);
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await waitFor(() => expect(panel.getBoundingClientRect().width).toBeLessThan(expandedWidth));
    await expect(canvas.getByRole("link", { name: "Home" })).toHaveAttribute("aria-current", "page");
    await waitFor(() => {
      const link = canvas.getByRole("link", { name: "Home" }).getBoundingClientRect();
      const bounds = panel.getBoundingClientRect();
      expect(link.right).toBeLessThanOrEqual(bounds.right);
      expect(link.left).toBeGreaterThanOrEqual(bounds.left);
      expect(Math.abs((link.left + link.right) / 2 - (bounds.left + bounds.right) / 2)).toBeLessThanOrEqual(1);
    });
    await expect(canvas.queryByRole("textbox", { name: "Search projects" })).not.toBeInTheDocument();
    const icon = canvas.getByRole("link", { name: "Home" }).querySelector("svg");
    await waitFor(() => {
      const link = canvas.getByRole("link", { name: "Home" }).getBoundingClientRect();
      const bounds = icon?.getBoundingClientRect();
      expect(bounds).toBeDefined();
      expect(Math.abs((bounds?.left ?? 0) + (bounds?.right ?? 0) - link.left - link.right)).toBeLessThanOrEqual(1);
    });
    await expect(canvas.queryByRole("link", { name: "Recent documents" })).not.toBeInTheDocument();
    await userEvent.click(trigger);
    await waitFor(() => expect(panel.getBoundingClientRect().width).toBe(expandedWidth));
    await expect(canvas.getByRole("link", { name: "Recent documents" })).toBeVisible();
  },
};

export const Offcanvas: Story = {
  args: { collapsible: "offcanvas" },
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Toggle Sidebar" }));
    await expect(canvas.queryByRole("link", { name: "Home" })).not.toBeInTheDocument();
    await expect(canvas.queryByRole("complementary", { name: "Project navigation" })).not.toBeInTheDocument();
    await userEvent.tab();
    await expect(canvas.getByRole("button", { name: "Collapse desktop" })).toHaveFocus();
    await userEvent.click(canvas.getByRole("button", { name: "Expand desktop" }));
    await expect(canvas.getByRole("link", { name: "Home" })).toBeVisible();
  },
};

export const NonCollapsible: Story = {
  args: { collapsible: "none" },
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const panel = canvas.getByRole("complementary", { name: "Project navigation" });
    const width = panel.getBoundingClientRect().width;
    await userEvent.click(canvas.getByRole("button", { name: "Toggle Sidebar" }));
    await expect(canvas.getByRole("link", { name: "Documents" })).toBeVisible();
    await expect(panel.getBoundingClientRect().width).toBe(width);
  },
};

export const KeyboardShortcut: Story = {
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("textbox", { name: "Search projects" }));
    await userEvent.keyboard("{Control>}b{/Control}");
    await expect(canvas.getByRole("button", { name: "Toggle Sidebar" })).toHaveAttribute("aria-expanded", "false");
    await expect(canvasElement.ownerDocument.cookie.split("; ")).toEqual(
      expect.arrayContaining(["sidebar_state=false"]),
    );
    await userEvent.keyboard("{Meta>}b{/Meta}");
    await expect(canvas.getByRole("button", { name: "Toggle Sidebar" })).toHaveAttribute("aria-expanded", "true");
    await expect(canvasElement.ownerDocument.cookie.split("; ")).toEqual(
      expect.arrayContaining(["sidebar_state=true"]),
    );
  },
};

function ControlledLayout(args: LayoutProps): ReactElement {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <SidebarProvider open={isOpen} onOpenChange={setIsOpen}>
      <Layout {...args} />
    </SidebarProvider>
  );
}

export const Controlled: Story = {
  render: (args) => <ControlledLayout {...args} />,
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("button", { name: "Toggle Sidebar" })).toHaveAttribute("aria-expanded", "false");
    await userEvent.click(canvas.getByRole("button", { name: "Toggle Sidebar" }));
    await expect(canvas.getByRole("button", { name: "Toggle Sidebar" })).toHaveAttribute("aria-expanded", "true");
    await userEvent.click(canvas.getByRole("button", { name: "Collapse desktop" }));
    await expect(canvas.getByRole("button", { name: "Toggle Sidebar" })).toHaveAttribute("aria-expanded", "false");
  },
};

export const ObserverCallback: Story = {
  render: (args) => (
    <SidebarProvider onOpenChange={fn()}>
      <Layout {...args} />
    </SidebarProvider>
  ),
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Toggle Sidebar" }));
    await expect(canvas.getByRole("button", { name: "Toggle Sidebar" })).toHaveAttribute("aria-expanded", "false");
    await userEvent.click(canvas.getByRole("button", { name: "Toggle Sidebar" }));
    await expect(canvas.getByRole("button", { name: "Toggle Sidebar" })).toHaveAttribute("aria-expanded", "true");
  },
};

export const IconTooltip: Story = {
  render: (args) => (
    <SidebarProvider defaultOpen={false}>
      <Layout {...args} />
    </SidebarProvider>
  ),
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const link = canvas.getByRole("link", { name: "Home" });
    await userEvent.hover(link);
    await waitFor(() => {
      const popup = canvasElement.ownerDocument.querySelector('[data-slot="tooltip-content"]');
      expect(popup).toBeVisible();
      expect(popup).toHaveTextContent("Home");
    });
    await expect(link).not.toHaveAttribute("role", "button");
    await userEvent.unhover(link);
    await userEvent.click(canvas.getByRole("button", { name: "Expand desktop" }));
    await userEvent.hover(link);
    await waitFor(() =>
      expect(canvasElement.ownerDocument.querySelector('[data-slot="tooltip-content"]')).not.toBeInTheDocument(),
    );
  },
};

export const Floating: Story = {
  ...IconCollapse,
  args: { variant: "floating", collapsible: "icon" },
};

export const CompactDensity: Story = {
  ...IconCollapse,
  render: (args) => (
    <DensityProvider density="compact">
      <SidebarProvider>
        <Layout {...args} />
      </SidebarProvider>
    </DensityProvider>
  ),
};

export const ComfortableDensity: Story = {
  ...IconCollapse,
  render: (args) => (
    <DensityProvider density="comfortable">
      <SidebarProvider>
        <Layout {...args} />
      </SidebarProvider>
    </DensityProvider>
  ),
};

export const Inset: Story = {
  ...IconCollapse,
  args: { variant: "inset", collapsible: "icon" },
};

export const RightSide: Story = {
  args: { side: "right" },
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const panel = canvas.getByRole("complementary", { name: "Project navigation" });
    await expect(panel.getBoundingClientRect().right).toBe(canvasElement.ownerDocument.documentElement.clientWidth);
    await userEvent.click(canvas.getByRole("button", { name: "Toggle Sidebar" }));
    await waitFor(() => expect(panel.getBoundingClientRect().width).toBe(48));
    await expect(panel.getBoundingClientRect().right).toBe(canvasElement.ownerDocument.documentElement.clientWidth);
  },
};

export const MobileSheet: Story = {
  parameters: {
    viewport: {
      defaultViewport: "phone",
      options: { phone: { name: "Phone", type: "mobile", styles: { width: "390px", height: "844px" } } },
    },
  },
  render: (args) => (
    <SidebarProvider density="compact">
      <Layout {...args} />
    </SidebarProvider>
  ),
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: "Toggle Sidebar" });
    await expect(canvas.queryByRole("link", { name: "Home" })).not.toBeInTheDocument();
    await userEvent.click(trigger);
    const dialog = await within(canvasElement.ownerDocument.body).findByRole("dialog", { name: "Sidebar" });
    await expect(dialog).toHaveAccessibleDescription("Displays the mobile sidebar.");
    const view = canvasElement.ownerDocument.defaultView!;
    expect(view.getComputedStyle(dialog).backgroundColor).toBe(
      view.getComputedStyle(canvasElement.ownerDocument.body).backgroundColor,
    );
    expect(view.getComputedStyle(dialog).backgroundColor).not.toBe("rgba(0, 0, 0, 0)");
    await expect(dialog.getBoundingClientRect().width).toBe(288);
    const brand = within(dialog).getByText("Workspace").getBoundingClientRect();
    const close = within(dialog).getByRole("button", { name: "Close" }).getBoundingClientRect();
    await expect(
      brand.right <= close.left || brand.left >= close.right || brand.bottom <= close.top || brand.top >= close.bottom,
    ).toBe(true);
    await expect(within(dialog).getByRole("textbox", { name: "Search projects" }).getBoundingClientRect().height).toBe(
      20,
    );
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(trigger).toHaveFocus());
    await expect(within(canvasElement.ownerDocument.body).queryByRole("dialog")).not.toBeInTheDocument();
  },
};

export const MobileRightRtl: Story = { ...MobileSheet, args: { side: "right", dir: "rtl" } };

export const MobileInheritedRtl: Story = {
  ...MobileSheet,
  render: (args) => (
    <DirectionProvider direction="rtl">
      <SidebarProvider>
        <Layout {...args} />
      </SidebarProvider>
    </DirectionProvider>
  ),
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: "Toggle Sidebar" });
    await userEvent.click(trigger);
    const dialog = await within(canvasElement.ownerDocument.body).findByRole("dialog", { name: "Sidebar" });
    await expect(dialog).toHaveAttribute("dir", "rtl");
    expect(canvasElement.ownerDocument.defaultView!.getComputedStyle(dialog).direction).toBe("rtl");
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};

export const Loading: Story = {
  render: (args) => (
    <SidebarProvider>
      <Sidebar {...args} aria-label="Loading projects">
        <SidebarHeader>Loading projects</SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuSkeleton showIcon role="status" aria-label="Loading navigation" />
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuSkeleton role="status" aria-label="Loading another item" />
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <SidebarTrigger />
      </SidebarInset>
    </SidebarProvider>
  ),
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const indicator = canvas.getByRole("status", { name: "Loading navigation" });
    await expect(indicator).toBeVisible();
    await expect(indicator.getBoundingClientRect().height).toBeGreaterThan(0);
    await userEvent.click(canvas.getByRole("button", { name: "Toggle Sidebar" }));
    await expect(canvas.getByRole("button", { name: "Toggle Sidebar" })).toHaveAttribute("aria-expanded", "false");
  },
};

export const CollapsibleGroup: Story = {
  render: (args) => (
    <SidebarProvider>
      <Sidebar {...args} aria-label="Collapsible navigation">
        <SidebarContent>
          <Collapsible defaultOpen>
            <SidebarGroup>
              <SidebarGroupLabel render={<CollapsibleTrigger />}>Project folders</SidebarGroupLabel>
              <CollapsibleContent>
                <SidebarGroupContent>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton render={<a href="#folder" />}>Folder link</SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </CollapsibleContent>
            </SidebarGroup>
          </Collapsible>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <SidebarTrigger />
      </SidebarInset>
    </SidebarProvider>
  ),
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Project folders" }));
    await waitFor(() => expect(canvas.queryByRole("link", { name: "Folder link" })).not.toBeInTheDocument());
    await userEvent.click(canvas.getByRole("button", { name: "Project folders" }));
    await expect(await canvas.findByRole("link", { name: "Folder link" })).toBeVisible();
  },
};

const inputClassName = fn((state: Input.State) => (state.disabled ? "h-12" : "h-8"));
const inputRef = fn();
const inputValueChange = fn();
export const NativeInputCallback: Story = {
  render: (args) => {
    const [isDisabled, setIsDisabled] = useState(false);
    return (
      <SidebarProvider>
        <Sidebar {...args} collapsible="none" aria-label="Input callback navigation">
          <SidebarHeader>
            <SidebarInput
              aria-label="State-aware search"
              disabled={isDisabled}
              className={inputClassName}
              ref={inputRef}
              onValueChange={inputValueChange}
            />
          </SidebarHeader>
        </Sidebar>
        <SidebarInset>
          <Button onClick={() => setIsDisabled(!isDisabled)}>{isDisabled ? "Enable search" : "Disable search"}</Button>
        </SidebarInset>
      </SidebarProvider>
    );
  },
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("textbox", { name: "State-aware search" });
    await expect(inputClassName).toHaveBeenCalledWith(expect.objectContaining({ disabled: false }));
    await expect(inputRef).toHaveBeenCalledWith(input);
    await expect(input.getBoundingClientRect().height).toBe(32);
    await userEvent.type(input, "project");
    await expect(inputValueChange).toHaveBeenLastCalledWith("project", expect.anything());
    await userEvent.click(canvas.getByRole("button", { name: "Disable search" }));
    await expect(input).toBeDisabled();
    await expect(inputClassName).toHaveBeenCalledWith(expect.objectContaining({ disabled: true }));
    await waitFor(() => expect(input.getBoundingClientRect().height).toBe(48));
    await userEvent.click(canvas.getByRole("button", { name: "Enable search" }));
    await expect(input).toBeEnabled();
    await waitFor(() => expect(input.getBoundingClientRect().height).toBe(32));
    await userEvent.type(input, "-new");
    await expect(inputValueChange).toHaveBeenLastCalledWith("project-new", expect.anything());
  },
};

export const TrailingContent: Story = {
  render: () => (
    <SidebarProvider>
      <div style={{ width: 180 }}>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton trailing={123456} onClick={fn()}>
              <FileIcon />
              <span>A very long playlist title that must truncate</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </div>
    </SidebarProvider>
  ),
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole("button", { name: "A very long playlist title that must truncate 123456" });
    const count = canvas.getByText("123456");
    await expect(count).toBeVisible();
    const bounds = button.getBoundingClientRect();
    const countBounds = count.getBoundingClientRect();
    await expect(countBounds.right).toBeLessThanOrEqual(bounds.right);
    await expect(countBounds.left).toBeGreaterThan(bounds.left);
    await expect(button.scrollWidth).toBe(button.clientWidth);
    await userEvent.click(button);
    await expect(button).toHaveFocus();
  },
};
