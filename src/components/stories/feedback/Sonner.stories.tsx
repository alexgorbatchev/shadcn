import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { useState } from "react";
import { Button } from "../../Button";
import { Sonner, toast } from "../../sonner/Sonner";
import { DirectionProvider } from "../../DirectionProvider";
import { Item, ItemContent, ItemTitle, ItemDescription, ItemActions } from "../../Item";

const meta: Meta<typeof Sonner> = {
  title: "@alexgorbatchev/shadcn/components/feedback/Sonner",
  component: Sonner,
  tags: ["autodocs", "test"],
  args: { id: "sonner-story", closeButton: true, duration: Infinity },
  render: function Render(args) {
    const [isUndone, setUndone] = useState(false);
    return (
      <>
        <Sonner {...args} />
        <Button
          onClick={() =>
            toast.success("Saved", {
              toasterId: args.id,
              description: "Your changes are saved.",
              action: { label: "Undo", onClick: () => setUndone(true) },
            })
          }
        >
          Save changes
        </Button>
        <output aria-label="Result">{isUndone ? "Undone" : "Saved"}</output>
      </>
    );
  },
};
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Save changes" }));
    await waitFor(() => expect(canvas.getByText("Your changes are saved.")).toBeVisible());
    await userEvent.click(canvas.getByRole("button", { name: "Undo" }));
    await expect(canvas.getByLabelText("Result")).toHaveTextContent("Undone");
    await waitFor(() => expect(canvas.queryByText("Your changes are saved.")).toBeNull());
  },
};
export const Compact: Story = {
  ...Default,
  args: { density: "compact" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Save changes" }));
    await waitFor(() => expect(canvas.getByRole("button", { name: "Undo" })).toBeVisible());
    await expect(canvas.getByRole("button", { name: "Undo" }).getBoundingClientRect().height).toBe(18);
    await userEvent.click(canvas.getByRole("button", { name: "Close toast" }));
    await waitFor(() => expect(canvas.queryByText("Your changes are saved.")).toBeNull());
  },
};
export const Variants: Story = {
  render: (args) => (
    <>
      <Sonner {...args} />
      <Button
        onClick={() => {
          toast.info("Information", { toasterId: args.id });
          toast.warning("Warning", { toasterId: args.id });
          toast.error("Error", { toasterId: args.id });
        }}
      >
        Create notifications
      </Button>
      <Button onClick={() => toast.dismiss()}>Dismiss notifications</Button>
    </>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Create notifications" }));
    await waitFor(() => expect(canvas.getByText("Information")).toBeVisible());
    await expect(canvas.getByText("Warning")).toBeVisible();
    await expect(canvas.getByText("Error")).toBeVisible();
    const first = canvas.getByText("Information").closest("[data-sonner-toast]");
    const last = canvas.getByText("Error").closest("[data-sonner-toast]");
    await expect(first?.getBoundingClientRect().height).toBe(last?.getBoundingClientRect().height);
    await userEvent.click(canvas.getByRole("button", { name: "Dismiss notifications" }));
    await waitFor(() => expect(canvas.queryByText("Error")).toBeNull());
  },
};

export const PromiseSuccess: Story = {
  render: function Render(args) {
    const [upload] = useState(() => Promise.withResolvers<string>());
    return (
      <>
        <Sonner {...args} />
        <Button
          onClick={() =>
            toast.promise(upload.promise, {
              toasterId: args.id,
              loading: "Uploading",
              success: (name) => `Uploaded ${name}`,
              error: "Upload failed",
            })
          }
        >
          Start upload
        </Button>
        <Button onClick={() => upload.resolve("report.csv")}>Complete upload</Button>
        <Button onClick={() => upload.reject(new Error("Upload failed"))}>Fail upload</Button>
      </>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Start upload" }));
    await waitFor(() => expect(canvas.getByText("Uploading")).toBeVisible());
    await userEvent.click(canvas.getByRole("button", { name: "Complete upload" }));
    await expect(await canvas.findByText("Uploaded report.csv")).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Close toast" }));
    await waitFor(() => expect(canvas.queryByText("Uploaded report.csv")).toBeNull());
  },
};

export const PromiseError: Story = {
  ...PromiseSuccess,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Start upload" }));
    await waitFor(() => expect(canvas.getByText("Uploading")).toBeVisible());
    await expect(canvas.queryByRole("button", { name: "Close toast" })).toBeNull();
    await userEvent.click(canvas.getByRole("button", { name: "Fail upload" }));
    await waitFor(() => expect(canvas.getByText("Upload failed")).toBeVisible());
    await userEvent.click(canvas.getByRole("button", { name: "Close toast" }));
    await waitFor(() => expect(canvas.queryByText("Upload failed")).toBeNull());
  },
};

