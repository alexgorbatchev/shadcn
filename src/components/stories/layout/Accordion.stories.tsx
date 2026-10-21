import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn, waitFor, within } from "storybook/test";
import { Button } from "../../Button";
import { DirectionProvider } from "../../DirectionProvider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../Card";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "../../Accordion";

const meta: Meta<typeof Accordion> = {
  title: "@alexgorbatchev/shadcn/components/layout/Accordion",
  component: Accordion,
  tags: ["autodocs", "test"],
  args: { onValueChange: fn() },
  render: (args) => (
    <Accordion {...args}>
      <AccordionItem value="install">
        <AccordionTrigger>How do I install the package?</AccordionTrigger>
        <AccordionContent>
          Install the package with Bun, import the theme, and scan the package output with Tailwind.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="density">
        <AccordionTrigger>Which densities are available?</AccordionTrigger>
        <AccordionContent>Compact and comfortable.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="disabled" disabled>
        <AccordionTrigger>Unavailable section</AccordionTrigger>
        <AccordionContent>This section is disabled.</AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
};
export default meta;
type Story = StoryObj<typeof meta>;

export const Closed: Story = {
  play: async ({ canvasElement, userEvent, args }) => {
    const canvas = within(canvasElement);
    const install = canvas.getByRole("button", { name: "How do I install the package?" });
    const density = canvas.getByRole("button", { name: "Which densities are available?" });
    await expect(install).toHaveAttribute("aria-expanded", "false");
    await userEvent.click(install);
    await expect(await canvas.findByRole("region", { name: "How do I install the package?" })).toBeVisible();
    await expect(args.onValueChange).toHaveBeenLastCalledWith(
      ["install"],
      expect.objectContaining({ reason: "trigger-press" }),
    );
    await userEvent.tab();
    await expect(density).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await expect(install).toHaveAttribute("aria-expanded", "false");
    await expect(density).toHaveAttribute("aria-expanded", "true");
    await userEvent.keyboard(" ");
    await expect(density).toHaveAttribute("aria-expanded", "false");
  },
};
export const Expanded: Story = {
  args: { defaultValue: ["install"] },
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const install = canvas.getByRole("button", { name: "How do I install the package?" });
    await expect(canvas.getByRole("region", { name: "How do I install the package?" })).toBeVisible();
    await userEvent.click(install);
    await waitFor(() =>
      expect(canvas.queryByRole("region", { name: "How do I install the package?" })).not.toBeInTheDocument(),
    );
  },
};
export const Multiple: Story = {
  args: { multiple: true, defaultValue: ["install", "density"] },
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("region", { name: "How do I install the package?" })).toBeVisible();
    await expect(canvas.getByRole("region", { name: "Which densities are available?" })).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "How do I install the package?" }));
    await expect(canvas.getByRole("button", { name: "Which densities are available?" })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
  },
};
export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ canvasElement, userEvent, args }) => {
    const trigger = within(canvasElement).getByRole("button", { name: "How do I install the package?" });
    await expect(trigger).toBeDisabled();
    await userEvent.tab();
    await expect(trigger).not.toHaveFocus();
    await userEvent.click(trigger);
    await userEvent.keyboard("{Enter} ");
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await expect(args.onValueChange).not.toHaveBeenCalled();
  },
};
export const DisabledItem: Story = {
  play: async ({ canvasElement, userEvent, args }) => {
    const trigger = within(canvasElement).getByRole("button", { name: "Unavailable section" });
    await expect(trigger).toBeDisabled();
    await userEvent.tab();
    await userEvent.tab();
    await userEvent.tab();
    await expect(trigger).not.toHaveFocus();
    await userEvent.click(trigger);
    await userEvent.keyboard("{Enter} ");
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await expect(args.onValueChange).not.toHaveBeenCalled();
  },
};
export const NativeRootCallback: Story = {
  args: { className: (state) => (state.value.length > 0 ? "gap-6" : "gap-2") },
  play: async ({ canvasElement, userEvent }) => {
    const trigger = within(canvasElement).getByRole("button", { name: "How do I install the package?" });
    const root = trigger.closest('[data-slot="accordion"]') as HTMLElement;
    await expect(getComputedStyle(root).rowGap).toBe("8px");
    await userEvent.click(trigger);
    await waitFor(() => expect(getComputedStyle(root).rowGap).toBe("24px"));
  },
};
export const NativePartCallbacks: Story = {
  render: (args) => (
    <Accordion {...args}>
      <AccordionItem value="details" className={(state) => (state.open ? "p-6" : "p-2")}>
        <AccordionTrigger className={(state) => (state.open ? "h-12" : "h-8")}>Details</AccordionTrigger>
        <AccordionContent className={(state) => (state.open ? "min-h-16" : "min-h-0")}>More details.</AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: "Details" });
    const item = trigger.closest('[data-slot="accordion-item"]') as HTMLElement;
    await expect(trigger.getBoundingClientRect().height).toBe(32);
    await expect(getComputedStyle(item).paddingTop).toBe("8px");
    await userEvent.click(trigger);
    await waitFor(() => {
      expect(trigger.getBoundingClientRect().height).toBe(48);
      expect(getComputedStyle(item).paddingTop).toBe("24px");
    });
    await waitFor(() =>
      expect(canvas.getByRole("region", { name: "Details" }).getBoundingClientRect().height).toBeGreaterThanOrEqual(64),
    );
  },
};
export const PanelClassOwnership: Story = {
  render: (args) => (
    <Accordion {...args} defaultValue={["details"]}>
      <AccordionItem value="details">
        <AccordionTrigger>Details</AccordionTrigger>
        <AccordionContent className="min-h-16">More details.</AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
  play: async ({ canvasElement }) => {
    const panel = within(canvasElement).getByRole("region", { name: "Details" });
    await expect(getComputedStyle(panel).minHeight).toBe("64px");
  },
};
export const KeepMounted: Story = {
  args: { keepMounted: true },
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const content = canvas.getByText("Compact and comfortable.");
    await expect(content).not.toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Which densities are available?" }));
    await expect(content).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Which densities are available?" }));
    await waitFor(() => expect(content).not.toBeVisible());
    await expect(content).toBeInTheDocument();
  },
};
export const HiddenUntilFound: Story = {
  args: { hiddenUntilFound: true },
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: "Which densities are available?" });
    const content = canvas.getByText("Compact and comfortable.");
    const panel = content.closest('[data-slot="accordion-content"]');
    await expect(panel).toHaveAttribute("hidden", "until-found");
    await expect(content).toBeInTheDocument();
    await userEvent.click(trigger);
    await expect(content).toBeVisible();
    await expect(panel).not.toHaveAttribute("hidden");
    await userEvent.click(trigger);
    await waitFor(() => expect(panel).toHaveAttribute("hidden", "until-found"));
  },
};
export const CancelledChange: Story = {
  args: { onValueChange: (_value, details) => details.cancel() },
  play: async ({ canvasElement, userEvent }) => {
    const trigger = within(canvasElement).getByRole("button", { name: "How do I install the package?" });
    await userEvent.click(trigger);
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
  },
};
export const Controlled: Story = {
  render: function Render(args) {
    const [value, setValue] = useState<string[]>([]);
    return (
      <Accordion {...args} value={value} onValueChange={setValue}>
        <AccordionItem value="details">
          <AccordionTrigger>Details</AccordionTrigger>
          <AccordionContent>More details.</AccordionContent>
        </AccordionItem>
        <output aria-label="Expanded sections">{JSON.stringify(value)}</output>
      </Accordion>
    );
  },
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Details" }));
    await expect(canvas.getByRole("status", { name: "Expanded sections" })).toHaveTextContent('["details"]');
    await userEvent.click(canvas.getByRole("button", { name: "Details" }));
    await expect(canvas.getByRole("status", { name: "Expanded sections" })).toHaveTextContent("[]");
  },
};
export const DynamicContent: Story = {
  render: function Render(args) {
    const [hasMore, setHasMore] = useState(false);
    return (
      <Accordion {...args} defaultValue={["details"]}>
        <AccordionItem value="details">
          <AccordionTrigger>Details</AccordionTrigger>
          <AccordionContent>
            <Button onClick={() => setHasMore(true)}>Show more details</Button>
            {hasMore && (
              <p>
                Additional details.
                <br />
                Second line.
                <br />
                Third line.
                <br />
                Fourth line.
                <br />
                Fifth line.
              </p>
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    );
  },
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const panel = canvas.getByRole("region", { name: "Details" });
    const initialHeight = panel.getBoundingClientRect().height;
    await userEvent.click(canvas.getByRole("button", { name: "Show more details" }));
    await waitFor(() => expect(panel.getBoundingClientRect().height).toBeGreaterThan(initialHeight));
    const paragraph = panel.querySelector("p") as HTMLParagraphElement;
    await waitFor(() =>
      expect(paragraph.getBoundingClientRect().bottom).toBeLessThanOrEqual(panel.getBoundingClientRect().bottom),
    );
  },
};

export const RightToLeft: Story = {
  render: (args) => (
    <DirectionProvider direction="rtl">
      <Accordion {...args} dir="rtl" className="w-80">
        <AccordionItem value="details">
          <AccordionTrigger>
            <span>How do I install the package and configure its theme?</span>
          </AccordionTrigger>
          <AccordionContent>Import the theme and scan the package output.</AccordionContent>
        </AccordionItem>
        <AccordionItem value="density">
          <AccordionTrigger>Which densities are available?</AccordionTrigger>
          <AccordionContent>Compact and comfortable.</AccordionContent>
        </AccordionItem>
      </Accordion>
    </DirectionProvider>
  ),
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: "How do I install the package and configure its theme?" });
    const text = trigger.querySelector("span") as HTMLElement;
    const range = document.createRange();
    range.selectNodeContents(text);
    const lines = Array.from(range.getClientRects());
    await expect(lines.length).toBeGreaterThan(1);
    for (const top of new Set(lines.map((line) => line.top))) {
      const right = Math.max(...lines.filter((line) => line.top === top).map((line) => line.right));
      await expect(Math.abs(right - text.getBoundingClientRect().right)).toBeLessThan(1);
    }
    const icon = trigger.querySelector('[data-slot="accordion-trigger-icon"]') as SVGElement;
    await expect(icon.getBoundingClientRect().right).toBeLessThanOrEqual(text.getBoundingClientRect().left);
    await userEvent.click(trigger);
    await expect(await canvas.findByRole("region", { name: trigger.textContent ?? "" })).toBeVisible();
    await userEvent.tab();
    const density = canvas.getByRole("button", { name: "Which densities are available?" });
    const densityIcon = density.querySelector('[data-slot="accordion-trigger-icon"]') as SVGElement;
    await expect(densityIcon.getBoundingClientRect().left - density.getBoundingClientRect().left).toBeLessThan(2);
    await expect(density).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await expect(canvas.getByRole("region", { name: "Which densities are available?" })).toBeVisible();
  },
};

