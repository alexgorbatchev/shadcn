import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "../DropdownMenu";
import { Button } from "../Button";
import { fn } from "storybook/test";

const onSelect = fn();
const meta: Meta<typeof DropdownMenu> = {
  title: "shadcn-alexgorbatchev/components/DropdownMenu",
  component: DropdownMenu,
  tags: ["autodocs", "!test"],
  render: (args) => (
    <DropdownMenu {...args}>
      <DropdownMenuTrigger render={<Button variant="outline" />}>Project menu</DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuGroup>
          <DropdownMenuLabel>Project</DropdownMenuLabel>
          <DropdownMenuItem onClick={onSelect}>
            Open<DropdownMenuShortcut>⌘O</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem disabled>Archive</DropdownMenuItem>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>Share</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={onSelect}>Copy link</DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuCheckboxItem defaultChecked>Notifications</DropdownMenuCheckboxItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup defaultValue="daily">
          <DropdownMenuRadioItem value="daily">Daily</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="weekly">Weekly</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem variant="destructive" onClick={onSelect}>
            Delete project
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Open: Story = {
  args: { defaultOpen: true },
  parameters: { docs: { story: { inline: false, height: "480px" } } },
};
