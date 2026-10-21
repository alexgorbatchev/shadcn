import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { GenerativeUi } from "../../../../assistant-ui/elements/GenerativeUi.js";

const meta: Meta<typeof GenerativeUi> = {
  title: "@alexgorbatchev/shadcn/components/assistant-ui/elements/data-visualization/GenerativeUi",
  component: GenerativeUi,
  tags: ["autodocs", "test"],
  args: {
    node: {
      _type: "Markdown",
      value: "## Release notes\n\n- **Verified** rendering\n- [Guide](https://example.com/guide)",
    },
  },
};
export default meta;
type Story = StoryObj<typeof meta>;
export const Markdown: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("heading", { name: "Release notes" })).toBeVisible();
    await expect(canvas.getByRole("link", { name: "Guide" })).toHaveAttribute("href", "https://example.com/guide");
    await expect(canvas.getAllByRole("listitem")).toHaveLength(2);
  },
};
export const Diagram: Story = {
  args: { node: { _type: "Diagram", title: "Build pipeline", code: "graph LR\n A[Read] --> B[Build]" } },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText("Build pipeline")).toBeVisible();
    await expect(within(canvasElement).getByRole("button", { name: "Expand diagram" })).toBeInTheDocument();
  },
};
export const Empty: Story = {
  args: { node: null },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).queryByRole("heading")).not.toBeInTheDocument();
    await expect(within(canvasElement).queryByRole("button")).not.toBeInTheDocument();
  },
};
export const MapRoute: Story = {
  args: {
    node: {
      _type: "Map",
      route: true,
      places: [
        { label: "London", lat: 51.5, lng: -0.12, detail: "First stop" },
        { label: "Paris", lat: 48.85, lng: 2.35 },
        null,
        "pending",
        { label: "Missing coordinates" },
        { label: 42, lat: 0, lng: 0 },
        { label: "Invalid latitude", lat: "north", lng: 0 },
        { label: "Invalid longitude", lat: 0, lng: "east" },
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const region = canvas.getByRole("region", { name: "Map of 2 places" });
    await waitFor(() => expect(region).not.toHaveAttribute("aria-busy", "true"));
    await waitFor(() => expect(region.querySelectorAll("svg.leaflet-zoom-animated path")).toHaveLength(1));
    const paris = within(canvas.getByRole("list")).getByRole("button", { name: "Paris" });
    await userEvent.click(paris);
    await expect(paris).toHaveAttribute("aria-current", "true");
    await expect(canvas.queryByText("Missing coordinates")).not.toBeInTheDocument();
  },
};
export const MapWithoutRoute: Story = {
  args: { node: { _type: "Map", places: [{ label: "Origin", lat: 0, lng: 0, detail: 42 }] } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const region = canvas.getByRole("region", { name: "Map of 1 places" });
    await waitFor(() => expect(region).not.toHaveAttribute("aria-busy", "true"));
    await expect(region.querySelectorAll("svg.leaflet-zoom-animated path")).toHaveLength(0);
    await expect(canvas.getByRole("button", { name: "Origin" })).toHaveAttribute("aria-current", "true");
  },
};
export const EmptyMap: Story = {
  args: { node: { _type: "Map", route: true } },
  play: async ({ canvasElement }) => {
    const region = within(canvasElement).getByRole("region", { name: "Map of 0 places" });
    await waitFor(() => expect(region).not.toHaveAttribute("aria-busy", "true"));
    await expect(within(region).getByRole("button", { name: "Zoom in" })).toBeVisible();
  },
};
export const StreamingMarkdown: Story = {
  args: { node: { _type: "Markdown" }, context: { status: "streaming" } },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).queryByRole("heading")).not.toBeInTheDocument();
    await expect(canvasElement.querySelector("[data-aui=markdown]")).toHaveTextContent("");
  },
};
export const UntitledDiagram: Story = {
  args: { node: { _type: "Diagram", code: "graph LR\n A[Read] --> B[Build]" } },
  play: async ({ canvasElement }) => {
    await expect(await within(canvasElement).findByRole("button", { name: "Expand diagram" })).toBeVisible();
    await expect(canvasElement.querySelector("figcaption")).toBeNull();
  },
};
