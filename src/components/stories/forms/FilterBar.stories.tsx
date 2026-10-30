import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { useState } from "react";
import { FilterBar } from "../../FilterBar";
import { chooseOption } from "../helpers";
function Example() {
  const [search, setSearch] = useState("");
  const [value, setValue] = useState<Record<string, string>>({});
  return (
    <>
      <FilterBar
        label="Projects"
        search={search}
        onSearchChange={setSearch}
        value={value}
        onValueChange={setValue}
        filters={[
          {
            id: "status",
            label: "Status",
            options: [
              { value: "active", label: "Active" },
              { value: "done", label: "Done" },
            ],
          },
          {
            id: "when",
            label: "When",
            allLabel: "Any time",
            options: [{ value: "past", label: "Past" }],
          },
        ]}
      />
      <output aria-label="Filters">
        {search} {value.status}
      </output>
    </>
  );
}
const meta: Meta = {
  title: "@alexgorbatchev/shadcn/components/forms/FilterBar",
  tags: ["autodocs", "test"],
  render: () => <Example />,
};
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  play: async ({ canvasElement, userEvent }) => {
    const c = within(canvasElement);
    await expect(c.getByRole("button", { name: "Clear filters" })).toBeDisabled();
    await userEvent.type(c.getByRole("searchbox"), "roadmap");
    await chooseOption(c.getByRole("combobox", { name: "Status" }), "Active");
    await expect(c.getByLabelText("Filters")).toHaveTextContent("roadmap active");
    await userEvent.click(c.getByRole("button", { name: "Clear filters" }));
    await expect(c.getByRole("searchbox")).toHaveValue("");
    await expect(c.getByRole("combobox", { name: "Status" })).toHaveTextContent("All status");
    await expect(c.getByRole("combobox", { name: "When" })).toHaveTextContent("Any time");
  },
};
