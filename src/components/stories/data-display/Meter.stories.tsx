import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState, type ReactElement } from "react";
import { expect, within } from "storybook/test";
import { Meter, MeterLabel, MeterValue, MeterTrack, MeterIndicator } from "../../Meter";
import { Button } from "../../Button";
function StorageExample(): ReactElement {
  const [value, setValue] = useState(25);
  return (
    <>
      <Meter value={value}>
        <MeterLabel>Storage used</MeterLabel>
        <MeterValue />
        <MeterTrack>
          <MeterIndicator />
        </MeterTrack>
      </Meter>
      <Button onClick={() => setValue(75)}>Add files</Button>
    </>
  );
}
const meta: Meta<typeof Meter> = {
  title: "@alexgorbatchev/shadcn/components/data-display/Meter",
  component: Meter,
  tags: ["autodocs", "test"],
  args: { value: 25 },
  render: () => <StorageExample />,
};
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const meter = canvas.getByRole("meter", { name: "Storage used" });
    await expect(meter).toHaveAttribute("aria-valuenow", "25");
    await userEvent.click(canvas.getByRole("button", { name: "Add files" }));
    await expect(meter).toHaveAttribute("aria-valuenow", "75");
    await expect(canvas.getByText("75%")).toBeVisible();
  },
};
export const Formatted: Story = {
  render: (args) => (
    <Meter {...args} min={0} max={1000} value={500} locale="en-US" format={{ style: "unit", unit: "gigabyte" }}>
      <MeterLabel>Disk capacity</MeterLabel>
      <MeterValue />
      <MeterTrack>
        <MeterIndicator />
      </MeterTrack>
    </Meter>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("meter", { name: "Disk capacity" })).toHaveAttribute("aria-valuenow", "500");
    await expect(canvas.getByText("500 GB")).toBeVisible();
  },
};
export const NativeStateCallbacks: Story = {
  render: () => (
    <Meter value={30} className={() => "font-medium"} style={() => ({ opacity: 0.9 })}>
      <MeterLabel className={() => "font-medium"}>Queue capacity</MeterLabel>
      <MeterValue className={() => "font-medium"} />
      <MeterTrack className={() => "h-2"}>
        <MeterIndicator className={() => "bg-primary"} />
      </MeterTrack>
    </Meter>
  ),
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const meter = c.getByRole("meter", { name: "Queue capacity" });
    await expect(meter).toHaveAttribute("aria-valuenow", "30");
    await expect(meter).toHaveStyle({ opacity: "0.9" });
    await expect(c.getByText("30%")).toBeVisible();
  },
};
