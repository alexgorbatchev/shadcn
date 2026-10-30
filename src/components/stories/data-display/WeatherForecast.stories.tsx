import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { WeatherForecast } from "../../WeatherForecast";

const meta: Meta<typeof WeatherForecast> = {
  title: "@alexgorbatchev/shadcn/components/data-display/WeatherForecast",
  component: WeatherForecast,
  tags: ["autodocs", "test"],
  parameters: {
    docs: {
      description: {
        component:
          'WeatherForecast renders several WeatherSummary days as a list named by `label`. Each day takes an `id` plus the WeatherSummary day fields; `unit` and `locale` apply to every day. `variant="strip"` (default) shows compact days side by side and wraps them to the available width; `variant="list"` shows one detailed day per row.',
      },
    },
  },
  args: {
    label: "Three-day forecast",
    locale: "en-US",
    days: [
      { id: "fri", label: "Fri", condition: "clear", high: 21, low: 11, precipitationProbability: 0 },
      { id: "sat", label: "Sat", condition: "drizzle", high: 17, low: 10, precipitationProbability: 45 },
      { id: "sun", label: "Sun", condition: "snow", high: 2, low: -4, precipitationProbability: 80 },
    ],
  },
  argTypes: { variant: { control: "inline-radio", options: ["strip", "list"] } },
};
export default meta;
type Story = StoryObj<typeof WeatherForecast>;

export const Strip: Story = {
  decorators: [
    (Story) => (
      <div className="w-96">
        <Story />
      </div>
    ),
  ],
  play: async ({ canvasElement }) => {
    const list = within(canvasElement).getByRole("list", { name: "Three-day forecast" });
    const days = within(list).getAllByRole("listitem");
    await expect(days).toHaveLength(3);
    await expect(days[2]).toHaveTextContent("SunSnowHigh 2°CLow -4°C80% chance of precipitation");
    await expect(days[0]!.getBoundingClientRect().top).toBeCloseTo(days[2]!.getBoundingClientRect().top, 0);
  },
};

export const List: Story = {
  args: { variant: "list", unit: "fahrenheit" },
  play: async ({ canvasElement }) => {
    const days = within(canvasElement).getAllByRole("listitem");
    await expect(days[1]!.getBoundingClientRect().top).toBeGreaterThan(days[0]!.getBoundingClientRect().bottom - 1);
    await expect(within(days[1]!).getByText("Drizzle")).toBeVisible();
    await expect(days[1]).toHaveTextContent("17°F");
  },
};

export const NarrowStripWraps: Story = {
  decorators: [
    (Story) => (
      <div className="w-52">
        <Story />
      </div>
    ),
  ],
  play: async ({ canvasElement }) => {
    const list = within(canvasElement).getByRole("list");
    const days = within(list).getAllByRole("listitem");
    await expect(days[2]!.getBoundingClientRect().top).toBeGreaterThan(days[0]!.getBoundingClientRect().top);
    for (const day of days) {
      await expect(day.getBoundingClientRect().right).toBeLessThanOrEqual(list.getBoundingClientRect().right + 1);
    }
  },
};
