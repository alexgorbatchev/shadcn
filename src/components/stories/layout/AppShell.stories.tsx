import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within, waitFor } from "storybook/test";
import { AppShell } from "../../AppShell";
import { PageHeader } from "../../PageHeader";
import { StatCard } from "../../StatCard";
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
