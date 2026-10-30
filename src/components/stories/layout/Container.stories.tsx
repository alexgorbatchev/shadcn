import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, within } from "storybook/test";
import { AuthForm } from "../../AuthForm";
import { Container } from "../../Container";
import { Stack } from "../../Stack";
import { Text } from "../../Text";

const meta: Meta<typeof Container> = {
  title: "@alexgorbatchev/shadcn/components/layout/Container",
  component: Container,
  tags: ["autodocs", "test"],
  parameters: {
    docs: {
      description: {
        component:
          'Container centers a column with a maximum width: xs 20rem, sm 24rem, md 42rem, lg 64rem (default), xl 80rem, or full. `padding` uses the density-aware spacing tokens. For a centered single-column page such as sign-in, wrap it in a `Stack` with `height="min-viewport"`, `align="center"`, and `justify="center"`, and render the page landmark with `render={<main />}`.',
      },
    },
  },
  args: { width: "md", padding: "panel" },
  argTypes: {
    width: { control: "select", options: ["xs", "sm", "md", "lg", "xl", "full"] },
    padding: { control: "select", options: ["none", "control", "panel-sm", "panel", "field", "section"] },
  },
  render: (args) => (
    <Container {...args} render={<article aria-label="Article" />}>
      <Text>Plans, notes, and decisions stay in one place.</Text>
    </Container>
  ),
};
export default meta;
type Story = StoryObj<typeof Container>;

export const Centered: Story = {
  decorators: [
    (Story) => (
      <div className="w-[900px]">
        <Story />
      </div>
    ),
  ],
  play: async ({ canvasElement }) => {
    const article = within(canvasElement).getByRole("article", { name: "Article" });
    const bounds = article.getBoundingClientRect();
    const parent = article.parentElement!.getBoundingClientRect();
    await expect(bounds.width).toBeCloseTo(672, 0);
    await expect(bounds.left - parent.left).toBeCloseTo(parent.right - bounds.right, 0);
  },
};

export const NarrowParent: Story = {
  decorators: [
    (Story) => (
      <div className="w-60">
        <Story />
      </div>
    ),
  ],
  play: async ({ canvasElement }) => {
    const article = within(canvasElement).getByRole("article");
    await expect(article.getBoundingClientRect().width).toBeCloseTo(240, 0);
  },
};

export const SignInPage: Story = {
  args: { width: "sm", padding: "none" },
  parameters: { layout: "fullscreen" },
  render: (args) => (
    <Stack
      height="min-viewport"
      align="center"
      justify="center"
      padding="panel"
      render={<main aria-label="Sign in page" />}
    >
      <Container {...args}>
        <AuthForm onSubmit={fn()} />
      </Container>
    </Stack>
  ),
  play: async ({ canvasElement }) => {
    const main = within(canvasElement).getByRole("main", { name: "Sign in page" });
    const form = within(main).getByRole("form", { name: "Sign in" });
    const page = main.getBoundingClientRect();
    const card = form.closest("[data-slot=container]")!.getBoundingClientRect();
    await expect(card.width).toBeLessThanOrEqual(384);
    await expect(card.left - page.left).toBeCloseTo(page.right - card.right, 0);
    await expect(card.top - page.top).toBeCloseTo(page.bottom - card.bottom, 0);
    await expect(page.height).toBeGreaterThanOrEqual(canvasElement.ownerDocument.defaultView!.innerHeight - 1);
  },
};

export const DefaultWidth: Story = {
  args: { width: undefined, padding: undefined },
  decorators: [
    (Story) => (
      <div className="w-[1200px]">
        <Story />
      </div>
    ),
  ],
  play: async ({ canvasElement }) => {
    const article = within(canvasElement).getByRole("article");
    await expect(article.getBoundingClientRect().width).toBeCloseTo(1024, 0);
    await expect(
      within(article)
        .getByText(/Plans, notes/)
        .getBoundingClientRect().left,
    ).toBeCloseTo(article.getBoundingClientRect().left, 0);
  },
};
