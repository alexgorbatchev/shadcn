import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, waitFor, within } from "storybook/test";
import { AccountMenu } from "../../AccountMenu";
const meta: Meta<typeof AccountMenu> = {
  title: "@alexgorbatchev/shadcn/components/navigation/AccountMenu",
  component: AccountMenu,
  tags: ["autodocs", "test"],
  args: { name: "Alex", email: "alex@example.com", onAction: fn() },
};
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  play: async ({ canvasElement, userEvent, args }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    await userEvent.click(canvas.getByRole("button", { name: "Account menu for Alex" }));
    await userEvent.click(await page.findByRole("menuitem", { name: "Profile" }));
    await expect(args.onAction).toHaveBeenLastCalledWith("profile");
    await userEvent.click(canvas.getByRole("button", { name: "Account menu for Alex" }));
    await userEvent.click(await page.findByRole("menuitem", { name: "Settings" }));
    await expect(args.onAction).toHaveBeenLastCalledWith("settings");
    await userEvent.click(canvas.getByRole("button", { name: "Account menu for Alex" }));
    await userEvent.click(await page.findByRole("menuitem", { name: "Sign out" }));
    await expect(args.onAction).toHaveBeenLastCalledWith("sign-out");
  },
};
export const NameOnly: Story = {
  args: { email: undefined },
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Account menu for Alex" }));
    await waitFor(() =>
      expect(within(canvasElement.ownerDocument.body).getByRole("menuitem", { name: "Profile" })).toBeVisible(),
    );
  },
};
