import type { Separator } from "@base-ui/react/separator";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import { useState, type MouseEvent } from "react";
import { FileIcon } from "lucide-react";
import { Button } from "../Button";
import { Avatar, AvatarFallback, AvatarGroup, AvatarImage } from "../Avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../DropdownMenu";
import { fixture_avatarImage } from "./fixtures";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemFooter,
  ItemGroup,
  ItemHeader,
  ItemMedia,
  ItemSeparator,
  ItemTitle,
} from "../Item";

const meta: Meta<typeof Item> = {
  title: "shadcn-alexgorbatchev/components/Item",
  component: Item,
  tags: ["autodocs", "test"],
  argTypes: {
    variant: { control: "select", options: ["default", "outline", "muted"] },
    size: { control: "select", options: ["default", "sm", "xs"] },
    density: { control: "select", options: ["compact", "comfortable"] },
  },
};
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  render: function Render(args) {
    const [saved, setSaved] = useState(false);
    return (
      <ItemGroup aria-label="Documents">
        <Item {...args} role="listitem">
          <ItemHeader>Workspace</ItemHeader>
          <ItemMedia variant="icon">
            <FileIcon />
          </ItemMedia>
          <ItemContent>
            <ItemTitle>Project notes</ItemTitle>
            <ItemDescription>Shared notes for the team.</ItemDescription>
          </ItemContent>
          <ItemActions>
            <Button onClick={() => setSaved(true)}>Save notes</Button>
          </ItemActions>
          <ItemFooter>
            <output aria-label="Save status">{saved ? "Saved" : "Unsaved"}</output>
          </ItemFooter>
        </Item>
        <ItemSeparator />
        <div role="listitem">
          <Item render={<a href="#archive" />}>
            <ItemContent>
              <ItemTitle>Archive</ItemTitle>
              <ItemDescription>Browse earlier notes.</ItemDescription>
            </ItemContent>
          </Item>
        </div>
      </ItemGroup>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("list", { name: "Documents" })).toBeVisible();
    await expect(canvas.getAllByRole("listitem")).toHaveLength(2);
    await expect(canvas.getByRole("link", { name: "Archive Browse earlier notes." })).toHaveAttribute(
      "href",
      "#archive",
    );
    await userEvent.click(canvas.getByRole("button", { name: "Save notes" }));
    await expect(canvas.getByRole("status", { name: "Save status" })).toHaveTextContent("Saved");
  },
};
export const Outline: Story = { ...Default, args: { variant: "outline" } };
export const Muted: Story = { ...Default, args: { variant: "muted", size: "sm" } };
export const Compact: Story = { ...Default, args: { density: "compact", size: "xs" } };

const separatorClassName = fn((state: Separator.State) =>
  state.orientation === "horizontal" ? "data-[orientation=horizontal]:h-2" : "data-[orientation=vertical]:w-2",
);
export const NativeSeparatorCallback: Story = {
  render: () => {
    const [orientation, setOrientation] = useState<"horizontal" | "vertical">("horizontal");
    return (
      <ItemGroup
        aria-label="Orientation-aware documents"
        className={orientation === "horizontal" ? "flex-col" : "flex-row"}
      >
        <Item role="listitem">
          <ItemContent>
            <ItemTitle>Project notes</ItemTitle>
            <ItemDescription>Adjust the document separator.</ItemDescription>
          </ItemContent>
          <ItemActions>
            <Button onClick={() => setOrientation(orientation === "horizontal" ? "vertical" : "horizontal")}>
              Change separator orientation
            </Button>
          </ItemActions>
        </Item>
        <ItemSeparator orientation={orientation} className={separatorClassName} />
        <Item role="listitem">
          <ItemContent>
            <ItemTitle>Archive</ItemTitle>
            <ItemDescription>Earlier project notes.</ItemDescription>
          </ItemContent>
        </Item>
      </ItemGroup>
    );
  },
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const separator = canvas.getByRole("separator");
    await expect(separatorClassName).toHaveBeenCalledWith(expect.objectContaining({ orientation: "horizontal" }));
    await expect(separator.getBoundingClientRect().height).toBe(8);
    await userEvent.click(canvas.getByRole("button", { name: "Change separator orientation" }));
    await waitFor(() => expect(separator).toHaveAttribute("aria-orientation", "vertical"));
    await expect(separatorClassName).toHaveBeenCalledWith(expect.objectContaining({ orientation: "vertical" }));
    await waitFor(() => expect(separator.getBoundingClientRect().width).toBe(8));
    await expect(separator.getBoundingClientRect().height).toBeGreaterThan(0);
  },
};

