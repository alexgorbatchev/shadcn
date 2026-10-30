import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState, type ComponentProps, type ReactElement } from "react";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import { Button } from "../../../../Button.js";
import { GeoMap } from "../../../../assistant-ui/elements/GeoMap.js";

type GeoMapHarnessProps = ComponentProps<typeof GeoMap>;

function SwitchingAttributionMap(props: GeoMapHarnessProps): ReactElement {
  const [attribution, setAttribution] = useState("Map data © Provider A");
  return (
    <>
      <Button onClick={() => setAttribution("Map data © Provider B")}>Change viewport attribution</Button>
      <GeoMap {...props} attribution={attribution} />
    </>
  );
}

function ControlledSelectionMap(props: GeoMapHarnessProps): ReactElement {
  const [selectedId, setSelectedId] = useState("london");
  return (
    <>
      <Button onClick={() => setSelectedId("paris")}>Select Paris externally</Button>
      <GeoMap {...props} selectedId={selectedId} onSelect={setSelectedId} />
    </>
  );
}

async function waitForMap(canvasElement: HTMLElement, name = "Map of 2 places"): Promise<HTMLElement> {
  const region = within(canvasElement).getByRole("region", { name });
  await waitFor(() => expect(region).not.toHaveAttribute("aria-busy", "true"));
  return region;
}
const meta: Meta<typeof GeoMap> = {
  title: "@alexgorbatchev/shadcn/components/assistant-ui/elements/data-visualization/GeoMap",
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

export const FillHeight: Story = {
  args: { height: "fill" },
  decorators: [
    (Story) => (
      <div className="h-[480px] w-[520px]" data-scroll="none">
        <Story />
      </div>
    ),
  ],
  play: async ({ canvasElement }) => {
    const region = await waitForMap(canvasElement);
    const root = canvasElement.querySelector("[data-slot=geo-map]")!.getBoundingClientRect();
    await expect(root.height).toBeCloseTo(480, 0);
    await expect(root.width).toBeCloseTo(520, 0);
    await expect(region.getBoundingClientRect().height).toBeGreaterThan(300);
    const paris = within(canvasElement).getByRole("button", { name: /Paris Second stop/ });
    await expect(paris.getBoundingClientRect().bottom).toBeLessThanOrEqual(root.bottom);
  },
};

export const FillResizesMap: Story = {
  args: { height: "fill", showPlaces: false },
  decorators: [
    (Story) => (
      <div className="h-[240px] w-[320px] resize overflow-hidden" data-testid="GeoMapFrame">
        <Story />
      </div>
    ),
  ],
  play: async ({ canvasElement }) => {
    const region = await waitForMap(canvasElement);
    await expect(within(canvasElement).queryByRole("button", { name: /London/ })).not.toBeInTheDocument();
    const frame = within(canvasElement).getByTestId("GeoMapFrame");
    frame.style.height = "420px";
    frame.style.width = "560px";
    await waitFor(() => expect(region.getBoundingClientRect().height).toBeGreaterThan(380));
    const tilePane = region.querySelector<HTMLElement>(".leaflet-tile-pane")!;
    const tiles = (): HTMLElement[] => [...tilePane.querySelectorAll<HTMLElement>("img.leaflet-tile")];
    await waitFor(() => {
      const regionBounds = region.getBoundingClientRect();
      const covered = tiles().some((tile) => tile.getBoundingClientRect().bottom >= regionBounds.bottom - 1);
      expect(covered).toBe(true);
    });
  },
};

export const DynamicAttribution: Story = {
  render: (args) => <SwitchingAttributionMap {...args} />,
  play: async ({ canvasElement }) => {
    const region = await waitForMap(canvasElement);
    const control = region.querySelector(".leaflet-control-attribution")!;
    await waitFor(() => expect(control).toHaveTextContent("Map data © Provider A"));
    const mapPane = region.querySelector(".leaflet-map-pane");
    await userEvent.click(within(canvasElement).getByRole("button", { name: "Change viewport attribution" }));
    await waitFor(() => expect(control).toHaveTextContent("Map data © Provider B"));
    await expect(control).not.toHaveTextContent("Provider A");
    await expect(region.querySelector(".leaflet-map-pane")).toBe(mapPane);
    await expect(region).not.toHaveAttribute("aria-busy");
  },
};

export const ControlledSelection: Story = {
  args: {
    places: [
      { id: "london", lat: 51.5, lng: -0.12, label: "London" },
      { id: "paris", lat: 48.85, lng: 2.35, label: "Paris" },
      { id: "rome", lat: 41.9, lng: 12.5, label: "Rome" },
    ],
    routes: [],
  },
  render: (args) => <ControlledSelectionMap {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const region = await waitForMap(canvasElement, "Map of 3 places");
    const mapPane = region.querySelector<HTMLElement>(".leaflet-map-pane")!;
    const initialTransform = mapPane.style.transform;
    const list = within(canvasElement.querySelector("ol")!);
    await expect(list.getByRole("button", { name: /^London/ })).toHaveAttribute("aria-current", "true");
    await userEvent.click(canvas.getByRole("button", { name: "Select Paris externally" }));
    await expect(list.getByRole("button", { name: /^Paris/ })).toHaveAttribute("aria-current", "true");
    await waitFor(() => expect(mapPane.style.transform).not.toBe(initialTransform));
  },
};
