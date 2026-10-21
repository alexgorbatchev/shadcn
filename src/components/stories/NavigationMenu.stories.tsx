import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, waitFor, within } from "storybook/test";
import { useState } from "react";

import { DirectionProvider } from "../DirectionProvider";
import { FileIcon, SettingsIcon } from "lucide-react";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "../NavigationMenu";

const linkRef = fn();
const linkClick = fn();
const renderClick = fn();

const meta: Meta<typeof NavigationMenu> = {
  title: "shadcn-alexgorbatchev/components/NavigationMenu",
  component: NavigationMenu,
  tags: ["autodocs", "test"],
  args: { delay: 0, closeDelay: 0, className: fn(() => "font-normal") },
};
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  render: (args) => (
    <NavigationMenu {...args} aria-label="Main navigation">
      <NavigationMenuList>
        <NavigationMenuItem value="products">
          <NavigationMenuTrigger>Products</NavigationMenuTrigger>
          <NavigationMenuContent>
            <NavigationMenuLink href="#components" active>
              Components
            </NavigationMenuLink>
            <NavigationMenuLink href="#themes">Themes</NavigationMenuLink>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem value="learn">
          <NavigationMenuTrigger>Learn</NavigationMenuTrigger>
          <NavigationMenuContent>
            <NavigationMenuLink href="#guides">Guides</NavigationMenuLink>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink href="#about">About</NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  ),
  play: async ({ canvasElement, args, userEvent }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole("button", { name: "Products" });
    const indicator = trigger.querySelector('[data-slot="navigation-menu-indicator"]');
    await expect(indicator).toHaveAttribute("aria-hidden", "true");
    trigger.focus();
    await userEvent.keyboard("{ArrowDown}");
    const components = await body.findByRole("link", { name: "Components" });
    await expect(components).toHaveAttribute("href", "#components");
    await expect(components).toHaveAttribute("aria-current", "page");
    await expect(indicator).toHaveAttribute("data-popup-open", "");
    await userEvent.tab();
    await waitFor(() => expect(components).toHaveFocus());
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(body.queryByRole("link", { name: "Components" })).not.toBeInTheDocument());
    await expect(indicator).not.toHaveAttribute("data-popup-open");
    await expect(args.className).toHaveBeenCalledWith(expect.any(Object));
    await expect(canvas.getByRole("link", { name: "About" })).toHaveAttribute("href", "#about");
  },
};
export const Compact: Story = { ...Default, globals: { density: "compact" } };

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
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole("button", { name: "Products" });
    trigger.focus();
    await userEvent.keyboard("{ArrowDown}");
    const link = await body.findByRole("link", { name: "Components" });
    await expect(getComputedStyle(link).direction).toBe("rtl");
    const root = canvas.getByRole("navigation", { name: "Main navigation" });
    const popup = link.closest('[data-slot="navigation-menu-popup"]')!;
    await waitFor(() =>
      expect(Math.abs(popup.getBoundingClientRect().right - root.getBoundingClientRect().right)).toBeLessThanOrEqual(1),
    );
    const indicator = trigger.querySelector('[data-slot="navigation-menu-indicator"]')!;
    const style = getComputedStyle(indicator);
    await expect(parseFloat(style.marginRight)).toBeGreaterThan(parseFloat(style.marginLeft));
    await userEvent.tab();
    await waitFor(() => expect(link).toHaveFocus());
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(body.queryByRole("link", { name: "Components" })).not.toBeInTheDocument());
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};

export const ControlledValue: Story = {
  render: function Render() {
    const [value, setValue] = useState<number | null>(null);
    return (
      <>
        <NavigationMenu<number>
          value={value}
          onValueChange={(nextValue) => setValue(nextValue)}
          delay={0}
          closeDelay={0}
          aria-label="Controlled navigation"
        >
          <NavigationMenuList>
            <NavigationMenuItem value={1}>
              <NavigationMenuTrigger>Products</NavigationMenuTrigger>
              <NavigationMenuContent>
                <NavigationMenuLink href="#components">Components</NavigationMenuLink>
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
        <output aria-label="Open navigation item">{value?.toFixed(0) ?? "Closed"}</output>
      </>
    );
  },
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(await within(canvasElement.ownerDocument.body).findByRole("button", { name: "Products" }));
    const link = await body.findByRole("link", { name: "Components" });
    await waitFor(() => expect(link).toBeVisible());
    await expect(canvas.getByRole("status", { name: "Open navigation item" })).toHaveTextContent("1");
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(body.queryByRole("link", { name: "Components" })).not.toBeInTheDocument());
    await expect(canvas.getByRole("status", { name: "Open navigation item" })).toHaveTextContent("Closed");
  },
};

