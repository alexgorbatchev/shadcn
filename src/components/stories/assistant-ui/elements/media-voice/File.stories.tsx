import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, waitFor, within } from "storybook/test";

import audio from "../fixtures/sample.wav?url";
import video from "../fixtures/sample.webm?url";
import {
  File,
  FileDownload,
  FileIconDisplay,
  FileName,
  FileRoot,
  FileSize,
  FilePlayer,
} from "../../../../assistant-ui/elements/File.js";
const meta: Meta<typeof File> = {
  title: "@alexgorbatchev/shadcn/components/assistant-ui/elements/media-voice/File",
  component: File,
  tags: ["autodocs", "test"],
  args: { type: "file", data: "SGVsbG8=", mimeType: "text/plain", filename: "hello.txt", status: { type: "complete" } },
};
export const AudioAttachment: Story = {
  args: { data: new URL(audio, import.meta.url).href, mimeType: "audio/wav", filename: "voice.wav", sourceType: "url" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("voice.wav")).toBeVisible();
    await expect(canvas.getByRole("button", { name: "Play voice.wav" })).toBeEnabled();
    await expect(canvas.getByRole("link", { name: "Download voice.wav" })).toHaveAttribute(
      "href",
      new URL(audio, import.meta.url).href,
    );
  },
};
export const VideoAttachment: Story = {
  args: { data: new URL(video, import.meta.url).href, mimeType: "video/webm", filename: undefined, sourceType: "url" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const media = canvas.getByLabelText<HTMLVideoElement>("Video");
    await waitFor(() => expect(media.readyState).toBeGreaterThanOrEqual(1));
    await expect(media.controls).toBe(true);
    await expect(media.duration).toBeCloseTo(2);
    await expect(canvas.getByRole("link", { name: "Download file" })).toHaveAttribute("download", "download");
  },
};
export const UnnamedText: Story = {
  args: { filename: undefined },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Text file")).toBeVisible();
    await expect(canvas.getByRole("link", { name: "Download file" })).toHaveAttribute("download", "download");
  },
};
export const NonMediaPlayer: Story = {
  render: () => (
    <FileRoot>
      <FileIconDisplay>Attachment</FileIconDisplay>
      <FilePlayer data="YQ==" mimeType="text/plain" />
      <FilePlayer data="reference" mimeType="audio/wav" sourceType="id" />
    </FileRoot>
  ),
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText("Attachment")).toBeVisible();
    await expect(within(canvasElement).queryByRole("button")).not.toBeInTheDocument();
    await expect(canvasElement.querySelector("video, audio")).toBeNull();
  },
};
export default meta;
type Story = StoryObj<typeof meta>;
export const Base64: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("5 B")).toBeVisible();
    await expect(canvas.getByRole("link", { name: "Download hello.txt" })).toHaveAttribute(
      "href",
      "data:text/plain;base64,SGVsbG8=",
    );
    await expect(canvas.getByRole("link")).toHaveAttribute("download", "hello.txt");
  },
};
export const Url: Story = {
  args: {
    data: "https://example.com/report.pdf",
    mimeType: "application/pdf",
    sourceType: "url",
    filename: "report.pdf",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("link")).toHaveAttribute("target", "_blank");
    await expect(canvas.getByRole("link")).toHaveAttribute("rel", "noopener noreferrer");
    await expect(canvas.queryByText(/ B$/)).not.toBeInTheDocument();
  },
};
export const DataUri: Story = {
  args: { data: "data:text/plain,%FF%00a" },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText("3 B")).toBeVisible();
  },
};
export const Reference: Story = {
  args: { data: "file-123", sourceType: "id" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("hello.txt")).toBeVisible();
    await expect(canvas.queryByRole("link")).not.toBeInTheDocument();
  },
};
export const UnsafeSource: Story = {
  args: { data: "javascript:alert(1)" },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).queryByRole("link")).not.toBeInTheDocument();
  },
};
export const Parts: Story = {
  render: () => (
    <FileRoot variant="muted" size="sm">
      <FileIconDisplay mimeType="application/pdf" />
      <FileName />
      <FileSize bytes={1536} />
      <FileDownload data="YQ==" mimeType="text/plain">
        Save attachment
      </FileDownload>
    </FileRoot>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Unnamed file")).toBeVisible();
    await expect(canvas.getByText("1.5 KB")).toBeVisible();
    await expect(canvas.getByRole("link", { name: "Save attachment" })).toHaveAttribute("download", "download");
  },
};
