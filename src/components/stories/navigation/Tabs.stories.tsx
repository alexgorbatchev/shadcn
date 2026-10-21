import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn, waitFor, within } from "storybook/test";
import { DirectionProvider } from "../../DirectionProvider";
import { Button } from "../../Button";
import { Input } from "../../Input";
import { AppWindowIcon, CodeIcon } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../Card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../../Tabs";

const meta: Meta<typeof Tabs> = {
  title: "@alexgorbatchev/shadcn/components/navigation/Tabs",
  component: Tabs,
  tags: ["autodocs", "test"],
  args: { defaultValue: "overview", onValueChange: fn() },
  render: (args) => (
    <Tabs {...args}>
      <TabsList aria-label="Project sections">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="settings">Settings</TabsTrigger>
        <TabsTrigger value="disabled" disabled>
          Unavailable
        </TabsTrigger>
      </TabsList>
      <TabsContent value="overview">Your project is ready.</TabsContent>
      <TabsContent value="settings">Configure your preferences.</TabsContent>
    </Tabs>
  ),
};
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement, userEvent, args }) => {
    const canvas = within(canvasElement);
    const overview = canvas.getByRole("tab", { name: "Overview" });
    const settings = canvas.getByRole("tab", { name: "Settings" });
    await expect(canvas.getByRole("tabpanel", { name: "Overview" })).toHaveTextContent("Your project is ready.");
    await expect(getComputedStyle(overview.closest('[data-slot="tabs"]') as HTMLElement).flexDirection).toBe("column");
    await userEvent.click(overview);
    await userEvent.keyboard("{ArrowRight}");
    await expect(settings).toHaveFocus();
    await expect(overview).toHaveAttribute("aria-selected", "true");
    await userEvent.keyboard("{Enter}");
    await expect(canvas.getByRole("tabpanel", { name: "Settings" })).toHaveTextContent("Configure your preferences.");
    await expect(args.onValueChange).toHaveBeenLastCalledWith("settings", expect.objectContaining({ reason: "none" }));
    await userEvent.keyboard("{ArrowRight}");
    const unavailable = canvas.getByRole("tab", { name: "Unavailable" });
    await expect(unavailable).toHaveFocus();
    await expect(unavailable).toHaveAttribute("aria-disabled", "true");
    await userEvent.keyboard("{Enter} ");
    await expect(settings).toHaveAttribute("aria-selected", "true");
    await userEvent.keyboard("{ArrowRight}");
    await expect(overview).toHaveFocus();
  },
};
export const Settings: Story = {
  args: { defaultValue: "settings" },
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("tabpanel", { name: "Settings" })).toBeVisible();
    await userEvent.click(canvas.getByRole("tab", { name: "Overview" }));
    await expect(canvas.getByRole("tabpanel", { name: "Overview" })).toBeVisible();
  },
};
export const Vertical: Story = {
  args: { orientation: "vertical" },
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const list = canvas.getByRole("tablist");
    await expect(list).toHaveAttribute("aria-orientation", "vertical");
    await expect(getComputedStyle(list).flexDirection).toBe("column");
    await userEvent.click(canvas.getByRole("tab", { name: "Overview" }));
    await userEvent.keyboard("{ArrowDown}");
    await expect(canvas.getByRole("tab", { name: "Settings" })).toHaveFocus();
    await userEvent.keyboard(" ");
    await expect(canvas.getByRole("tabpanel", { name: "Settings" })).toBeVisible();
  },
};
export const Line: Story = {
  render: (args) => (
    <Tabs {...args}>
      <TabsList variant="line" aria-label="Project sections">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="settings">Settings</TabsTrigger>
      </TabsList>
      <TabsContent value="overview">Project overview.</TabsContent>
      <TabsContent value="settings">Project settings.</TabsContent>
    </Tabs>
  ),
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("tab", { name: "Settings" }));
    await expect(canvas.getByRole("tabpanel", { name: "Settings" })).toHaveTextContent("Project settings.");
    await userEvent.keyboard("{Home}");
    await expect(canvas.getByRole("tab", { name: "Overview" })).toHaveFocus();
  },
};
export const NativeRootCallback: Story = {
  args: { className: (state) => (state.orientation === "horizontal" ? "gap-6" : "gap-2") },
  play: async ({ canvasElement }) => {
    const root = within(canvasElement).getByRole("tablist").parentElement as HTMLElement;
    await expect(getComputedStyle(root).rowGap).toBe("24px");
  },
};
export const NativePartCallbacks: Story = {
  render: (args) => (
    <Tabs {...args}>
      <TabsList
        aria-label="Project sections"
        className={(state) => (state.orientation === "horizontal" ? "gap-6" : "gap-2")}
      >
        <TabsTrigger value="overview" className={(state) => (state.active ? "h-8" : "h-6")}>
          Overview
        </TabsTrigger>
        <TabsTrigger value="settings" className={(state) => (state.active ? "h-8" : "h-6")}>
          Settings
        </TabsTrigger>
      </TabsList>
      <TabsContent value="overview" className={(state) => (state.hidden ? "min-h-0" : "min-h-16")}>
        Project overview.
      </TabsContent>
      <TabsContent value="settings" className={(state) => (state.hidden ? "min-h-0" : "min-h-16")}>
        Project settings.
      </TabsContent>
    </Tabs>
  ),
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const overview = canvas.getByRole("tab", { name: "Overview" });
    await expect(getComputedStyle(canvas.getByRole("tablist")).columnGap).toBe("24px");
    await expect(overview.getBoundingClientRect().height).toBe(32);
    await expect(canvas.getByRole("tabpanel").getBoundingClientRect().height).toBeGreaterThanOrEqual(64);
    await userEvent.click(canvas.getByRole("tab", { name: "Settings" }));
    await expect(overview.getBoundingClientRect().height).toBe(24);
    await expect(
      canvas.getByRole("tabpanel", { name: "Settings" }).getBoundingClientRect().height,
    ).toBeGreaterThanOrEqual(64);
  },
};
export const ActivateOnFocus: Story = {
  render: (args) => (
    <Tabs {...args}>
      <TabsList aria-label="Project sections" activateOnFocus loopFocus={false}>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="settings">Settings</TabsTrigger>
      </TabsList>
      <TabsContent value="overview">Project overview.</TabsContent>
      <TabsContent value="settings">Project settings.</TabsContent>
    </Tabs>
  ),
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const settings = canvas.getByRole("tab", { name: "Settings" });
    await userEvent.click(canvas.getByRole("tab", { name: "Overview" }));
    await userEvent.keyboard("{ArrowRight}");
    await expect(canvas.getByRole("tabpanel", { name: "Settings" })).toBeVisible();
    await userEvent.keyboard("{ArrowRight}");
    await expect(settings).toHaveFocus();
  },
};
export const CancelledChange: Story = {
  args: { onValueChange: (_value, details) => details.cancel() },
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("tab", { name: "Settings" }));
    await expect(canvas.getByRole("tab", { name: "Overview" })).toHaveAttribute("aria-selected", "true");
    await expect(canvas.getByRole("tabpanel", { name: "Overview" })).toBeVisible();
  },
};
export const Controlled: Story = {
  render: function Render(args) {
    const [value, setValue] = useState("overview");
    return (
      <Tabs {...args} value={value} onValueChange={setValue}>
        <TabsList aria-label="Project sections">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">Project overview.</TabsContent>
        <TabsContent value="settings">Project settings.</TabsContent>
        <output aria-label="Current section">{value}</output>
      </Tabs>
    );
  },
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("tab", { name: "Settings" }));
    await expect(canvas.getByRole("status", { name: "Current section" })).toHaveTextContent("settings");
  },
};
export const RightToLeft: Story = {
  render: (args) => (
    <DirectionProvider direction="rtl">
      <Tabs {...args} dir="rtl">
        <TabsList aria-label="Project sections">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">Project overview.</TabsContent>
        <TabsContent value="settings">Project settings.</TabsContent>
      </Tabs>
    </DirectionProvider>
  ),
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("tab", { name: "Overview" }));
    await userEvent.keyboard("{ArrowLeft}{Enter}");
    await expect(canvas.getByRole("tabpanel", { name: "Settings" })).toBeVisible();
  },
};
export const VerticalRightToLeftLine: Story = {
  args: { orientation: "vertical" },
  render: (args) => (
    <DirectionProvider direction="rtl">
      <Tabs {...args} dir="rtl">
        <TabsList aria-label="Project sections" variant="line" activateOnFocus>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">Project overview.</TabsContent>
        <TabsContent value="settings">Project settings.</TabsContent>
      </Tabs>
    </DirectionProvider>
  ),
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("tab", { name: "Overview" }));
    await userEvent.keyboard("{ArrowDown}");
    const settings = canvas.getByRole("tab", { name: "Settings" });
    await expect(settings).toHaveFocus();
    await expect(canvas.getByRole("tabpanel", { name: "Settings" })).toBeVisible();
    await expect(parseFloat(getComputedStyle(settings, "::after").insetInlineEnd)).toBeLessThan(0);
  },
};
export const NullSelection: Story = {
  args: { defaultValue: null },
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByRole("tabpanel")).not.toBeInTheDocument();
    await userEvent.click(canvas.getByRole("tab", { name: "Settings" }));
    await expect(canvas.getByRole("tabpanel", { name: "Settings" })).toBeVisible();
  },
};
export const MissingInitialValue: Story = {
  args: { defaultValue: "missing" },
  play: async ({ canvasElement, args }) => {
    await expect(await within(canvasElement).findByRole("tabpanel", { name: "Overview" })).toBeVisible();
    await expect(args.onValueChange).toHaveBeenCalledWith("overview", expect.objectContaining({ reason: "missing" }));
  },
};
export const KeepMounted: Story = {
  render: (args) => (
    <Tabs {...args}>
      <TabsList aria-label="Project sections">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="settings">Settings</TabsTrigger>
      </TabsList>
      <TabsContent value="overview" keepMounted>
        <Input aria-label="Project name" />
      </TabsContent>
      <TabsContent value="settings">Project settings.</TabsContent>
    </Tabs>
  ),
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("textbox", { name: "Project name" });
    const overview = canvas.getByRole("tabpanel", { name: "Overview" });
    await userEvent.type(input, "Example project");
    await userEvent.click(canvas.getByRole("tab", { name: "Settings" }));
    await expect(input).toBeInTheDocument();
    await waitFor(() => expect(input).not.toBeVisible());
    await expect(overview).toHaveAttribute("hidden");
    await expect(overview).toHaveAttribute("inert");
    await expect(canvas.getByRole("tabpanel", { name: "Settings" })).toBeVisible();
    await userEvent.click(canvas.getByRole("tab", { name: "Overview" }));
    await waitFor(() => expect(input).toBeVisible());
    await expect(overview).not.toHaveAttribute("hidden");
    await expect(overview).not.toHaveAttribute("inert");
    await expect(input).toHaveValue("Example project");
  },
};
export const SelectedTabRemoved: Story = {
  render: function Render(args) {
    const [hasOverview, setHasOverview] = useState(true);
    return (
      <Tabs {...args}>
        <TabsList aria-label="Project sections">
          {hasOverview && <TabsTrigger value="overview">Overview</TabsTrigger>}
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">Project overview.</TabsContent>
        <TabsContent value="settings">Project settings.</TabsContent>
        <Button onClick={() => setHasOverview(false)}>Remove overview</Button>
      </Tabs>
    );
  },
  play: async ({ canvasElement, userEvent, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Remove overview" }));
    await expect(await canvas.findByRole("tabpanel", { name: "Settings" })).toBeVisible();
    await expect(args.onValueChange).toHaveBeenLastCalledWith(
      "settings",
      expect.objectContaining({ reason: "missing" }),
    );
  },
};
export const SelectedTabDisabled: Story = {
  render: function Render(args) {
    const [isDisabled, setIsDisabled] = useState(false);
    return (
      <Tabs {...args}>
        <TabsList aria-label="Project sections">
          <TabsTrigger value="overview" disabled={isDisabled}>
            Overview
          </TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">Project overview.</TabsContent>
        <TabsContent value="settings">Project settings.</TabsContent>
        <Button onClick={() => setIsDisabled(true)}>Disable overview</Button>
      </Tabs>
    );
  },
  play: async ({ canvasElement, userEvent, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Disable overview" }));
    await expect(await canvas.findByRole("tabpanel", { name: "Settings" })).toBeVisible();
    await expect(args.onValueChange).toHaveBeenLastCalledWith(
      "settings",
      expect.objectContaining({ reason: "disabled" }),
    );
  },
};

export const Icons: Story = {
  args: { defaultValue: "preview" },
  render: (args) => (
    <Tabs {...args}>
      <TabsList aria-label="Example view">
        <TabsTrigger value="preview">
          <AppWindowIcon aria-hidden data-icon="inline-start" />
          Preview
        </TabsTrigger>
        <TabsTrigger value="code">
          Code
          <CodeIcon aria-hidden data-icon="inline-end" />
        </TabsTrigger>
      </TabsList>
      <TabsContent value="preview">Rendered example.</TabsContent>
      <TabsContent value="code">
        <pre>
          <code>{'const view = "example";'}</code>
        </pre>
      </TabsContent>
    </Tabs>
  ),
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const preview = canvas.getByRole("tab", { name: "Preview" });
    const icon = preview.querySelector("svg") as SVGElement;
    await expect(icon.getBoundingClientRect().width).toBe(16);
    await expect(icon.getBoundingClientRect().height).toBe(16);
    await expect(icon).toHaveAttribute("aria-hidden", "true");
    const code = canvas.getByRole("tab", { name: "Code" });
    for (const tab of [preview, code]) {
      const icon = tab.querySelector("svg")!;
      await expect(icon.getBoundingClientRect().top).toBeGreaterThanOrEqual(
        tab.getBoundingClientRect().top + Number.parseFloat(getComputedStyle(tab).borderTopWidth),
      );
      await expect(icon.getBoundingClientRect().bottom).toBeLessThanOrEqual(
        tab.getBoundingClientRect().bottom - Number.parseFloat(getComputedStyle(tab).borderBottomWidth),
      );
    }
    await expect(Number.parseFloat(getComputedStyle(preview).paddingInlineStart)).toBeLessThan(
      Number.parseFloat(getComputedStyle(preview).paddingInlineEnd),
    );
    await expect(Number.parseFloat(getComputedStyle(code).paddingInlineEnd)).toBeLessThan(
      Number.parseFloat(getComputedStyle(code).paddingInlineStart),
    );
    await userEvent.click(preview);
    await userEvent.keyboard("{End}{Enter}");
    await expect(canvas.getByRole("tab", { name: "Code" })).toHaveFocus();
    await expect(canvas.getByRole("tabpanel", { name: "Code" })).toHaveTextContent('const view = "example";');
  },
};

export const RightToLeftIcons: Story = {
  ...Icons,
  decorators: [
    (Story) => (
      <DirectionProvider direction="rtl">
        <div dir="rtl">
          <Story />
        </div>
      </DirectionProvider>
    ),
  ],
  play: async (context) => {
    await Icons.play?.(context);
    const canvas = within(context.canvasElement);
    const preview = canvas.getByRole("tab", { name: "Preview" });
    const code = canvas.getByRole("tab", { name: "Code" });
    await expect(preview.getBoundingClientRect().left).toBeGreaterThan(code.getBoundingClientRect().left);
    await context.userEvent.keyboard("{ArrowRight} ");
    await expect(preview).toHaveFocus();
    await expect(canvas.getByRole("tabpanel", { name: "Preview" })).toBeVisible();
  },
};

export const CompactRightToLeftIcons: Story = { ...RightToLeftIcons, args: { ...Icons.args, density: "compact" } };
export const CompactIcons: Story = { ...Icons, args: { ...Icons.args, density: "compact" } };

export const WithCards: Story = {
  render: (args) => (
    <Tabs {...args} className="w-96">
      <TabsList aria-label="Project dashboard">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="settings">Settings</TabsTrigger>
      </TabsList>
      <TabsContent value="overview">
        <Card>
          <CardHeader>
            <CardTitle>Project overview</CardTitle>
            <CardDescription>Track your active work.</CardDescription>
          </CardHeader>
          <CardContent>Twelve active projects and three pending tasks.</CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="settings">
        <Card>
          <CardHeader>
            <CardTitle>Project settings</CardTitle>
            <CardDescription>Manage your preferences.</CardDescription>
          </CardHeader>
          <CardContent>Configure notifications, security and themes.</CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  ),
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("tabpanel", { name: "Overview" })).toHaveTextContent(
      "Twelve active projects and three pending tasks.",
    );
    await userEvent.click(canvas.getByRole("tab", { name: "Settings" }));
    const panel = canvas.getByRole("tabpanel", { name: "Settings" });
    await expect(within(panel).getByText("Manage your preferences.")).toBeVisible();
    await expect(within(panel).getByText("Configure notifications, security and themes.")).toBeVisible();
    await waitFor(() => expect(canvas.queryByRole("tabpanel", { name: "Overview" })).not.toBeInTheDocument());
    await userEvent.keyboard("{Home}{Enter}");
    await expect(canvas.getByRole("tabpanel", { name: "Overview" })).toBeVisible();
  },
};
