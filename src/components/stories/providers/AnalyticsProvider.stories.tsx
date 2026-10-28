import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { AnalyticsProvider, AnalyticsScope } from "../../analytics/index.js";
import { Button } from "../../Button.js";
import { Input } from "../../Input.js";

const meta: Meta<typeof AnalyticsProvider> = {
  title: "@alexgorbatchev/shadcn/components/providers/AnalyticsProvider",
  component: AnalyticsProvider,
  tags: ["autodocs", "test"],
  args: { transport: { track: fn() }, enabled: true },
  render: (args) => (
    <AnalyticsProvider {...args}>
      <AnalyticsScope name="preferences" properties={{ surface: "settings" }}>
        <div className="grid max-w-sm gap-3">
          <Input aria-label="Display name" analytics={{ id: "display-name" }} />
          <Button analytics={{ id: "save-preferences" }}>Save preferences</Button>
          <Button analytics={false} variant="outline">
            Untracked action
          </Button>
        </div>
      </AnalyticsScope>
    </AnalyticsProvider>
  ),
};
export default meta;
type Story = StoryObj<typeof meta>;

export const ConfigurableTransport: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Save preferences" }));
    await expect(args.transport.track).toHaveBeenCalledWith({
      schemaVersion: 1,
      name: "ui.activate",
      component: "Button",
      id: "save-preferences",
      scope: ["preferences"],
      properties: { surface: "settings" },
    });
    await userEvent.click(canvas.getByRole("button", { name: "Untracked action" }));
    await expect(args.transport.track).toHaveBeenCalledTimes(1);
  },
};
export const Disabled: Story = {
  args: { enabled: false, transport: { track: fn() } },
  play: async ({ canvasElement, args }) => {
    await userEvent.click(within(canvasElement).getByRole("button", { name: "Save preferences" }));
    await expect(args.transport.track).not.toHaveBeenCalled();
  },
};
