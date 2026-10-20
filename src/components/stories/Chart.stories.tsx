import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ChartConfig } from "../chart/types";
import { useState } from "react";
import { Bar, BarChart, CartesianGrid, LabelList, Pie, PieChart, XAxis } from "recharts";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from "../chart/Chart";
import { Button } from "../Button";
import { useTheme } from "../../hooks/useTheme";
import { LaptopIcon } from "lucide-react";
import { DirectionProvider } from "../DirectionProvider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../Card";
import { fixture_chartBrowsers } from "./fixtures";

const config: ChartConfig = {
  desktop: { label: "Desktop", color: "var(--primary)" },
  mobile: { label: "Mobile", color: "var(--success)" },
};
const data = [
  { month: "January", desktop: 186, mobile: 80 },
  { month: "February", desktop: 305, mobile: 200 },
];
const meta: Meta<typeof ChartContainer> = {
  title: "shadcn-alexgorbatchev/components/Chart",
  component: ChartContainer,
  tags: ["autodocs", "test"],
  args: { config, "aria-label": "Monthly visitors", className: "h-64 w-96" },
  render: (args) => (
    <ChartContainer {...args}>
      <BarChart accessibilityLayer data={data}>
        <CartesianGrid vertical={false} orientation={args.dir === "rtl" ? "right" : "left"} />
        <XAxis dataKey="month" reversed={args.dir === "rtl"} />
        <ChartTooltip content={<ChartTooltipContent />} isAnimationActive={false} />
        <ChartLegend content={<ChartLegendContent />} />
        <Bar dataKey="desktop" fill="var(--color-desktop)" isAnimationActive={false} />
        <Bar dataKey="mobile" fill="var(--color-mobile)" isAnimationActive={false} />
      </BarChart>
    </ChartContainer>
  ),
};
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Desktop")).toBeVisible();
    const application = canvas.getByRole("application");
    application.focus();
    await userEvent.keyboard("{ArrowLeft}");
    await expect(Number.parseFloat(getComputedStyle(application).outlineWidth)).toBeGreaterThan(0);
    await expect(getComputedStyle(application).outlineColor).not.toBe("rgba(0, 0, 0, 0)");
    const tooltip = await canvas.findByRole("status");
    await waitFor(() => expect(within(tooltip).getByText("January")).toBeVisible());
    await waitFor(() => expect(within(tooltip).getByText("186")).toBeVisible());
    await waitFor(() => expect(within(tooltip).getByText("80")).toBeVisible());
    await userEvent.keyboard("{ArrowRight}");
    await waitFor(() => expect(within(tooltip).getByText("February")).toBeVisible());
    await waitFor(() => expect(within(tooltip).getByText("305")).toBeVisible());
  },
};

