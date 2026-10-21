import { within } from "storybook/test";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, waitFor } from "storybook/test";
import { ShikiHighlighter } from "../../../assistant-ui/elements/ShikiHighlighter.js";
import { fixture_reviewLanguage, fixture_reviewLanguageLoader } from "./fixtures/highlighter.js";
const meta: Meta<typeof ShikiHighlighter> = {
  component: ShikiHighlighter,
  render: (args) => <ShikiHighlighter {...args} />,
  title: "shadcn-alexgorbatchev/assistant-ui/elements/ShikiHighlighter",
  tags: ["autodocs", "test"],
};
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  args: { code: "const ready = true;", language: "typescript", streaming: true },
  play: async ({ canvasElement }) => {
    const canvas = await within(canvasElement);
    await expect(canvas.getByTestId("ShikiHighlighter")).toHaveTextContent("const ready = true;");
  },
};
export const Highlighted: Story = {
  ...Default,
  args: { ...Default.args, streaming: false, highlightLines: [1] },
  play: async ({ canvasElement }) => {
    const canvas = await within(canvasElement);
    await waitFor(() => expect(canvas.getByRole("mark")).toHaveTextContent("const ready = true;"));
  },
};
export const LightTheme: Story = { ...Default, globals: { theme: "light" }, play: Default.play };
export const CompactLightHighlighted: Story = {
  ...Highlighted,
  globals: { theme: "light", density: "compact" },
  play: Highlighted.play,
};
export const DarkTheme: Story = { ...Default, globals: { theme: "dark" }, play: Default.play };
export const ConsumerPalette: Story = {
  args: { code: "const ready = true;", language: "typescript" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const foreground = getComputedStyle(canvasElement).color;
    canvasElement.style.setProperty("--primary", foreground);
    try {
      const keyword = await canvas.findByText("const", { selector: "span" });
      await waitFor(() => expect(getComputedStyle(keyword).color).toBe(foreground));
      await expect(canvas.getByTestId("ShikiHighlighter")).toHaveTextContent("const ready = true;");
    } finally {
      canvasElement.style.removeProperty("--primary");
    }
  },
};
export const AliasedLanguage: Story = {
  args: {
    code: "const first = true;\nconst second = false;",
    language: "review-ts",
    langAlias: { "review-ts": "typescript" },
    preloadLanguages: ["javascript"],
    highlightLines: [2],
    theme: { light: "github-light", dark: "github-dark" },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(() => expect(canvas.getByRole("mark")).toHaveTextContent("const second = false;"));
    await expect(canvas.getByTestId("ShikiHighlighter")).toHaveTextContent("const first = true;");
  },
};
export const CustomGrammar: Story = {
  args: {
    code: "READY review",
    language: "review-language",
    preloadLanguages: [fixture_reviewLanguage],
    highlightLines: [1],
  },
  play: async ({ canvasElement }) => {
    await waitFor(() => expect(within(canvasElement).getByRole("mark")).toHaveTextContent("READY review"));
  },
};
export const LazyGrammar: Story = {
  ...CustomGrammar,
  args: { ...CustomGrammar.args, preloadLanguages: [fixture_reviewLanguageLoader] },
  play: CustomGrammar.play,
};
export const Oniguruma: Story = {
  ...Highlighted,
  args: { ...Highlighted.args, engine: "oniguruma" },
  play: Highlighted.play,
};
export const PlainText: Story = {
  args: { code: "An unformatted result", language: "text" },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByTestId("ShikiHighlighter")).toHaveTextContent("An unformatted result");
  },
};
