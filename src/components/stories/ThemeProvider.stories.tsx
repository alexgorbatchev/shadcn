import type { Meta, StoryObj } from "@storybook/react-vite";
import { ThemeProvider } from "../ThemeProvider";
import { ThemeControlsExample } from "./helpers";

const meta: Meta<typeof ThemeProvider> = {
  title: "shadcn-alexgorbatchev/components/ThemeProvider",
  component: ThemeProvider,
  tags: ["autodocs", "!test"],
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

export const Interactive: Story = {};
