import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import { GeoMap } from "../../../assistant-ui/elements/GeoMap.js";
const meta: Meta<typeof GeoMap> = {
  title: "shadcn-alexgorbatchev/assistant-ui/elements/GeoMap",
  component: GeoMap,
  tags: ["autodocs", "test"],
  args: {
    places: [
      { id: "london", lat: 51.5, lng: -0.12, label: "London", description: "First stop" },
      { id: "paris", lat: 48.85, lng: 2.35, label: "Paris", description: "Second stop" },
    ],
    routes: [
      {
        id: "trip",
        points: [
          [51.5, -0.12],
          [48.85, 2.35],
        ],
      },
    ],
    tileUrl:
      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='256' height='256'%3E%3Crect width='256' height='256' fill='lightgray'/%3E%3C/svg%3E",
    attribution: "Deterministic map fixture",
    onSelect: fn(),
  },
};
export default meta;
type Story = StoryObj<typeof meta>;
export const Selection: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const region = canvas.getByRole("region", { name: "Map of 2 places" });
    await waitFor(() => expect(region).not.toHaveAttribute("aria-busy", "true"));
    await userEvent.click(canvas.getByRole("button", { name: /Paris Second stop/ }));
    await expect(args.onSelect).toHaveBeenLastCalledWith("paris");
    await expect(canvas.getByRole("button", { name: /Paris Second stop/ })).toHaveAttribute("aria-current", "true");
    await userEvent.click(canvas.getByTitle("London"));
    await expect(args.onSelect).toHaveBeenLastCalledWith("london");
    await expect(canvas.getByRole("button", { name: /London First stop/ })).toHaveAttribute("aria-current", "true");
  },
};
export const RouteLabel: Story = {
  args: {
    routes: [
      {
        id: "named-trip",
        label: "London to Paris",
        points: [
          [51.5, -0.12],
          [48.85, 2.35],
        ],
      },
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(() =>
      expect(canvas.getByRole("region", { name: "Map of 2 places" })).not.toHaveAttribute("aria-busy", "true"),
    );
    const route = await canvas.findByRole("graphics-symbol", { name: "London to Paris" });
    route.focus();
    await expect(await canvas.findByText("London to Paris")).toBeVisible();
    await userEvent.tab();
    await waitFor(() => expect(canvas.queryByText("London to Paris")).not.toBeInTheDocument());
  },
};
export const InvalidCoordinates: Story = {
  args: {
    places: [
      { id: "bad", lat: 91, lng: 0, label: "Invalid" },
      { id: "valid", lat: 0, lng: 0, label: "Origin" },
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("region", { name: "Map of 1 places" })).toBeVisible();
    await expect(canvas.queryByText("Invalid")).not.toBeInTheDocument();
    await expect(canvas.getByRole("button", { name: /Origin/ })).toHaveAttribute("aria-current", "true");
  },
};
export const Empty: Story = {
  args: { places: [], routes: [] },
  play: async ({ canvasElement }) => {
    const region = within(canvasElement).getByRole("region", { name: "Map of 0 places" });
    await waitFor(() => expect(region).not.toHaveAttribute("aria-busy", "true"));
    await expect(within(region).getByRole("button", { name: "Zoom in" })).toBeVisible();
  },
};