export const RightToLeft: Story = {
  ...Default,
  decorators: [
    (Story) => (
      <div dir="rtl">
        <Story />
      </div>
    ),
  ],
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const description = canvas.getByText("Shared notes for the team.");
    const content = description.closest('[data-slot="item-content"]') as HTMLElement;
    const range = canvasElement.ownerDocument.createRange();
    range.selectNodeContents(description);
    await expect(
      Math.abs(range.getBoundingClientRect().right - content.getBoundingClientRect().right),
    ).toBeLessThanOrEqual(1);
    await userEvent.click(canvas.getByRole("button", { name: "Save notes" }));
    await expect(canvas.getByRole("status", { name: "Save status" })).toHaveTextContent("Saved");
  },
};

export const WithAvatar: Story = {
  render: (args) => (
    <Item {...args} variant="outline">
      <ItemMedia>
        <Avatar>
          <AvatarImage src={fixture_avatarImage} alt="Alex" />
          <AvatarFallback>AG</AvatarFallback>
        </Avatar>
      </ItemMedia>
      <ItemContent>
        <ItemTitle>Alex</ItemTitle>
        <ItemDescription>Project owner</ItemDescription>
      </ItemContent>
      <ItemActions>
        <Button variant="outline" onClick={onOpenProfile}>
          Open profile
        </Button>
      </ItemActions>
    </Item>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const image = await canvas.findByRole("img", { name: "Alex" });
    await waitFor(() => expect((image as HTMLImageElement).naturalWidth).toBeGreaterThan(0));
    await expect(image).toBeVisible();
    await userEvent.tab();
    await expect(canvas.getByRole("button", { name: "Open profile" })).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await expect(onOpenProfile).toHaveBeenCalledOnce();
  },
};
const onOpenProfile = fn();
export const WithAvatarGroup: Story = {
  render: function Render(args) {
    const [invited, setInvited] = useState(false);
    return (
      <Item {...args} variant="outline" className="max-w-lg">
        <ItemMedia>
          <AvatarGroup aria-label="Team members">
            {["Alex", "Jordan", "Sam"].map((name) => (
              <Avatar key={name}>
                <AvatarImage src={fixture_avatarImage} alt={name} />
                <AvatarFallback>{name.slice(0, 1)}</AvatarFallback>
              </Avatar>
            ))}
          </AvatarGroup>
        </ItemMedia>
        <ItemContent>
          <ItemTitle>Project team</ItemTitle>
          <ItemDescription>Invite your team to collaborate.</ItemDescription>
        </ItemContent>
        <ItemActions>
          <Button variant="outline" size="sm" onClick={() => setInvited(true)}>
            Invite team
          </Button>
        </ItemActions>
        <ItemFooter>
          <output aria-label="Invitation status">{invited ? "Invited" : "Pending"}</output>
        </ItemFooter>
      </Item>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const images = canvas.getAllByRole("img");
    await waitFor(() => images.forEach((image) => expect((image as HTMLImageElement).naturalWidth).toBeGreaterThan(0)));
    const rtl = getComputedStyle(images[0]).direction === "rtl";
    const bounds = images.map((image) => image.getBoundingClientRect());
    for (let index = 1; index < bounds.length; index++) {
      const previous = bounds[index - 1];
      const current = bounds[index];
      await expect(rtl ? current.right - previous.left : previous.right - current.left).toBe(8);
    }
    await userEvent.tab();
    const invite = canvas.getByRole("button", { name: "Invite team" });
    await expect(invite).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await expect(canvas.getByRole("status", { name: "Invitation status" })).toHaveTextContent("Invited");
  },
};
export const RightToLeftAvatarGroup: Story = {
  ...WithAvatarGroup,
  decorators: [
    (Story) => (
      <div dir="rtl">
        <Story />
      </div>
    ),
  ],
};
async function expectImageSize(canvasElement: HTMLElement, size: number): Promise<void> {
  const image = await within(canvasElement).findByRole("img", { name: "Project preview" });
  await waitFor(() => expect((image as HTMLImageElement).naturalWidth).toBeGreaterThan(0));
  await expect(image.getBoundingClientRect().width).toBe(size);
  await expect(image.getBoundingClientRect().height).toBe(size);
  await expect(getComputedStyle(image).objectFit).toBe("cover");
}
export const WithImage: Story = {
  render: (args) => (
    <Item {...args} variant="outline">
      <ItemMedia variant="image">
        <img src={fixture_avatarImage} alt="Project preview" />
      </ItemMedia>
      <ItemContent>
        <ItemTitle>Project preview</ItemTitle>
        <ItemDescription>Latest project snapshot.</ItemDescription>
      </ItemContent>
    </Item>
  ),
  play: async ({ canvasElement }) => expectImageSize(canvasElement, 40),
};
export const SmallImage: Story = {
  ...WithImage,
  args: { size: "sm" },
  play: async ({ canvasElement }) => expectImageSize(canvasElement, 32),
};
export const ExtraSmallImage: Story = {
  ...WithImage,
  args: { size: "xs" },
  play: async ({ canvasElement }) => expectImageSize(canvasElement, 24),
};
export const Header: Story = {
  render: () => (
    <ItemGroup aria-label="Project stages" className="grid grid-cols-3">
      <Item variant="outline" role="listitem">
        <ItemHeader>
          <img src={fixture_avatarImage} alt="Build preview" className="aspect-square w-full object-cover" />
        </ItemHeader>
        <ItemContent>
          <ItemTitle>Build</ItemTitle>
          <ItemDescription>Create the project.</ItemDescription>
        </ItemContent>
      </Item>
      <Item variant="outline" role="listitem">
        <ItemHeader>
          <img src={fixture_avatarImage} alt="Ship preview" className="aspect-square w-full object-cover" />
        </ItemHeader>
        <ItemContent>
          <ItemTitle>Ship</ItemTitle>
          <ItemDescription>Release the project.</ItemDescription>
        </ItemContent>
      </Item>
      <Item variant="outline" role="listitem">
        <ItemHeader>
          <img src={fixture_avatarImage} alt="Observe preview" className="aspect-square w-full object-cover" />
        </ItemHeader>
        <ItemContent>
          <ItemTitle>Observe</ItemTitle>
          <ItemDescription>Monitor the project.</ItemDescription>
        </ItemContent>
      </Item>
    </ItemGroup>
  ),
  play: async ({ canvasElement }) => {
    const group = within(within(canvasElement).getByRole("list", { name: "Project stages" }));
    await expect(group.getAllByRole("listitem")).toHaveLength(3);
    const image = group.getByRole("img", { name: "Build preview" });
    await waitFor(() => expect((image as HTMLImageElement).naturalWidth).toBeGreaterThan(0));
    await expect(image.getBoundingClientRect().width).toBeCloseTo(image.getBoundingClientRect().height, 1);
    await expect(image.getBoundingClientRect().bottom).toBeLessThan(
      group.getByText("Build").getBoundingClientRect().top,
    );
    await expect(group.getByRole("img", { name: "Ship preview" }).getBoundingClientRect().left).toBeGreaterThan(
      image.getBoundingClientRect().right,
    );
  },
};
const renderedLinkRef = fn();
const renderedLinkClick = fn();
export const NativeLink: Story = {
  args: { ref: fn(), onClick: fn((event: MouseEvent<HTMLDivElement>) => event.preventDefault()) },
  render: (args) => (
    <Item
      {...args}
      render={<a href="#project-notes" ref={renderedLinkRef} onClick={renderedLinkClick} />}
      variant="outline"
    >
      <ItemContent>
        <ItemTitle>Project notes</ItemTitle>
        <ItemDescription>Browse shared notes.</ItemDescription>
      </ItemContent>
    </Item>
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const link = canvas.getByRole("link", { name: "Project notes Browse shared notes." });
    await expect(link).toHaveAttribute("href", "#project-notes");
    await expect(args.ref).toHaveBeenCalledWith(link);
    await expect(renderedLinkRef).toHaveBeenCalledWith(link);
    await userEvent.tab();
    await expect(link).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await expect(args.onClick).toHaveBeenCalledOnce();
    await expect(renderedLinkClick).toHaveBeenCalledOnce();
    await expect(canvas.queryByRole("button")).not.toBeInTheDocument();
  },
};
export const InDropdown: Story = {
  render: function Render() {
    const [owner, setOwner] = useState("");
    return (
      <div>
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="outline" />}>Choose owner</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => setOwner("Alex")}>
                <Item size="xs">
                  <ItemMedia>
                    <Avatar size="sm">
                      <AvatarFallback>AG</AvatarFallback>
                    </Avatar>
                  </ItemMedia>
                  <ItemContent>
                    <ItemTitle>Alex</ItemTitle>
                    <ItemDescription>Project owner</ItemDescription>
                  </ItemContent>
                </Item>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setOwner("Jordan")}>
                <Item size="xs">
                  <ItemMedia>
                    <Avatar size="sm">
                      <AvatarFallback>JD</AvatarFallback>
                    </Avatar>
                  </ItemMedia>
                  <ItemContent>
                    <ItemTitle>Jordan</ItemTitle>
                    <ItemDescription>Project editor</ItemDescription>
                  </ItemContent>
                </Item>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
        <output aria-label="Selected owner">{owner}</output>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const trigger = await canvas.findByRole("button", { name: "Choose owner" });
    await userEvent.click(trigger);
    const alex = await body.findByRole("menuitem", { name: "AG Alex Project owner" });
    await waitFor(() => expect(alex).toBeVisible());
    await userEvent.keyboard("{ArrowDown}{ArrowDown}");
    await expect(body.getByRole("menuitem", { name: "JD Jordan Project editor" })).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await expect(canvas.getByRole("status", { name: "Selected owner" })).toHaveTextContent("Jordan");
    await waitFor(() => expect(body.queryByRole("menu")).not.toBeInTheDocument());
    await expect(trigger).toHaveFocus();
  },
};