export const Cancel: Story = {
  render: function Render(args) {
    const [isCancelled, setCancelled] = useState(false);
    return (
      <>
        <Sonner {...args} />
        <Button
          onClick={() =>
            toast("Delete report?", {
              toasterId: args.id,
              cancel: { label: "Keep report", onClick: () => setCancelled(true) },
            })
          }
        >
          Request deletion
        </Button>
        <output aria-label="Deletion result">{isCancelled ? "Report kept" : "Awaiting decision"}</output>
      </>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Request deletion" }));
    await userEvent.click(await canvas.findByRole("button", { name: "Keep report" }));
    await expect(canvas.getByLabelText("Deletion result")).toHaveTextContent("Report kept");
    await waitFor(() => expect(canvas.queryByText("Delete report?")).toBeNull());
  },
};

export const UpdateInPlace: Story = {
  render: function Render(args) {
    const [uploadId, setUploadId] = useState<string | number>();
    return (
      <>
        <Sonner {...args} />
        <Button onClick={() => setUploadId(toast.loading("Uploading report", { toasterId: args.id }))}>
          Start upload
        </Button>
        <Button
          disabled={uploadId === undefined}
          onClick={() =>
            toast.success("Uploaded report.csv", {
              id: uploadId,
              toasterId: args.id,
            })
          }
        >
          Complete upload
        </Button>
      </>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("button", { name: "Complete upload" })).toBeDisabled();
    await userEvent.click(canvas.getByRole("button", { name: "Start upload" }));
    const loading = await canvas.findByText("Uploading report");
    await waitFor(() => expect(loading).toBeVisible());
    const notification = loading.closest("[data-sonner-toast]");
    await userEvent.click(canvas.getByRole("button", { name: "Complete upload" }));
    const completed = await canvas.findByText("Uploaded report.csv");
    await waitFor(() => expect(completed).toBeVisible());
    await expect(completed.closest("[data-sonner-toast]")).toBe(notification);
    await expect(canvas.queryByText("Uploading report")).toBeNull();
    await userEvent.click(canvas.getByRole("button", { name: "Close toast" }));
    await waitFor(() => expect(canvas.queryByText("Uploaded report.csv")).toBeNull());
  },
};

export const RightToLeft: Story = {
  ...Default,
  args: { dir: "rtl", toastOptions: { classNames: { title: "font-semibold" } } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Save changes" }));
    const description = await canvas.findByText("Your changes are saved.");
    await expect(getComputedStyle(description).direction).toBe("rtl");
    await userEvent.click(canvas.getByRole("button", { name: "Close toast" }));
    await waitFor(() => expect(canvas.queryByText("Your changes are saved.")).toBeNull());
  },
};

export const InheritedDirection: Story = {
  ...RightToLeft,
  args: { dir: undefined },
  decorators: [
    (StoryComponent) => (
      <DirectionProvider direction="rtl">
        <StoryComponent />
      </DirectionProvider>
    ),
  ],
};

export const CollapsedStack: Story = {
  args: { expand: false },
  render: (args) => (
    <>
      <Sonner {...args} />
      <Button
        onClick={() => {
          toast("First notification", { toasterId: args.id });
          toast("Second notification", { toasterId: args.id });
          toast("Latest notification", { toasterId: args.id });
        }}
      >
        Create stack
      </Button>
      <Button onClick={() => toast.dismiss()}>Dismiss stack</Button>
    </>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Create stack" }));
    const first = await canvas.findByText("First notification");
    const latest = await canvas.findByText("Latest notification");
    const firstToast = first.closest<HTMLElement>("[data-sonner-toast]");
    const latestToast = latest.closest<HTMLElement>("[data-sonner-toast]");
    await waitFor(() => expect(getComputedStyle(first.parentElement!).opacity).toBe("0"));
    await waitFor(() =>
      expect(firstToast?.getBoundingClientRect().width).toBe(latestToast?.getBoundingClientRect().width),
    );
    await userEvent.hover(latest);
    await waitFor(() => expect(getComputedStyle(first.parentElement!).opacity).toBe("1"));
    await waitFor(() =>
      expect(firstToast?.getBoundingClientRect().bottom).toBeLessThanOrEqual(
        latestToast?.getBoundingClientRect().top ?? 0,
      ),
    );
    await userEvent.unhover(latest);
    await waitFor(() => expect(getComputedStyle(first.parentElement!).opacity).toBe("0"));
    await userEvent.click(canvas.getByRole("button", { name: "Dismiss stack" }));
    await waitFor(() => expect(canvas.queryByText("Latest notification")).toBeNull());
  },
};

export const AutoDismiss: Story = {
  args: { duration: 1000 },
  render: function Render(args) {
    const [autoClosedId, setAutoClosedId] = useState<string | number>();
    const [dismissedId, setDismissedId] = useState<string | number>();
    return (
      <>
        <Sonner {...args} />
        <Button
          onClick={() =>
            toast("Callback notification", {
              id: "callback-notification",
              toasterId: args.id,
              onAutoClose: (notification) => setAutoClosedId(notification.id),
              onDismiss: (notification) => setDismissedId(notification.id),
            })
          }
        >
          Create notification
        </Button>
        <output aria-label="Automatic close result">{autoClosedId ?? "Not closed automatically"}</output>
        <output aria-label="Dismiss result">{dismissedId ?? "Not dismissed"}</output>
      </>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Create notification" }));
    await waitFor(() => expect(canvas.getByText("Callback notification")).toBeVisible());
    await waitFor(
      () => expect(canvas.getByLabelText("Automatic close result")).toHaveTextContent("callback-notification"),
      { timeout: 3000 },
    );
    await expect(canvas.getByLabelText("Dismiss result")).toHaveTextContent("Not dismissed");
    await waitFor(() => expect(canvas.queryByText("Callback notification")).toBeNull());
  },
};

export const ManualDismiss: Story = {
  ...AutoDismiss,
  args: { duration: Infinity },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Create notification" }));
    await userEvent.click(await canvas.findByRole("button", { name: "Close toast" }));
    await expect(canvas.getByLabelText("Dismiss result")).toHaveTextContent("callback-notification");
    await expect(canvas.getByLabelText("Automatic close result")).toHaveTextContent("Not closed automatically");
    await waitFor(() => expect(canvas.queryByText("Callback notification")).toBeNull());
  },
};

export const CustomContent: Story = {
  render: function Render(args) {
    const [isReportOpen, setReportOpen] = useState(false);
    return (
      <>
        <Sonner {...args} />
        <Button
          onClick={() =>
            toast.custom(
              (id) => (
                <Item size="xs">
                  <ItemContent>
                    <ItemTitle>Export ready</ItemTitle>
                    <ItemDescription>report.csv</ItemDescription>
                  </ItemContent>
                  <ItemActions>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setReportOpen(true);
                        toast.dismiss(id);
                      }}
                    >
                      Open report
                    </Button>
                  </ItemActions>
                </Item>
              ),
              { toasterId: args.id },
            )
          }
        >
          Export report
        </Button>
        <output aria-label="Report result">{isReportOpen ? "Report opened" : "Report closed"}</output>
      </>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Export report" }));
    await waitFor(() => expect(canvas.getByText("Export ready")).toBeVisible());
    await expect(canvas.getByText("report.csv")).toBeVisible();
    await expect(canvas.queryByRole("button", { name: "Close toast" })).toBeNull();
    await userEvent.click(canvas.getByRole("button", { name: "Open report" }));
    await expect(canvas.getByLabelText("Report result")).toHaveTextContent("Report opened");
    await waitFor(() => expect(canvas.queryByText("Export ready")).toBeNull());
  },
};

