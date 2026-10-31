import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { Table } from "../../Table";
import { ResponsiveTablesExample } from "../fixtures";

const meta: Meta<typeof Table> = {
  title: "@alexgorbatchev/shadcn/components/data-display/TableResponsive",
  component: Table,
  tags: ["test"],
  render: () => <ResponsiveTablesExample />,
};
export default meta;

export const ContainerBoundaries: StoryObj<typeof Table> = {
  async play({ canvasElement }) {
    const canvas = within(canvasElement);
    for (const [width, fixedWidths] of [
      [399, [0, 0, 0]],
      [400, [60, 0, 0]],
      [479, [60, 0, 0]],
      [480, [60, 80, 0]],
      [639, [60, 80, 0]],
      [640, [60, 80, 100]],
      [641, [60, 80, 100]],
      [399, [0, 0, 0]],
    ] as const) {
      await userEvent.click(canvas.getByRole("button", { name: `Width ${width}` }));
      for (const name of ["Primitive tracks", "Virtual tracks"]) {
        const table = canvas.getByRole("table", { name });
        await waitFor(() => {
          const headers = table.querySelectorAll("th");
          const cells = table.querySelectorAll("tbody tr:first-child td");
          expect(table.getBoundingClientRect().width).toBe(width);
          expect(headers[0]!.getBoundingClientRect().width).toBe(
            width - fixedWidths.reduce<number>((a, b) => a + b, 0),
          );
          for (const [index, expectedWidth] of fixedWidths.entries()) {
            expect(headers[index + 1]!.getBoundingClientRect().width).toBe(expectedWidth);
            expect(cells[index + 1]!.getBoundingClientRect().width).toBe(expectedWidth);
          }
          expect(table.scrollWidth).toBeLessThanOrEqual(width);
        });
      }
      const grid = canvas.getByRole("table", { name: "Grid tracks" });
      await waitFor(() => {
        const headers = grid.querySelectorAll("th");
        const cells = grid.querySelectorAll("tbody tr:first-child td");
        expect(grid.getBoundingClientRect().width).toBe(width);
        for (const [index, expectedWidth] of fixedWidths.entries()) {
          expect(headers[index + 1]!.getBoundingClientRect().width > 0).toBe(expectedWidth > 0);
          expect(cells[index + 1]!.getBoundingClientRect().width > 0).toBe(expectedWidth > 0);
        }
        expect(grid.scrollWidth).toBeLessThanOrEqual(width);
      });
    }
  },
};
