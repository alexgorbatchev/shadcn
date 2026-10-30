import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { WeatherSummary } from "../../WeatherSummary";

const CONDITIONS = ["clear", "partly-cloudy", "cloudy", "fog", "drizzle", "rain", "snow", "thunderstorm"] as const;

const meta: Meta<typeof WeatherSummary> = {
  title: "@alexgorbatchev/shadcn/components/data-display/WeatherSummary",
  component: WeatherSummary,
  tags: ["autodocs", "test"],
  parameters: {
    docs: {
      description: {
        component:
          'WeatherSummary shows one day\'s forecast: a `label` such as a date, a `condition` from the closed set clear, partly-cloudy, cloudy, fog, drizzle, rain, snow, and thunderstorm with its icon, `high` and `low` temperatures in `unit` (celsius by default), and an optional `precipitationProbability` from 0 to 100. Numbers are rounded and formatted with Intl for `locale`. `conditionLabel` localizes the condition name. The icon is decorative; screen readers hear the condition, high, low, and precipitation chance. `variant="compact"` hides the condition name visually. Use `render` to choose the element, such as `<li />`.',
      },
    },
  },
  args: {
    label: "Sat, Nov 1",
    condition: "partly-cloudy",
    high: 18.4,
    low: 9.2,
    precipitationProbability: 30,
    locale: "en-US",
  },
  argTypes: {
    condition: { control: "select", options: CONDITIONS },
    unit: { control: "inline-radio", options: ["celsius", "fahrenheit"] },
    variant: { control: "inline-radio", options: ["default", "compact"] },
  },
};
export default meta;
type Story = StoryObj<typeof WeatherSummary>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const summary = canvasElement.querySelector("[data-slot=weather-summary]")!;
    await expect(summary).toHaveTextContent("Sat, Nov 1Partly cloudyHigh 18°CLow 9°C30% chance of precipitation");
    await expect(within(canvasElement).getByText("Partly cloudy")).toBeVisible();
    await expect(summary.querySelector("[data-slot=weather-summary-icon]")).toHaveAttribute("aria-hidden", "true");
  },
};

export const Compact: Story = {
  args: { variant: "compact" },
  play: async ({ canvasElement }) => {
    const condition = within(canvasElement).getByText("Partly cloudy");
    await expect(condition.getBoundingClientRect().width).toBeLessThanOrEqual(1);
    await expect(within(canvasElement).getByText("18°C")).toBeVisible();
  },
};

export const FahrenheitLocalized: Story = {
  args: {
    unit: "fahrenheit",
    locale: "de-DE",
    high: 64.6,
    low: 48,
    condition: "rain",
    conditionLabel: "Regen",
    precipitationProbability: 85,
  },
  play: async ({ canvasElement }) => {
    const summary = canvasElement.querySelector("[data-slot=weather-summary]")!;
    await expect(summary).toHaveTextContent("Regen");
    await expect(summary).toHaveTextContent("65 °F");
    await expect(summary).toHaveTextContent("85 %");
  },
};

export const WithoutPrecipitation: Story = {
  args: { precipitationProbability: undefined, condition: "clear" },
  play: async ({ canvasElement }) => {
    const summary = canvasElement.querySelector("[data-slot=weather-summary]")!;
    await expect(summary).toHaveTextContent("Clear");
    await expect(summary).not.toHaveTextContent("precipitation");
  },
};

export const ProbabilityClamped: Story = {
  args: { precipitationProbability: 140, condition: "thunderstorm" },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText(/100%/)).toBeVisible();
  },
};

export const AllConditions: Story = {
  render: (args) => (
    <>
      {CONDITIONS.map((condition) => (
        <WeatherSummary key={condition} {...args} label={condition} condition={condition} />
      ))}
    </>
  ),
  play: async ({ canvasElement }) => {
    const icons = [...canvasElement.querySelectorAll("[data-slot=weather-summary-icon]")];
    await expect(icons).toHaveLength(CONDITIONS.length);
    await expect(new Set(icons.map((icon) => icon.innerHTML)).size).toBe(CONDITIONS.length);
  },
};
