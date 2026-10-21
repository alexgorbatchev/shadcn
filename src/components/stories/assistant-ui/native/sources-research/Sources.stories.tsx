import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { Source, SourceIcon, Sources } from "../../../../assistant-ui/native/Sources.js";
import { MessageMetadataFixture } from "../fixtures/metadata.js";

const meta: Meta<typeof Source> = {
  title: "@alexgorbatchev/shadcn/components/assistant-ui/native/sources-research/Sources",
  component: Source,
  tags: ["autodocs", "test"],
  args: { href: "https://example.com/reference", children: "Source reference" },
};
export default meta;
type Story = StoryObj<typeof meta>;
export const Outline: Story = {
  args: { variant: "outline" },
  play: async ({ canvasElement, userEvent }) => {
    const source = within(canvasElement).getByRole("link", { name: "Source reference" });
    await expect(source).toHaveAttribute("href", "https://example.com/reference");
    await expect(source).toHaveAttribute("rel", "noopener noreferrer");
    await userEvent.tab();
    await expect(source).toHaveFocus();
  },
};
export const Secondary: Story = { ...Outline, args: { variant: "secondary" } };
export const Muted: Story = { ...Outline, args: { variant: "muted" } };
export const Ghost: Story = { ...Outline, args: { variant: "ghost" } };
export const Info: Story = { ...Outline, args: { variant: "info" } };
export const Warning: Story = { ...Outline, args: { variant: "warning" } };
export const Success: Story = { ...Outline, args: { variant: "success" } };
export const Destructive: Story = { ...Outline, args: { variant: "destructive" } };
export const Document: Story = {
  render: () => (
    <MessageMetadataFixture
      messages={[
        {
          role: "assistant",
          content: [
            {
              type: "source",
              sourceType: "document",
              id: "manual",
              title: "Project manual",
              mediaType: "application/pdf",
            },
          ],
        },
      ]}
      components={{ Source: Sources }}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Project manual")).toBeVisible();
    await expect(canvas.queryByRole("link")).not.toBeInTheDocument();
  },
};
export const UnsafeUrl: Story = {
  render: () => (
    <MessageMetadataFixture
      messages={[
        {
          role: "assistant",
          content: [
            {
              type: "source",
              sourceType: "url",
              id: "untrusted",
              title: "Untrusted reference",
              url: "javascript:alert(1)",
            },
          ],
        },
      ]}
      components={{ Source: Sources }}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Untrusted reference")).toBeVisible();
    await expect(canvas.queryByRole("link")).not.toBeInTheDocument();
  },
};
export const IconFallback: Story = {
  render: () => (
    <Source href="https://example.com">
      <SourceIcon url="https://example.com" faviconUrl={() => "data:image/png;base64,invalid"} />
      Example reference
    </Source>
  ),
  play: async ({ canvasElement }) => {
    await expect(await within(canvasElement).findByText("E")).toBeVisible();
  },
};
