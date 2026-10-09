import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import { DotIcon } from "lucide-react";
import { Button } from "../Button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../DropdownMenu";
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "../Breadcrumb";

const meta: Meta<typeof Breadcrumb> = {
  title: "shadcn-alexgorbatchev/components/Breadcrumb",
  component: Breadcrumb,
  tags: ["autodocs", "test"],
  render: (args) => (
    <Breadcrumb {...args}>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="#home">Home</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>Components</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  ),
};
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const navigation = within(within(canvasElement).getByRole("navigation", { name: "breadcrumb" }));
    await expect(navigation.getByRole("link", { name: "Home" })).toHaveAttribute("href", "#home");
    await expect(navigation.getByRole("link", { name: "Components" })).toHaveAttribute("aria-current", "page");
    await expect(navigation.getByRole("link", { name: "Components" })).toHaveAttribute("aria-disabled", "true");
  },
};
export const Collapsed: Story = {
  render: (args) => (
    <Breadcrumb {...args}>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink render={<a href="#home" />}>Home</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator>/</BreadcrumbSeparator>
        <BreadcrumbItem>
          <BreadcrumbEllipsis />
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>Components</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const navigation = canvas.getByRole("navigation", { name: "breadcrumb" });
    const ellipsis = navigation.querySelector('[data-slot="breadcrumb-ellipsis"]') as HTMLElement;
    await expect(ellipsis.querySelector("svg")).toBeVisible();
    await expect(ellipsis).toHaveAttribute("aria-hidden", "true");
    await expect(canvas.queryByRole("button", { name: "More" })).not.toBeInTheDocument();
    await expect(canvas.getByRole("link", { name: "Home" })).toHaveAttribute("href", "#home");
    await expect(canvas.getByRole("link", { name: "Components" })).toHaveAttribute("aria-current", "page");
  },
};

export const CustomSeparator: Story = {
  render: (args) => (
    <Breadcrumb {...args}>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="#home">Home</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator>
          <DotIcon />
        </BreadcrumbSeparator>
        <BreadcrumbItem>
          <BreadcrumbPage>Components</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const navigation = canvas.getByRole("navigation", { name: "breadcrumb" });
    const separator = navigation.querySelector('[data-slot="breadcrumb-separator"]') as HTMLElement;
    await expect(separator.querySelector("svg")).toBeVisible();
    await expect(separator).toHaveAttribute("aria-hidden", "true");
    await expect(within(navigation).getAllByRole("listitem")).toHaveLength(2);
    await userEvent.tab();
    await expect(canvas.getByRole("link", { name: "Home" })).toHaveFocus();
    await userEvent.tab();
    await expect(canvas.getByRole("link", { name: "Components" })).not.toHaveFocus();
  },
};

const onLinkClick = fn();
const onRenderedClick = fn();
const linkRef = fn();
const renderedRef = fn();
export const CustomLink: Story = {
  render: (args) => (
    <Breadcrumb {...args}>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink
            ref={linkRef}
            onClick={onLinkClick}
            render={
              <a
                href="#custom-home"
                ref={renderedRef}
                onClick={(event) => {
                  event.preventDefault();
                  onRenderedClick();
                }}
              />
            }
          >
            Home
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>Components</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const link = canvas.getByRole("link", { name: "Home" });
    await expect(link.tagName).toBe("A");
    await expect(link).toHaveAttribute("href", "#custom-home");
    await expect(linkRef).toHaveBeenCalledWith(link);
    await expect(renderedRef).toHaveBeenCalledWith(link);
    await userEvent.tab();
    await expect(link).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await expect(onLinkClick).toHaveBeenCalledOnce();
    await expect(onRenderedClick).toHaveBeenCalledOnce();
    await expect(canvas.getByRole("link", { name: "Components" })).toHaveAttribute("aria-current", "page");
  },
};

const onSelect = fn();
export const Dropdown: Story = {
  render: (args) => (
    <Breadcrumb {...args}>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="#home">Home</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="ghost" size="xs" aria-label="Show ancestors" />}>
              <BreadcrumbEllipsis />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuGroup>
                <DropdownMenuItem
                  render={<a href="#projects" />}
                  onClick={(event) => {
                    event.preventDefault();
                    onSelect();
                  }}
                >
                  Projects
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>Components</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole("button", { name: "Show ancestors" });
    await userEvent.tab();
    await expect(canvas.getByRole("link", { name: "Home" })).toHaveFocus();
    await userEvent.tab();
    await expect(trigger).toHaveFocus();
    await userEvent.keyboard("{ArrowDown}");
    const item = await body.findByRole("menuitem", { name: "Projects" });
    await expect(item.tagName).toBe("A");
    await expect(item).toHaveAttribute("href", "#projects");
    await waitFor(() => expect(item).toHaveFocus());
    await userEvent.keyboard("{Enter}");
    await expect(onSelect).toHaveBeenCalledOnce();
    await waitFor(() => expect(body.queryByRole("menu")).not.toBeInTheDocument());
    await expect(trigger).toHaveFocus();
  },
};

export const RightToLeft: Story = {
  args: { dir: "rtl" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const navigation = canvas.getByRole("navigation", { name: "breadcrumb" });
    const home = canvas.getByRole("link", { name: "Home" });
    const page = canvas.getByRole("link", { name: "Components" });
    const icon = navigation.querySelector('[data-slot="breadcrumb-separator"] svg') as SVGSVGElement;
    await expect(page.getBoundingClientRect().right).toBeLessThan(home.getBoundingClientRect().left);
    await expect(icon.getScreenCTM()?.a).toBeLessThan(0);
    await userEvent.tab();
    await expect(home).toHaveFocus();
  },
};
