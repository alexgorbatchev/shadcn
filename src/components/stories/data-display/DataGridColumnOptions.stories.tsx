import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { VirtualDataGridExample, fixture_gridFiles } from "../fixtures";

function headerNames(canvasElement: HTMLElement): string[] {
  return within(canvasElement)
    .getAllByRole("columnheader")
    .map((header) => header.textContent ?? "");
}

const meta: Meta = {
  title: "@alexgorbatchev/shadcn/components/data-display/DataGridColumnOptions",
  tags: ["autodocs", "test"],
  render: () => <VirtualDataGridExample files={fixture_gridFiles} />,
};
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    await expect(await canvas.findByText("File 0")).toBeVisible();
    await expect(headerNames(canvasElement)).toEqual(["", "Name", "Kind", "Size"]);
    await userEvent.click(canvas.getByRole("button", { name: "Columns" }));
    const list = await page.findByRole("list", { name: "Columns" });
    await expect(
      within(list)
        .getAllByRole("listitem")
        .map((item) => item.textContent),
    ).toEqual(["Kind", "owner", "Size"]);
    await userEvent.click(within(list).getByRole("checkbox", { name: "owner" }));
    await waitFor(() => expect(headerNames(canvasElement)).toEqual(["", "Name", "Kind", "Owner", "Size"]));
    await userEvent.click(within(list).getByRole("checkbox", { name: "Kind" }));
    await waitFor(() => expect(canvas.queryByRole("columnheader", { name: "Kind" })).not.toBeInTheDocument());
    await expect(within(list).getByRole("checkbox", { name: "Kind" })).not.toBeChecked();
    await expect(within(list).getByRole("button", { name: "Move Kind earlier" })).toBeDisabled();
    await userEvent.click(within(list).getByRole("button", { name: "Move Size earlier" }));
    await userEvent.click(within(list).getByRole("button", { name: "Move Size earlier" }));
    await expect(within(list).getByRole("button", { name: "Move Size earlier" })).toBeDisabled();
    await userEvent.click(within(list).getByRole("checkbox", { name: "Kind" }));
    await waitFor(() => expect(headerNames(canvasElement)).toEqual(["", "Name", "Size", "Kind", "Owner"]));
    await expect(within(list).getByRole("button", { name: "Move owner later" })).toBeDisabled();
    await userEvent.click(within(list).getByRole("button", { name: "Move Kind later" }));
    await waitFor(() => expect(headerNames(canvasElement)).toEqual(["", "Name", "Size", "Owner", "Kind"]));
    await expect(within(list).getByRole("button", { name: "Move Kind later" })).toBeDisabled();
    const handle = canvas.getByRole("separator", { name: "Resize Kind" });
    handle.focus();
    await userEvent.keyboard("{ArrowRight}");
    await expect(handle).toHaveAttribute("aria-valuenow", "116");
    await userEvent.click(page.getByRole("button", { name: "Reset columns" }));
    await waitFor(() => expect(headerNames(canvasElement)).toEqual(["", "Name", "Kind", "Size"]));
    await expect(canvas.getByRole("separator", { name: "Resize Kind" })).toHaveAttribute("aria-valuenow", "100");
  },
};