export const RightToLeft: Story = {
  args: { dir: "rtl" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const application = canvas.getByRole("application");
    await expect(within(application).getByText("January").getBoundingClientRect().x).toBeGreaterThan(
      within(application).getByText("February").getBoundingClientRect().x,
    );
    application.focus();
    await userEvent.keyboard("{ArrowRight}");
    const tooltip = await canvas.findByRole("status");
    await waitFor(() => expect(within(tooltip).getByText("January")).toBeVisible());
    await expect(getComputedStyle(tooltip).direction).toBe("rtl");
    await userEvent.keyboard("{ArrowLeft}");
    await waitFor(() => expect(within(tooltip).getByText("February")).toBeVisible());
    await waitFor(() => expect(within(tooltip).getByText("305")).toBeVisible());
  },
};
export const LineIndicator: Story = {
  args: { config: { desktop: { label: "Workstations", color: "var(--primary)" } } },
  render: (args) => (
    <ChartContainer {...args}>
      <BarChart accessibilityLayer data={data}>
        <XAxis dataKey="month" />
        <Bar dataKey="desktop" fill="var(--color-desktop)" isAnimationActive={false} />
        <ChartTooltip
          content={<ChartTooltipContent indicator="line" labelFormatter={(label) => `Month: ${label}`} />}
          isAnimationActive={false}
        />
      </BarChart>
    </ChartContainer>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    canvas.getByRole("application").focus();
    await userEvent.keyboard("{ArrowLeft}");
    const tooltip = await canvas.findByRole("status");
    await waitFor(() => expect(within(tooltip).getByText("Month: January")).toBeVisible());
    await waitFor(() => expect(within(tooltip).getByText("Workstations")).toBeVisible());
    await waitFor(() => expect(within(tooltip).getByText("186")).toBeVisible());
  },
};
export const Formatted: Story = {
  render: (args) => (
    <ChartContainer {...args}>
      <BarChart accessibilityLayer data={data}>
        <Bar dataKey="desktop" fill="var(--color-desktop)" isAnimationActive={false} />
        <ChartTooltip
          content={
            <ChartTooltipContent
              hideLabel
              hideIndicator
              formatter={(value, name) => <span>{`${name}: ${value} visitors`}</span>}
            />
          }
          isAnimationActive={false}
        />
      </BarChart>
    </ChartContainer>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    canvas.getByRole("application").focus();
    await userEvent.keyboard("{ArrowLeft}");
    const value = await canvas.findByText("desktop: 186 visitors");
    await waitFor(() => expect(value).toBeVisible());
    await expect(canvas.queryByText("January")).toBeNull();
  },
};
export const Responsive: Story = {
  render: function Render(args) {
    const [isWide, setWide] = useState(false);
    return (
      <>
        <Button onClick={() => setWide(!isWide)}>Resize chart</Button>
        <div className={isWide ? "w-96" : "w-64"}>
          <ChartContainer {...args} className="h-64 w-full">
            <BarChart accessibilityLayer data={data}>
              <Bar dataKey="desktop" fill="var(--color-desktop)" isAnimationActive={false} />
            </BarChart>
          </ChartContainer>
        </div>
      </>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(() => expect(canvas.getByRole("application").getBoundingClientRect().width).toBe(256));
    await userEvent.click(canvas.getByRole("button", { name: "Resize chart" }));
    await waitFor(() => expect(canvas.getByRole("application").getBoundingClientRect().width).toBe(384));
  },
};

export const ResponsiveGrid: Story = {
  render: (args) => (
    <div className="grid w-64">
      <ChartContainer {...args} className="h-64 w-full">
        <BarChart accessibilityLayer data={data}>
          <Bar dataKey="desktop" fill="var(--color-desktop)" isAnimationActive={false} />
        </BarChart>
      </ChartContainer>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(() => expect(canvas.getByRole("application").getBoundingClientRect().width).toBe(256));
  },
};

export const ResponsiveGridRtl: Story = { ...ResponsiveGrid, args: { dir: "rtl" } };

export const ThemeColors: Story = {
  globals: { theme: "system" },
  args: {
    id: "visitor:charts",
    config: { desktop: { label: "Desktop", theme: { light: "var(--primary)", dark: "var(--success)" } } },
  },
  render: function Render(args) {
    const { resolvedTheme, setTheme } = useTheme();
    return (
      <>
        <Button
          variant={resolvedTheme === "dark" ? "success" : "default"}
          onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
        >
          Switch chart palette
        </Button>
        <ChartContainer {...args}>
          <BarChart accessibilityLayer data={data}>
            <Bar
              dataKey="desktop"
              fill={`var(${CSS.escape(`--color-${Object.keys(args.config)[0]}`)})`}
              isAnimationActive={false}
            />
          </BarChart>
        </ChartContainer>
      </>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const bar = canvasElement.querySelector<SVGElement>(".recharts-bar-rectangle path");
    await expect(bar).not.toBeNull();
    const toggle = canvas.getByRole("button", { name: "Switch chart palette" });
    await waitFor(() => expect(getComputedStyle(bar!).fill).toBe(getComputedStyle(toggle).backgroundColor));
    const original = getComputedStyle(bar!).fill;
    await userEvent.click(toggle);
    await userEvent.unhover(toggle);
    await waitFor(() => expect(getComputedStyle(bar!).fill).not.toBe(original));
    await waitFor(() => expect(getComputedStyle(bar!).fill).toBe(getComputedStyle(toggle).backgroundColor));
  },
};

export const EscapedIdentifiers: Story = {
  ...ThemeColors,
  args: {
    ...ThemeColors.args,
    id: 'visitor: daily[α] "desktop"',
    config: {
      "desk top:α": { label: "Desktop", theme: { light: "var(--primary)", dark: "var(--success)" } },
    },
  },
};

export const InteractiveLegend: Story = {
  render: function Render(args) {
    const [isHidden, setHidden] = useState(false);
    return (
      <ChartContainer {...args}>
        <BarChart accessibilityLayer data={data}>
          <Bar dataKey="desktop" fill="var(--color-desktop)" isAnimationActive={false} hide={isHidden} />
          <ChartLegend
            content={<ChartLegendContent htmlProps={{ "aria-label": "Visible series" }} />}
            onClick={() => setHidden(!isHidden)}
          />
        </BarChart>
      </ChartContainer>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(() => expect(canvasElement.querySelectorAll(".recharts-bar-rectangle path").length).toBe(2));
    await userEvent.click(canvas.getByRole("button", { name: "Desktop" }));
    await waitFor(() => expect(canvasElement.querySelectorAll(".recharts-bar-rectangle path").length).toBe(0));
    await userEvent.keyboard("{Enter}");
    await waitFor(() => expect(canvasElement.querySelectorAll(".recharts-bar-rectangle path").length).toBe(2));
  },
};

export const DashedIndicator: Story = {
  ...LineIndicator,
  render: (args) => (
    <ChartContainer {...args}>
      <BarChart accessibilityLayer data={data}>
        <XAxis dataKey="month" />
        <Bar dataKey="desktop" fill="var(--color-desktop)" isAnimationActive={false} />
        <ChartTooltip
          content={<ChartTooltipContent indicator="dashed" labelFormatter={(label) => `Month: ${label}`} />}
          isAnimationActive={false}
        />
      </BarChart>
    </ChartContainer>
  ),
};
export const IconLegend: Story = {
  ...Default,
  args: { config: { desktop: { label: "Desktop", icon: LaptopIcon, color: "var(--primary)" }, mobile: config.mobile } },
};
export const LabelOnly: Story = {
  args: { config: { desktop: { label: "Desktop" } } },
  render: (args) => (
    <ChartContainer {...args}>
      <BarChart accessibilityLayer data={data}>
        <XAxis dataKey="month" />
        <Bar dataKey="desktop" fill="var(--primary)" isAnimationActive={false} />
        <ChartTooltip
          content={<ChartTooltipContent hideIndicator htmlProps={{ "aria-label": "Visitor details" }} />}
          isAnimationActive={false}
        />
        <ChartLegend content={<ChartLegendContent hideIcon />} />
      </BarChart>
    </ChartContainer>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    canvas.getByRole("application").focus();
    await userEvent.keyboard("{ArrowLeft}");
    const tooltip = await canvas.findByRole("status", { name: "Visitor details" });
    await waitFor(() => expect(within(tooltip).getByText("186")).toBeVisible());
    await waitFor(() => expect(within(tooltip).getByText("January")).toBeVisible());
  },
};

export const ValueOrder: Story = {
  render: (args) => (
    <ChartContainer {...args}>
      <BarChart accessibilityLayer data={data}>
        <XAxis dataKey="month" />
        <Bar dataKey="desktop" fill="var(--color-desktop)" isAnimationActive={false} />
        <Bar dataKey="mobile" fill="var(--color-mobile)" isAnimationActive={false} />
        <ChartTooltip itemSorter="value" content={<ChartTooltipContent />} isAnimationActive={false} />
      </BarChart>
    </ChartContainer>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    canvas.getByRole("application").focus();
    await userEvent.keyboard("{ArrowLeft}");
    const tooltip = await canvas.findByRole("status");
    const mobile = within(tooltip).getByText("Mobile");
    const desktop = within(tooltip).getByText("Desktop");
    await expect(mobile.compareDocumentPosition(desktop) & Node.DOCUMENT_POSITION_FOLLOWING).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
  },
};

export const PortalDensity: Story = {
  args: { density: "compact" },
  parameters: { docs: { story: { inline: false } } },
  render: (args) => (
    <ChartContainer {...args}>
      <BarChart accessibilityLayer data={data}>
        <XAxis dataKey="month" />
        <Bar dataKey="desktop" fill="var(--color-desktop)" isAnimationActive={false} />
        <ChartTooltip
          portal={document.body}
          content={<ChartTooltipContent htmlProps={{ "aria-label": "Portal visitors" }} />}
          isAnimationActive={false}
        />
      </BarChart>
    </ChartContainer>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    canvas.getByRole("application").focus();
    await userEvent.keyboard("{ArrowLeft}");
    const tooltip = await body.findByRole("status", { name: "Portal visitors" });
    await waitFor(() => expect(within(tooltip).getByText("186")).toBeVisible());
    await expect(getComputedStyle(tooltip).paddingTop).toBe("8px");
    await expect(canvasElement.contains(tooltip)).toBe(false);
  },
};

export const CustomKeys: Story = {
  args: {
    config: {
      visitors: { label: "Total Visitors" },
      chrome: { label: "Chrome", color: "var(--primary)" },
      safari: { label: "Safari", color: "var(--success)" },
    },
  },
  render: (args) => (
    <ChartContainer {...args}>
      <BarChart accessibilityLayer data={fixture_chartBrowsers}>
        <XAxis dataKey="browser" reversed={args.dir === "rtl"} />
        <Bar dataKey="visitors" isAnimationActive={false} />
        <ChartTooltip
          content={<ChartTooltipContent labelKey="visitors" nameKey="browser" />}
          isAnimationActive={false}
        />
      </BarChart>
    </ChartContainer>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    canvas.getByRole("application").focus();
    const tooltip = await canvas.findByRole("status");
    await waitFor(() => expect(within(tooltip).getByText("Total Visitors")).toBeVisible());
    await expect(within(tooltip).getByText("Chrome")).toBeVisible();
    await expect(within(tooltip).getByText("187")).toBeVisible();
    const [chrome, safari] = canvasElement.querySelectorAll<SVGElement>(".recharts-bar-rectangle path");
    await expect(chrome).toBeDefined();
    await expect(safari).toBeDefined();
    await expect(getComputedStyle(chrome!).fill).not.toBe(getComputedStyle(safari!).fill);
    await expect(getComputedStyle(tooltip.querySelector<HTMLElement>('[aria-hidden="true"]')!).backgroundColor).toBe(
      getComputedStyle(chrome!).fill,
    );
  },
};
export const CustomKeysRtl: Story = { ...CustomKeys, args: { ...CustomKeys.args, dir: "rtl" } };

export const CustomLegendKeys: Story = {
  ...CustomKeys,
  render: (args) => (
    <ChartContainer {...args}>
      <PieChart accessibilityLayer>
        <Pie data={fixture_chartBrowsers} dataKey="visitors" nameKey="browser" isAnimationActive={false} />
        <ChartTooltip
          content={<ChartTooltipContent labelKey="visitors" nameKey="browser" />}
          isAnimationActive={false}
        />
        <ChartLegend content={<ChartLegendContent nameKey="browser" />} />
      </PieChart>
    </ChartContainer>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const legend = canvasElement.querySelector<HTMLElement>('[data-slot="chart-legend"]');
    await expect(legend).not.toBeNull();
    await expect(within(legend!).getByText("Chrome")).toBeVisible();
    await expect(within(legend!).getByText("Safari")).toBeVisible();
    const sectors = canvasElement.querySelectorAll<SVGElement>(".recharts-pie-sector path");
    await expect(sectors.length).toBe(2);
    await userEvent.hover(sectors[0]!);
    const tooltip = await canvas.findByRole("status");
    await waitFor(() => expect(within(tooltip).getByText("Total Visitors")).toBeVisible());
    await expect(within(tooltip).getByText("Chrome")).toBeVisible();
    await expect(within(tooltip).getByText("187")).toBeVisible();
    await userEvent.hover(sectors[1]!);
    await waitFor(() => expect(within(tooltip).getByText("Safari")).toBeVisible());
    await expect(within(tooltip).getByText("200")).toBeVisible();
  },
};
export const CustomLegendKeysRtl: Story = { ...CustomLegendKeys, args: { ...CustomKeys.args, dir: "rtl" } };

export const InteractiveSeries: Story = {
  args: { config: { ...config, views: { label: "Page Views" } }, className: "h-64 w-full" },
  render: function Render(args) {
    const [activeSeries, setActiveSeries] = useState<"desktop" | "mobile">("desktop");
    return (
      <Card dir={args.dir} className="w-96 max-w-full">
        <CardHeader>
          <CardTitle>Visitor overview</CardTitle>
          <CardDescription>Choose a series to inspect monthly visitors.</CardDescription>
          <div className="flex gap-control-gap">
            <Button aria-pressed={activeSeries === "desktop"} onClick={() => setActiveSeries("desktop")}>
              Desktop {data.reduce((total, item) => total + item.desktop, 0)}
            </Button>
            <Button aria-pressed={activeSeries === "mobile"} onClick={() => setActiveSeries("mobile")}>
              Mobile {data.reduce((total, item) => total + item.mobile, 0)}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <ChartContainer {...args}>
            <BarChart accessibilityLayer data={data}>
              <CartesianGrid vertical={false} orientation={args.dir === "rtl" ? "right" : "left"} />
              <XAxis dataKey="month" reversed={args.dir === "rtl"} />
              <Bar dataKey={activeSeries} fill={`var(--color-${activeSeries})`} isAnimationActive={false} />
              <ChartTooltip content={<ChartTooltipContent nameKey="views" />} isAnimationActive={false} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const desktop = canvas.getByRole("button", { name: "Desktop 491" });
    const mobile = canvas.getByRole("button", { name: "Mobile 280" });
    await expect(desktop).toHaveAttribute("aria-pressed", "true");
    await userEvent.click(mobile);
    await expect(mobile).toHaveAttribute("aria-pressed", "true");
    await expect(desktop).toHaveAttribute("aria-pressed", "false");
    canvas.getByRole("application").focus();
    const tooltip = await canvas.findByRole("status");
    await waitFor(() => expect(within(tooltip).getByText("80")).toBeVisible());
    await expect(within(tooltip).getByText("Page Views")).toBeVisible();
    await userEvent.click(desktop);
    canvas.getByRole("application").focus();
    await userEvent.keyboard("{Enter}");
    await waitFor(() => expect(within(canvas.getByRole("status")).getByText("186")).toBeVisible());
    await expect(desktop).toHaveAttribute("aria-pressed", "true");
  },
};
export const InteractiveSeriesRtl: Story = { ...InteractiveSeries, args: { ...InteractiveSeries.args, dir: "rtl" } };

export const PortalDirection: Story = {
  ...PortalDensity,
  args: { density: "compact", dir: "rtl" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    canvas.getByRole("application").focus();
    const tooltip = await within(canvasElement.ownerDocument.body).findByRole("status", { name: "Portal visitors" });
    await expect(getComputedStyle(tooltip).direction).toBe("rtl");
    await expect(canvasElement.contains(tooltip)).toBe(false);
    await expect(getComputedStyle(tooltip).paddingTop).toBe("8px");
    await expect(within(tooltip).getByText("Desktop", { selector: "span" }).getBoundingClientRect().x).toBeGreaterThan(
      within(tooltip).getByText("186").getBoundingClientRect().x,
    );
    const bar = canvasElement.querySelector<SVGElement>(".recharts-bar-rectangle path");
    const indicator = tooltip.querySelector<HTMLElement>('[aria-hidden="true"]');
    await expect(getComputedStyle(indicator!).backgroundColor).toBe(getComputedStyle(bar!).fill);
  },
};
export const InheritedPortalDirection: Story = {
  ...PortalDirection,
  args: { density: "compact" },
  render: (args) => (
    <DirectionProvider direction="rtl">
      <ChartContainer {...args}>
        <BarChart accessibilityLayer data={data}>
          <Bar dataKey="desktop" fill="var(--color-desktop)" isAnimationActive={false} />
          <ChartTooltip
            portal={document.body}
            content={<ChartTooltipContent htmlProps={{ "aria-label": "Portal visitors" }} />}
            isAnimationActive={false}
          />
        </BarChart>
      </ChartContainer>
    </DirectionProvider>
  ),
};
export const PortalLegendDirection: Story = {
  args: { dir: "rtl", density: "compact" },
  parameters: { docs: { story: { inline: false } } },
  render: function Render(args) {
    const [selected, setSelected] = useState("No series selected");
    return (
      <>
        <ChartContainer {...args}>
          <BarChart accessibilityLayer data={data}>
            <Bar dataKey="desktop" fill="var(--color-desktop)" isAnimationActive={false} />
            <ChartLegend
              portal={document.body}
              content={<ChartLegendContent htmlProps={{ "aria-label": "Portal legend" }} />}
              onClick={(item) => setSelected(String(item.dataKey))}
            />
          </BarChart>
        </ChartContainer>
        <output aria-label="Selected series">{selected}</output>
      </>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const desktop = await body.findByRole("button", { name: "Desktop" });
    await expect(getComputedStyle(desktop).direction).toBe("rtl");
    await expect(canvasElement.contains(desktop)).toBe(false);
    const bar = canvasElement.querySelector<SVGElement>(".recharts-bar-rectangle path");
    const indicator = desktop.querySelector<HTMLElement>('[aria-hidden="true"]');
    await expect(getComputedStyle(indicator!).backgroundColor).toBe(getComputedStyle(bar!).fill);
    await userEvent.click(desktop);
    await expect(canvas.getByLabelText("Selected series")).toHaveTextContent("desktop");
  },
};

export const TooltipDirectionOverride: Story = {
  ...PortalDirection,
  render: (args) => (
    <ChartContainer {...args}>
      <BarChart accessibilityLayer data={data}>
        <Bar dataKey="desktop" fill="var(--color-desktop)" isAnimationActive={false} />
        <ChartTooltip
          portal={document.body}
          content={<ChartTooltipContent htmlProps={{ dir: "ltr", "aria-label": "LTR details" }} />}
          isAnimationActive={false}
        />
      </BarChart>
    </ChartContainer>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    canvas.getByRole("application").focus();
    const tooltip = await within(canvasElement.ownerDocument.body).findByRole("status", { name: "LTR details" });
    await expect(getComputedStyle(tooltip).direction).toBe("ltr");
    await expect(within(tooltip).getByText("Desktop", { selector: "span" }).getBoundingClientRect().x).toBeLessThan(
      within(tooltip).getByText("186").getBoundingClientRect().x,
    );
  },
};
export const ValueLabels: Story = {
  render: (args) => (
    <ChartContainer {...args}>
      <BarChart accessibilityLayer data={data} margin={{ top: 20 }}>
        <XAxis dataKey="month" reversed={args.dir === "rtl"} />
        <Bar dataKey="desktop" fill="var(--color-desktop)" isAnimationActive={false}>
          <LabelList dataKey="desktop" position="top" className="fill-(--color-desktop)" />
        </Bar>
      </BarChart>
    </ChartContainer>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const value = canvas.getByText("186");
    await expect(value).toBeVisible();
    const bar = canvasElement.querySelector<SVGElement>(".recharts-bar-rectangle path");
    await expect(bar).not.toBeNull();
    await expect(getComputedStyle(value).fill).toBe(getComputedStyle(bar!).fill);
    await expect(value.getBoundingClientRect().bottom).toBeLessThan(bar!.getBoundingClientRect().top);
  },
};
export const ValueLabelsRtl: Story = { ...ValueLabels, args: { dir: "rtl" } };

export const HiddenLabel: Story = {
  render: (args) => (
    <ChartContainer {...args}>
      <BarChart accessibilityLayer data={data}>
        <Bar dataKey="desktop" fill="var(--color-desktop)" isAnimationActive={false} />
        <ChartTooltip content={<ChartTooltipContent hideLabel />} isAnimationActive={false} />
      </BarChart>
    </ChartContainer>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    canvas.getByRole("application").focus();
    const tooltip = await canvas.findByRole("status");
    await expect(within(tooltip).getByText("Desktop")).toBeVisible();
    await expect(within(tooltip).getByText("186")).toBeVisible();
    await expect(within(tooltip).queryByText("January")).toBeNull();
    const indicator = tooltip.querySelector<HTMLElement>('[aria-hidden="true"]');
    await expect(indicator).not.toBeNull();
    await expect(indicator!).toBeVisible();
  },
};
export const InitialTooltip: Story = {
  render: (args) => (
    <ChartContainer {...args}>
      <BarChart accessibilityLayer data={data}>
        <Bar dataKey="desktop" fill="var(--color-desktop)" isAnimationActive={false} />
        <XAxis dataKey="month" />
        <ChartTooltip defaultIndex={1} content={<ChartTooltipContent />} isAnimationActive={false} />
      </BarChart>
    </ChartContainer>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const tooltip = await canvas.findByRole("status");
    await waitFor(() => expect(within(tooltip).getByText("February")).toBeVisible());
    await expect(within(tooltip).getByText("305")).toBeVisible();
    canvas.getByRole("application").focus();
    await waitFor(() => expect(within(canvas.getByRole("status")).getByText("January")).toBeVisible());
    await expect(within(canvas.getByRole("status")).getByText("186")).toBeVisible();
  },
};