export const Borders: Story = {
  args: { defaultValue: ["install"] },
  render: (args) => (
    <Accordion {...args} className="w-80 border">
      <AccordionItem value="install" className="px-4">
        <AccordionTrigger>How do I install the package?</AccordionTrigger>
        <AccordionContent>Import the theme and scan the package output.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="density" className="px-4">
        <AccordionTrigger>Which densities are available?</AccordionTrigger>
        <AccordionContent>Compact and comfortable.</AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const install = canvas.getByRole("button", { name: "How do I install the package?" });
    const density = canvas.getByRole("button", { name: "Which densities are available?" });
    const root = install.closest('[data-slot="accordion"]') as HTMLElement;
    const first = install.closest('[data-slot="accordion-item"]') as HTMLElement;
    const last = density.closest('[data-slot="accordion-item"]') as HTMLElement;
    await expect(parseFloat(getComputedStyle(root).borderTopWidth)).toBeGreaterThan(0);
    await expect(parseFloat(getComputedStyle(first).borderBottomWidth)).toBeGreaterThan(0);
    await expect(parseFloat(getComputedStyle(last).borderBottomWidth)).toBe(0);
    await expect(install.getBoundingClientRect().left).toBeGreaterThan(root.getBoundingClientRect().left);
    await userEvent.click(density);
    await expect(install).toHaveAttribute("aria-expanded", "false");
    await expect(canvas.getByRole("region", { name: "Which densities are available?" })).toBeVisible();
    await waitFor(() => expect(first.getBoundingClientRect().bottom).toBeCloseTo(last.getBoundingClientRect().top, 1));
  },
};

export const InCard: Story = {
  args: { defaultValue: ["install"] },
  render: (args, context) => (
    <Card className="w-80">
      <CardHeader>
        <CardTitle>Package setup</CardTitle>
        <CardDescription>Common installation questions.</CardDescription>
      </CardHeader>
      <CardContent>{meta.render?.(args, context)}</CardContent>
    </Card>
  ),
  play: async (context) => {
    await expect(within(context.canvasElement).getByText("Common installation questions.")).toBeVisible();
    await Expanded.play?.(context);
    const canvas = within(context.canvasElement);
    await context.userEvent.click(canvas.getByRole("button", { name: "Which densities are available?" }));
    await expect(canvas.getByRole("region", { name: "Which densities are available?" })).toHaveTextContent(
      "Compact and comfortable.",
    );
  },
};
