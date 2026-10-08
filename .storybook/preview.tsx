import type { Preview } from "@storybook/react-vite";
import { PreviewFrame } from "./PreviewFrame";
import { ThemedDocsContainer } from "./components/ThemedDocsContainer";
import "./preview.css";

const preview: Preview = {
  tags: ["autodocs", "!test"],
  initialGlobals: { theme: "dark", density: "comfortable" },
  globalTypes: {
    theme: {
      description: "Color scheme",
      toolbar: {
        title: "Theme",
        icon: "circlehollow",
        dynamicTitle: true,
        items: [
          { value: "dark", title: "Dark" },
          { value: "light", title: "Light" },
          { value: "system", title: "System" },
        ],
      },
    },
    density: {
      description: "Component density",
      toolbar: {
        title: "Density",
        icon: "grow",
        dynamicTitle: true,
        items: [
          { value: "compact", title: "Compact" },
          { value: "comfortable", title: "Comfortable" },
        ],
      },
    },
  },
  parameters: {
    docs: { container: ThemedDocsContainer },
    layout: "fullscreen",
    controls: { expanded: true },
    a11y: { test: "off" },
  },
  decorators: [
    (Story, context) => (
      <PreviewFrame
        theme={context.globals.theme === "light" ? "light" : context.globals.theme === "system" ? "system" : "dark"}
        density={context.globals.density === "compact" ? "compact" : "comfortable"}
      >
        <Story />
      </PreviewFrame>
    ),
  ],
};

export default preview;
