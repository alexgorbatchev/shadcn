import type { Meta, StoryObj } from "@storybook/react-vite";
import { CircleAlertIcon, TriangleAlertIcon } from "lucide-react";
import { expect, fn, userEvent, within } from "storybook/test";
import { Alert, AlertAction, AlertDescription, AlertTitle } from "../../Alert";
import { Button } from "../../Button";

const meta: Meta<typeof Alert> = {
  title: "@alexgorbatchev/shadcn/components/feedback/Alert",
  component: Alert,
  tags: ["autodocs", "test"],
  argTypes: { variant: { control: "select", options: ["default", "destructive"] } },
  render: (args) => (
    <Alert {...args}>
      <CircleAlertIcon />
      <AlertTitle>Changes saved</AlertTitle>
      <AlertDescription>Your project is up to date.</AlertDescription>
    </Alert>
  ),
};
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole("alert")).toHaveTextContent(
      "Changes savedYour project is up to date.",
    );
  },
};
export const Destructive: Story = { ...Default, args: { variant: "destructive" } };
export const Compact: Story = { ...Default, args: { density: "compact" } };
const onUndo = fn();
export const WithAction: Story = {
  render: (args) => (
    <Alert {...args}>
      <AlertTitle>Message archived</AlertTitle>
      <AlertAction>
        <Button size="xs" onClick={onUndo}>
          Undo
        </Button>
      </AlertAction>
    </Alert>
  ),
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole("button", { name: "Undo" }));
    await expect(onUndo).toHaveBeenCalledOnce();
  },
};

export const CustomColors: Story = {
  render: (args) => (
    <Alert {...args} className="border-warning/30 bg-warning/10 text-warning">
      <TriangleAlertIcon aria-hidden="true" />
      <AlertTitle>Subscription expires soon</AlertTitle>
      <AlertDescription className="text-warning">Renew your subscription to keep access.</AlertDescription>
    </Alert>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const title = canvas.getByText("Subscription expires soon");
    const description = canvas.getByText("Renew your subscription to keep access.");
    await expect(title).toBeVisible();
    await expect(description).toBeVisible();
    await expect(getComputedStyle(title).color).toBe(getComputedStyle(description).color);
    await expect(canvas.getByRole("alert").querySelector("svg")).toHaveAttribute("aria-hidden", "true");
  },
};

export const RightToLeft: Story = {
  args: { dir: "rtl" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const title = canvas.getByText("Changes saved");
    const icon = canvas.getByRole("alert").querySelector("svg") as SVGElement;
    const range = canvasElement.ownerDocument.createRange();
    range.selectNodeContents(title);
    await expect(icon.getBoundingClientRect().left).toBeGreaterThan(title.getBoundingClientRect().right);
    await expect(range.getBoundingClientRect().right).toBeCloseTo(title.getBoundingClientRect().right, 0);
  },
};
export const RightToLeftAction: Story = {
  ...WithAction,
  args: { dir: "rtl" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const alert = canvas.getByRole("alert");
    const button = canvas.getByRole("button", { name: "Undo" });
    const title = canvas.getByText("Message archived");
    await expect(button.getBoundingClientRect().right).toBeLessThan(title.getBoundingClientRect().left);
    await expect(button.getBoundingClientRect().left - alert.getBoundingClientRect().left).toBeLessThan(
      alert.getBoundingClientRect().right - button.getBoundingClientRect().right,
    );
    await userEvent.tab();
    await expect(button).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await expect(onUndo).toHaveBeenCalledOnce();
  },
};
