import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { TaskGroup } from "../../../../assistant-ui/native/TaskGroup.js";
import { NativeTaskFixture } from "../fixtures/nz/NativeTaskFixture.js";
const meta: Meta<typeof TaskGroup> = {
  component: TaskGroup,
  title: "@alexgorbatchev/shadcn/components/assistant-ui/native/agents-tasks/TaskGroup",
  tags: ["autodocs", "test"],
  render: () => <NativeTaskFixture group />,
};
export default meta;
type Story = StoryObj<typeof meta>;
export const Paginated: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(() => expect(canvas.getByText("6 tasks")).toBeVisible());
    await expect(canvas.queryByRole("button", { name: /Inspect service 5/ })).not.toBeInTheDocument();
    await userEvent.click(canvas.getByRole("button", { name: "Show 2 more" }));
    await waitFor(() => expect(canvas.getByRole("button", { name: /Inspect service 6/ })).toBeVisible());
    await expect(canvas.queryByRole("button", { name: "Show 2 more" })).not.toBeInTheDocument();
  },
};
export const CompactDark: Story = {
  ...Paginated,
  globals: { theme: "dark", density: "compact" },
  play: Paginated.play,
};
export const ComfortableLight: Story = {
  ...Paginated,
  globals: { theme: "light", density: "comfortable" },
  play: Paginated.play,
};
export const Running: Story = {
  render: () => <NativeTaskFixture group state="running" count={2} />,
  play: async ({ canvasElement }) => {
    await waitFor(() => expect(within(canvasElement).getByText("2 tasks · 2 running")).toBeVisible());
  },
};
export const Waiting: Story = {
  render: () => <NativeTaskFixture group state="waiting" count={2} />,
  play: async ({ canvasElement }) => {
    await waitFor(() => expect(within(canvasElement).getByText("2 tasks · 2 waiting")).toBeVisible());
  },
};
export const Failed: Story = {
  render: () => <NativeTaskFixture group state="failed" count={2} />,
  play: async ({ canvasElement }) => {
    await waitFor(() => expect(within(canvasElement).getByText("2 tasks · 2 failed")).toBeVisible());
  },
};
export const SingleTask: Story = {
  render: () => <NativeTaskFixture group count={1} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByText("1 tasks")).not.toBeInTheDocument();
    await waitFor(() => expect(canvas.getByRole("button", { name: /Inspect service 1/ })).toBeVisible());
  },
};
