import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { Button } from "../Button";
import { PageMessage } from "../PageMessage";

const meta: Meta<typeof PageMessage> = {
  title: "shadcn-alexgorbatchev/components/PageMessage",
  component: PageMessage,
  parameters: { layout: "fullscreen" },
  tags: ["autodocs", "test"],
};
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: "Unable to connect",
    description: "Open the application using its configured web address.",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const main = canvas.getByRole("main", { name: "Unable to connect" });
    await expect(canvas.getByRole("heading", { level: 1, name: "Unable to connect" })).toBeVisible();
    await expect(main).toHaveAccessibleDescription("Open the application using its configured web address.");
    const bounds = main.getBoundingClientRect();
    const content = main.firstElementChild!.getBoundingClientRect();
    await expect(bounds.height).toBeGreaterThanOrEqual(canvasElement.ownerDocument.defaultView!.innerHeight);
    await expect(Math.abs(content.x + content.width / 2 - (bounds.x + bounds.width / 2))).toBeLessThan(2);
    await expect(Math.abs(content.y + content.height / 2 - (bounds.y + bounds.height / 2))).toBeLessThan(2);
  },
};

const retry = fn();
export const WithAction: Story = {
  args: { ...Default.args, children: <Button onClick={retry}>Retry</Button> },
  play: async ({ canvasElement }) => {
    const button = within(canvasElement).getByRole("button", { name: "Retry" });
    button.focus();
    await userEvent.keyboard("{Enter}");
    await expect(retry).toHaveBeenCalledOnce();
  },
};

export const TitleOnly: Story = {
  args: { title: "Nothing here yet" },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole("main")).toHaveAccessibleName("Nothing here yet");
    await expect(within(canvasElement).queryByRole("button")).toBeNull();
  },
};
