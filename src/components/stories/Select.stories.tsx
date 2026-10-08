import type { Meta, StoryObj } from "@storybook/react-vite";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "../Select";
import { fn } from "storybook/test";

const items = [
  { label: "Select a runtime", value: null },
  { label: "Bun", value: "bun" },
  { label: "Node.js", value: "node" },
  { label: "Deno", value: "deno" },
];
const meta: Meta<typeof Select> = {
  title: "shadcn-alexgorbatchev/components/Select",
  component: Select,
  tags: ["autodocs", "!test"],
  args: { items, onValueChange: fn() },
  render: (args) => (
    <Select {...args}>
      <SelectTrigger aria-label="Runtime">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Runtime</SelectLabel>
          {items.map((item) => (
            <SelectItem key={item.value ?? "placeholder"} value={item.value}>
              {item.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  ),
};
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Selected: Story = { args: { defaultValue: "bun" } };
export const Disabled: Story = { args: { disabled: true } };
export const Multiple: Story = { args: { multiple: true, defaultValue: ["bun", "node"] } };
export const Small: Story = {
  render: (args) => (
    <Select {...args}>
      <SelectTrigger size="sm" aria-label="Runtime">
        <SelectValue />
      </SelectTrigger>
      <SelectContent alignItemWithTrigger={false}>
        <SelectGroup>
          {items.map((item) => (
            <SelectItem key={item.value ?? "placeholder"} value={item.value}>
              {item.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  ),
};
