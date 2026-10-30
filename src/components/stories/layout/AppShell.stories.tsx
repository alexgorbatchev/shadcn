import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, within, waitFor } from "storybook/test";
import { AnalyticsProvider } from "../../analytics/index.js";
import { ClientRouterLink } from "../helpers";
import { AppShell } from "../../AppShell";
import { PageHeader } from "../../PageHeader";
import { Stack } from "../../Stack";
import { StatCard } from "../../StatCard";
import { Text } from "../../Text";

const navigate = fn();
const trackNavigation = fn();

const meta: Meta<typeof AppShell> = {
  title: "@alexgorbatchev/shadcn/components/layout/AppShell",
  component: AppShell,
  tags: ["autodocs", "test"],
  args: {
    brand: "Acme",
    height: 480,
    header: "Workspace",
    sidebarFooter: "Your account",
    footer: "All changes saved",
    navigation: [
      { id: "overview", label: "Overview", href: "#overview", active: true },
      { id: "settings", label: "Settings", href: "#settings" },
    ],
    children: (
      <>
        <PageHeader title="Overview" description="Your workspace at a glance." />
        <StatCard label="Projects" value={24} />
        <p>Workspace content.</p>
      </>
    ),
  },
};
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("main", { name: "Application" })).toBeVisible();
    await expect(canvas.getByRole("complementary").getBoundingClientRect().height).toBeLessThanOrEqual(
      canvas.getByRole("main", { name: "Application" }).getBoundingClientRect().height,
    );
    await expect(canvas.getByRole("link", { name: "Overview" })).toHaveAttribute("aria-current", "page");
    const toggle = canvas.getByRole("button", { name: "Toggle Sidebar" });
    await userEvent.click(toggle);
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
    await userEvent.click(toggle);
    await expect(toggle).toHaveAttribute("aria-expanded", "true");
  },
};
export const Scrolling: Story = {
  args: {
    sidebarFooter: undefined,
    footer: undefined,
    children: (
      <>
        {Array.from({ length: 30 }, (_, i) => (
          <p key={i}>Project {i + 1}</p>
        ))}
      </>
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const viewport = canvas
      .getByRole("main", { name: "Application" })
      .querySelector("[data-slot=scroll-area-viewport]");
    await expect(viewport).not.toBeNull();
    await expect(viewport!.scrollHeight).toBeGreaterThan(viewport!.clientHeight);
    viewport!.scrollTop = viewport!.scrollHeight;
    await waitFor(() => expect(viewport!.scrollTop).toBeGreaterThan(0));
  },
};

export const RouterLinks: Story = {
  args: {
    navigation: [
      { id: "plans", label: "Plans", render: <ClientRouterLink to="/plans" onNavigate={navigate} />, active: true },
      { id: "settings", label: "Settings", render: <ClientRouterLink to="/settings" onNavigate={navigate} /> },
      { id: "help", label: "Help", href: "#help" },
    ],
  },
  decorators: [
    (Story) => (
      <AnalyticsProvider enabled transport={{ track: trackNavigation }}>
        <Story />
      </AnalyticsProvider>
    ),
  ],
  play: async ({ canvasElement, userEvent }) => {
    const navigation = within(within(canvasElement).getByRole("navigation", { name: "Primary navigation" }));
    const plans = navigation.getByRole("link", { name: "Plans" });
    const settings = navigation.getByRole("link", { name: "Settings" });
    await expect(plans).toHaveAttribute("href", "/plans");
    await expect(plans).toHaveAttribute("data-router-link");
    await expect(plans).toHaveAttribute("aria-current", "page");
    await expect(plans).toHaveAttribute("data-active");
    await expect(settings).not.toHaveAttribute("aria-current");
    await expect(navigation.getByRole("link", { name: "Help" })).not.toHaveAttribute("data-router-link");
    await userEvent.click(settings);
    await expect(navigate).toHaveBeenCalledWith("/settings");
    await waitFor(() =>
      expect(trackNavigation).toHaveBeenCalledWith(
        expect.objectContaining({ name: "ui.activate", component: "AppShell" }),
      ),
    );
  },
};

export const FillContent: Story = {
  args: {
    content: "fill",
    footer: undefined,
    children: (
      <Stack height="full" render={<section aria-label="Workspace canvas" />}>
        <Text>Full-height content owns its own scrolling.</Text>
      </Stack>
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const main = canvas.getByRole("main", { name: "Application" });
    const region = canvas.getByRole("region", { name: "Workspace canvas" });
    await expect(main.querySelector("[data-slot=scroll-area-viewport]")).toBeNull();
    const header = main.querySelector("header")!.getBoundingClientRect();
    const bounds = region.getBoundingClientRect();
    await expect(bounds.top).toBeCloseTo(header.bottom, 0);
    await expect(bounds.bottom).toBeCloseTo(main.getBoundingClientRect().bottom, 0);
    await expect(bounds.left).toBeCloseTo(main.getBoundingClientRect().left, 0);
  },
};
