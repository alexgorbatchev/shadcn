import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
  ComboboxGroup,
  ComboboxEmpty,
} from "../Combobox";
import { ComboboxMultipleExample } from "./helpers";
import { fn } from "storybook/test";

const items = ["Bun", "Node.js", "Deno", "React", "TypeScript"];
const meta: Meta<typeof Combobox> = {
  title: "shadcn-alexgorbatchev/components/Combobox",
  component: Combobox,
  tags: ["autodocs", "!test"],
  args: { items, onValueChange: fn() },
  render: (args) => (
    <Combobox {...args}>
      <ComboboxInput aria-label="Technology" placeholder="Search technologies" showClear />
      <ComboboxContent>
        <ComboboxEmpty>No technology found.</ComboboxEmpty>
        <ComboboxGroup>
          <ComboboxList>
            {(item: string) => (
              <ComboboxItem key={item} value={item}>
                {item}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxGroup>
      </ComboboxContent>
    </Combobox>
  ),
};
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Selected: Story = { args: { defaultValue: "Bun" } };
export const Disabled: Story = {
  args: { disabled: true },
  render: (args) => (
    <Combobox {...args}>
      <ComboboxInput disabled aria-label="Technology" placeholder="Search technologies" />
      <ComboboxContent>
        <ComboboxGroup>
          <ComboboxList>
            {(item: string) => (
              <ComboboxItem key={item} value={item}>
                {item}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxGroup>
      </ComboboxContent>
    </Combobox>
  ),
};
export const Multiple: Story = { render: () => <ComboboxMultipleExample /> };
