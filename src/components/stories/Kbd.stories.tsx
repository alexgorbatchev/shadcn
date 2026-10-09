import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import { Kbd, KbdGroup } from "../Kbd";
import { Button } from "../Button";
import { Tooltip, TooltipProvider, TooltipContent, TooltipTrigger } from "../Tooltip";
import { InputGroup, InputGroupAddon, InputGroupInput } from "../InputGroup";

const meta: Meta<typeof Kbd> = {
  title: "shadcn-alexgorbatchev/components/Kbd",
  component: Kbd,
  tags: ["autodocs", "test"],
  args: { children: "Esc" },
};
export default meta;
type Story = StoryObj<typeof meta>;
export const Single: Story = {
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText("Esc").tagName).toBe("KBD");
  },
};
export const Shortcut: Story = {
  render: () => (
    <KbdGroup aria-label="Command K">
      <Kbd>⌘</Kbd>
      <Kbd>K</Kbd>
    </KbdGroup>
  ),
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByLabelText("Command K")).toHaveTextContent("⌘K");
  },
};

const onAccept = fn();
export const InButton: Story = {
  render: () => (
    <Button variant="outline" onClick={onAccept}>
      Accept <Kbd data-icon="inline-end">⏎</Kbd>
    </Button>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole("button", { name: "Accept ⏎" });
    await expect(canvas.getByText("⏎").tagName).toBe("KBD");
    await userEvent.tab();
    await expect(button).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await expect(onAccept).toHaveBeenCalledOnce();
  },
};
export const InTooltip: Story = {
  render: () => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger render={<Button variant="outline" />} aria-label="Save changes">
          Save
        </TooltipTrigger>
        <TooltipContent>
          Save changes <Kbd>S</Kbd>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    await waitFor(() => expect(canvas.getByRole("button", { name: "Save changes" })).toHaveAttribute("type", "button"));
    await userEvent.tab();
    const key = await body.findByText("S");
    await waitFor(() => expect(key).toBeVisible());
    await expect(key.tagName).toBe("KBD");
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(body.queryByText("S")).not.toBeInTheDocument());
    await expect(canvas.getByRole("button", { name: "Save changes" })).toHaveFocus();
  },
};
export const InInputGroup: Story = {
  render: () => (
    <InputGroup>
      <InputGroupInput aria-label="Search" />
      <InputGroupAddon align="inline-end" aria-label="Search shortcut">
        <KbdGroup>
          <Kbd>⌘</Kbd>
          <Kbd>K</Kbd>
        </KbdGroup>
      </InputGroupAddon>
    </InputGroup>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = await canvas.findByRole("textbox", { name: "Search" });
    await userEvent.click(canvas.getByLabelText("Search shortcut"));
    await expect(input).toHaveFocus();
    await userEvent.type(input, "settings");
    await expect(input).toHaveValue("settings");
    await expect(canvas.getByText("K").getBoundingClientRect().right).toBeLessThanOrEqual(
      canvas.getByLabelText("Search shortcut").getBoundingClientRect().right,
    );
  },
};
export const RightToLeft: Story = {
  render: () => (
    <KbdGroup dir="rtl" aria-label="Command K">
      <Kbd>⌘</Kbd>
      <Kbd>K</Kbd>
    </KbdGroup>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("K").getBoundingClientRect().right).toBeLessThan(
      canvas.getByText("⌘").getBoundingClientRect().left,
    );
    await expect(canvas.getByText("K").tagName).toBe("KBD");
  },
};