export const PauseOnHover: Story = {
  render: function Render(args) {
    const [isUploadClosed, setUploadClosed] = useState(false);
    const [isBackgroundClosed, setBackgroundClosed] = useState(false);
    const uploadHost = `${args.id}-uploads`;
    const backgroundHost = `${args.id}-background`;
    return (
      <>
        <Sonner {...args} id={uploadHost} position="bottom-right" containerAriaLabel="Upload notifications" />
        <Sonner {...args} id={backgroundHost} position="top-left" containerAriaLabel="Background notifications" />
        <Button
          onClick={() => {
            toast("Upload saved", { toasterId: uploadHost, duration: 500, onAutoClose: () => setUploadClosed(true) });
            toast("Background job complete", {
              toasterId: backgroundHost,
              duration: 1000,
              onAutoClose: () => setBackgroundClosed(true),
            });
          }}
        >
          Create notifications
        </Button>
        <output aria-label="Upload close result">{isUploadClosed ? "Upload closed" : "Upload open"}</output>
        <output aria-label="Background close result">
          {isBackgroundClosed ? "Background closed" : "Background open"}
        </output>
      </>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Create notifications" }));
    const upload = await canvas.findByText("Upload saved");
    await userEvent.hover(upload);
    await waitFor(
      () => expect(canvas.getByLabelText("Background close result")).toHaveTextContent("Background closed"),
      { timeout: 3000 },
    );
    await expect(canvas.getByLabelText("Upload close result")).toHaveTextContent("Upload open");
    await expect(upload).toBeVisible();
    await waitFor(() => expect(canvas.queryByText("Background job complete")).toBeNull());
    await userEvent.unhover(upload);
    await waitFor(() => expect(canvas.getByLabelText("Upload close result")).toHaveTextContent("Upload closed"), {
      timeout: 3000,
    });
    await waitFor(() => expect(canvas.queryByText("Upload saved")).toBeNull());
  },
};
