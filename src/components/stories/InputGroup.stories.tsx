import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  InputGroup,
  InputGroupInput,
  InputGroupTextarea,
  InputGroupAddon,
  InputGroupButton,
  InputGroupText,
} from "../InputGroup";
import { SearchIcon, CopyIcon } from "lucide-react";

const meta: Meta<typeof InputGroup> = {
  title: "shadcn-alexgorbatchev/components/InputGroup",
  component: InputGroup,
  tags: ["autodocs", "!test"],
  render: (args) => (
    <InputGroup {...args}>
      <InputGroupInput aria-label="Search" placeholder="Search projects" />
      <InputGroupAddon>
        <SearchIcon />
      </InputGroupAddon>
      <InputGroupAddon align="inline-end">
        <InputGroupText>⌘K</InputGroupText>
      </InputGroupAddon>
    </InputGroup>
  ),
};
export default meta;
type Story = StoryObj<typeof meta>;

export const Search: Story = {};
export const WithAction: Story = {
  render: () => (
    <InputGroup>
      <InputGroupInput aria-label="Project URL" defaultValue="https://example.com" />
      <InputGroupAddon align="inline-end">
        <InputGroupButton aria-label="Copy URL" onClick={() => navigator.clipboard.writeText("https://example.com")}>
          <CopyIcon />
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  ),
};
export const Disabled: Story = {
  render: () => (
    <InputGroup>
      <InputGroupInput aria-label="Disabled search" disabled placeholder="Search" />
      <InputGroupAddon>
        <SearchIcon />
      </InputGroupAddon>
    </InputGroup>
  ),
};
export const Invalid: Story = {
  render: () => (
    <InputGroup>
      <InputGroupInput aria-label="Invalid search" aria-invalid defaultValue="?" />
      <InputGroupAddon>
        <SearchIcon />
      </InputGroupAddon>
    </InputGroup>
  ),
};
export const Textarea: Story = {
  render: () => (
    <InputGroup>
      <InputGroupTextarea aria-label="Comment" placeholder="Write a comment" />
      <InputGroupAddon align="block-end">
        <InputGroupText>Markdown supported</InputGroupText>
        <InputGroupButton variant="default" size="sm">
          Post
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  ),
};