export const LinkComponent: Story = {
  render: (args) => (
    <NavigationMenu {...args} aria-label="Custom link navigation">
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuLink
            href="#navigation-documentation"
            active
            ref={linkRef}
            onClick={linkClick}
            render={<a target="_self" onClick={renderClick} />}
            className={navigationMenuTriggerStyle()}
          >
            Documentation
          </NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  ),
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const link = canvas.getByRole("link", { name: "Documentation" });
    await expect(link).toHaveAttribute("href", "#navigation-documentation");
    await expect(link).toHaveAttribute("aria-current", "page");
    await expect(linkRef).toHaveBeenCalledWith(link);
    await expect(canvas.queryByRole("button", { name: "Documentation" })).not.toBeInTheDocument();
    link.focus();
    await userEvent.keyboard("{Enter}");
    await expect(linkClick).toHaveBeenCalledTimes(1);
    await expect(renderClick).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(canvasElement.ownerDocument.location.hash).toBe("#navigation-documentation"));
    await expect(link).toHaveFocus();
  },
};

export const RightToLeftLinkComponent: Story = { ...LinkComponent, decorators: RightToLeft.decorators };
export const RightToLeftCompact: Story = { ...RightToLeft, globals: { density: "compact" } };

export const WithIcons: Story = {
  render: function Render(args) {
    const [destination, setDestination] = useState("No destination");
    return (
      <>
        <NavigationMenu {...args} aria-label="Workspace navigation">
          <NavigationMenuList>
            <NavigationMenuItem value="workspace">
              <NavigationMenuTrigger>Workspace</NavigationMenuTrigger>
              <NavigationMenuContent className="w-64">
                <NavigationMenuLink
                  href="#navigation-files"
                  target="_self"
                  closeOnClick
                  onClick={() => setDestination("Files")}
                >
                  <FileIcon aria-hidden="true" />
                  Files
                </NavigationMenuLink>
                <NavigationMenuLink
                  href="#navigation-settings"
                  target="_self"
                  closeOnClick
                  onClick={() => setDestination("Settings")}
                >
                  <SettingsIcon aria-hidden="true" />
                  Settings
                </NavigationMenuLink>
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
        <output aria-label="Navigation destination">{destination}</output>
      </>
    );
  },
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole("button", { name: "Workspace" });
    await userEvent.click(trigger);
    const settings = await body.findByRole("link", { name: "Settings" });
    await waitFor(() => expect(settings).toBeVisible());
    const icon = settings.querySelector("svg")!;
    await expect(icon).toHaveAttribute("aria-hidden", "true");
    await expect(icon.getBoundingClientRect().width).toBe(16);
    await userEvent.click(settings);
    await waitFor(() => expect(body.queryByRole("link", { name: "Settings" })).not.toBeInTheDocument());
    await expect(canvas.getByRole("status", { name: "Navigation destination" })).toHaveTextContent("Settings");
    await waitFor(() => expect(canvasElement.ownerDocument.location.hash).toBe("#navigation-settings"));
  },
};
export const RightToLeftWithIcons: Story = { ...WithIcons, decorators: RightToLeft.decorators };

export const CancelOpening: Story = {
  ...Default,
  args: { onValueChange: (_value, details) => details.cancel() },
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Products" }));
    await expect(canvas.getByRole("button", { name: "Products" })).toHaveAttribute("aria-expanded", "false");
    await expect(
      within(canvasElement.ownerDocument.body).queryByRole("link", { name: "Components" }),
    ).not.toBeInTheDocument();
  },
};

export const CancelClosing: Story = {
  ...Default,
  args: {
    onValueChange: (value, details) => {
      if (value === null) details.cancel();
    },
  },
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole("button", { name: "Products" });
    await userEvent.click(trigger);
    const link = await body.findByRole("link", { name: "Components" });
    await waitFor(() => expect(link).toBeVisible());
    await userEvent.keyboard("{Escape}");
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    await expect(link).toBeVisible();
  },
};

export const DefaultOpen: Story = {
  ...Default,
  args: { defaultValue: "products" },
  parameters: { docs: { story: { inline: false, height: "300px" } } },
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const link = await body.findByRole("link", { name: "Components" });
    await waitFor(() => expect(link).toBeVisible());
    await expect(canvas.getByRole("button", { name: "Products" })).toHaveAttribute("aria-expanded", "true");
    await userEvent.click(await within(canvasElement.ownerDocument.body).findByRole("button", { name: "Products" }));
    await waitFor(() => expect(body.queryByRole("link", { name: "Components" })).not.toBeInTheDocument());
  },
};
