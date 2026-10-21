import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { ThemeProvider } from "../../ThemeProvider";
import { ThemeControlsExample } from "../helpers";
import { useState } from "react";
import type { ThemeMode } from "../../../theme/types";

const meta: Meta<typeof ThemeProvider> = {
  title: "@alexgorbatchev/shadcn/components/providers/ThemeProvider",
  component: ThemeProvider,
  tags: ["autodocs", "test"],
  globals: { theme: "system" },
  parameters: {
    controls: { disable: true },
    docs: {
      story: { inline: false, iframeHeight: 220 },
      description: {
        component:
          "The preview decorator owns one document-wide ThemeProvider. These controls change its persisted preference. The theme toolbar can force a palette on any other story.",
      },
    },
  },
  render: () => <ThemeControlsExample />,
};
export default meta;
type Story = StoryObj<typeof meta>;

export const Interactive: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const root = canvasElement.ownerDocument.documentElement;
    const status = canvas.getByRole("status");
    await userEvent.click(canvas.getByRole("button", { name: "Light" }));
    await waitFor(() => expect(status).toHaveTextContent("Preference: light. Resolved palette: light."));
    await expect(root).toHaveAttribute("data-theme", "light");
    await expect(root.style.colorScheme).toBe("light");
    const lightBackground = getComputedStyle(canvasElement.ownerDocument.body).backgroundColor;
    await expect(localStorage.getItem("shadcn-alexgorbatchev-preview")).toBe(JSON.stringify("light"));
    await userEvent.click(canvas.getByRole("button", { name: "Dark" }));
    await waitFor(() => expect(status).toHaveTextContent("Preference: dark. Resolved palette: dark."));
    await expect(root).toHaveAttribute("data-theme", "dark");
    await expect(root.style.colorScheme).toBe("dark");
    await expect(getComputedStyle(canvasElement.ownerDocument.body).backgroundColor).not.toBe(lightBackground);
    await expect(localStorage.getItem("shadcn-alexgorbatchev-preview")).toBe(JSON.stringify("dark"));
    await userEvent.click(canvas.getByRole("button", { name: "System" }));
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    await waitFor(() => expect(root.dataset.theme === "dark").toBe(media.matches));
    await expect(status).toHaveTextContent("Preference: system. Resolved palette: " + root.dataset.theme + ".");
    await expect(root.style.colorScheme).toBe(root.dataset.theme);
    await expect(localStorage.getItem("shadcn-alexgorbatchev-preview")).toBe(JSON.stringify("system"));
  },
};
export const ForcedDark: Story = {
  globals: { theme: "dark" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement),
      root = canvasElement.ownerDocument.documentElement;
    await userEvent.click(canvas.getByRole("button", { name: "Light" }));
    await expect(canvas.getByRole("status")).toHaveTextContent("Preference: dark. Resolved palette: dark.");
    await expect(root).toHaveAttribute("data-theme", "dark");
    await expect(root.style.colorScheme).toBe("dark");
    await expect(localStorage.getItem("shadcn-alexgorbatchev-preview")).toBe(JSON.stringify("light"));
    await userEvent.click(canvas.getByRole("button", { name: "System" }));
  },
};
export const ForcedLight: Story = {
  globals: { theme: "light" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement),
      root = canvasElement.ownerDocument.documentElement;
    await userEvent.click(canvas.getByRole("button", { name: "Dark" }));
    await expect(canvas.getByRole("status")).toHaveTextContent("Preference: light. Resolved palette: light.");
    await expect(root).toHaveAttribute("data-theme", "light");
    await expect(root.style.colorScheme).toBe("light");
    await expect(localStorage.getItem("shadcn-alexgorbatchev-preview")).toBe(JSON.stringify("dark"));
    await userEvent.click(canvas.getByRole("button", { name: "System" }));
  },
};

export const Controlled: Story = {
  render: function Example() {
    const [theme, setTheme] = useState<ThemeMode>("dark");
    return (
      <ThemeProvider controlledTheme={{ theme, setTheme }} storageKey="controlled-theme">
        <ThemeControlsExample />
      </ThemeProvider>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("status")).toHaveTextContent("Preference: dark. Resolved palette: dark.");
    await userEvent.click(canvas.getByRole("button", { name: "Light" }));
    await expect(canvas.getByRole("status")).toHaveTextContent("Preference: light. Resolved palette: light.");
    await expect(canvasElement.ownerDocument.documentElement).toHaveAttribute("data-theme", "light");
    await expect(localStorage.getItem("controlled-theme")).toBeNull();
    await userEvent.click(canvas.getByRole("button", { name: "System" }));
    await expect(canvas.getByRole("status")).toHaveTextContent(
      "Preference: system. Resolved palette: " + canvasElement.ownerDocument.documentElement.dataset.theme + ".",
    );
  },
};
