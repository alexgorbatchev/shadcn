import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ComponentProps } from "react";
import { useState } from "react";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import { Button } from "../../Button";
import { DirectionProvider } from "../../DirectionProvider";
import {
  Toast,
  ToastContent,
  ToastTitle,
  ToastDescription,
  ToastAction,
  ToastClose,
  ToastPortal,
  ToastProvider,
  ToastToaster,
  ToastViewport,
  createToastManager,
} from "../../Toast";
import { useToastManager } from "../../../hooks/useToastManager";

const meta: Meta<typeof Toast> = {
  title: "@alexgorbatchev/shadcn/components/feedback/Toast",
  component: Toast,
  tags: ["autodocs", "test"],
};
export default meta;
type Story = StoryObj<typeof meta>;

export const InheritedDirection: Story = {
  render: () => (
    <DirectionProvider direction="rtl">
      <ToastToaster timeout={0}>
        <ToastButton />
      </ToastToaster>
    </DirectionProvider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(canvas.getByRole("button", { name: "Create toast" }));
    const title = await body.findByRole("heading", { name: "Saved" });
    await userEvent.keyboard("{F6}");
    const close = body.getByRole("button", { name: "Close toast" });
    await expect(getComputedStyle(title).direction).toBe("rtl");
    await expect(title.getBoundingClientRect().left).toBeGreaterThan(close.getBoundingClientRect().right);
    await userEvent.click(close);
    await waitFor(() => expect(body.queryByRole("heading", { name: "Saved" })).toBeNull());
  },
};

export const DirectionOverride: Story = {
  render: function Render() {
    const [manager] = useState(() => createToastManager());
    return (
      <DirectionProvider direction="rtl">
        <ToastProvider toastManager={manager} timeout={0}>
          <Button onClick={() => manager.add({ title: "Explicit direction" })}>Create toast</Button>
          <ToastPortal>
            <ToastViewport dir="ltr">
              <CallbackList />
            </ToastViewport>
          </ToastPortal>
        </ToastProvider>
      </DirectionProvider>
    );
  },
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(within(canvasElement).getByRole("button", { name: "Create toast" }));
    const title = await body.findByRole("heading", { name: "Explicit direction" });
    await expect(getComputedStyle(title).direction).toBe("ltr");
    await userEvent.keyboard("{F6}");
    await userEvent.click(body.getByRole("button", { name: "Close toast" }));
    await waitFor(() => expect(body.queryByRole("heading", { name: "Explicit direction" })).toBeNull());
  },
};

export const Default: Story = {
  render: () => (
    <ToastToaster timeout={0}>
      <ToastButton />
    </ToastToaster>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(canvas.getByRole("button", { name: "Create toast" }));
    await waitFor(() => expect(body.getByRole("heading", { name: "Saved" })).toBeVisible());
    await expect(body.getByText("Your changes are saved.")).toBeVisible();
    await userEvent.keyboard("{F6}");
    await expect(body.getByRole("region", { name: "Notifications" })).toHaveFocus();
    await userEvent.click(body.getByRole("button", { name: "Close toast" }));
    await waitFor(() => expect(body.queryByRole("heading", { name: "Saved" })).toBeNull());
  },
};

export const Types: Story = {
  render: function Render() {
    const [manager] = useState(() => createToastManager());
    return (
      <ToastToaster toastManager={manager} timeout={0}>
        <div className="flex flex-wrap gap-control-gap">
          {["Default", "Success", "Info", "Warning", "Error", "Loading"].map((label) => (
            <Button
              key={label}
              variant="outline"
              onClick={() =>
                manager.add({
                  title: `${label} notification`,
                  type: label === "Default" ? undefined : label.toLowerCase(),
                })
              }
            >
              {label}
            </Button>
          ))}
        </div>
      </ToastToaster>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    for (const [label, iconCount] of [
      ["Default", 0],
      ["Success", 1],
      ["Info", 1],
      ["Warning", 1],
      ["Error", 1],
      ["Loading", 1],
    ] as const) {
      await userEvent.click(canvas.getByRole("button", { name: label }));
      const title = await body.findByRole("heading", { name: `${label} notification` });
      const notification = title.closest<HTMLElement>('[data-slot="toast"]')!;
      await expect(notification.querySelectorAll('[data-slot="toast-icon"] svg')).toHaveLength(iconCount);
      await userEvent.keyboard("{F6}");
      await userEvent.click(within(notification).getByRole("button", { name: "Close toast" }));
      await waitFor(() => expect(title).not.toBeInTheDocument());
    }
  },
};

export const UpdateInPlace: Story = {
  render: function Render() {
    const [manager] = useState(() => createToastManager());
    const [id, setId] = useState<string>();
    return (
      <ToastToaster toastManager={manager} timeout={0}>
        <div className="flex gap-control-gap">
          <Button
            onClick={() => setId(manager.add({ id: "export-progress", title: "Preparing export", type: "loading" }))}
          >
            Start export
          </Button>
          <Button
            disabled={!id}
            onClick={() =>
              id &&
              manager.update(id, (previous) => ({
                title: "Export ready",
                description: `${previous.title}: report.csv`,
                type: "success",
              }))
            }
          >
            Complete export
          </Button>
          <Button
            disabled={!id}
            onClick={() => manager.add({ id, title: "Export downloaded", description: "report.csv", type: "info" })}
          >
            Download export
          </Button>
        </div>
      </ToastToaster>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    await expect(canvas.getByRole("button", { name: "Complete export" })).toBeDisabled();
    await userEvent.click(canvas.getByRole("button", { name: "Start export" }));
    const original = (await body.findByRole("heading", { name: "Preparing export" })).closest('[data-slot="toast"]');
    await userEvent.click(canvas.getByRole("button", { name: "Complete export" }));
    await expect((await body.findByRole("heading", { name: "Export ready" })).closest('[data-slot="toast"]')).toBe(
      original,
    );
    await waitFor(() => expect(body.getByText("Preparing export: report.csv")).toBeVisible());
    await userEvent.click(canvas.getByRole("button", { name: "Download export" }));
    await expect((await body.findByRole("heading", { name: "Export downloaded" })).closest('[data-slot="toast"]')).toBe(
      original,
    );
    await expect(body.getAllByRole("dialog")).toHaveLength(1);
    await userEvent.keyboard("{F6}");
    await userEvent.click(body.getByRole("button", { name: "Close toast" }));
    await waitFor(() => expect(original).not.toBeInTheDocument());
  },
};

export const Lifecycle: Story = {
  render: function Render() {
    const [manager] = useState(() => createToastManager());
    const [events, setEvents] = useState<string[]>([]);
    return (
      <ToastToaster toastManager={manager}>
        <Button
          onClick={() =>
            manager.add({
              title: "Temporary notification",
              timeout: 800,
              onClose: () => setEvents((previous) => [...previous, "Closed"]),
              onRemove: () => setEvents((previous) => [...previous, "Removed"]),
            })
          }
        >
          Create temporary notification
        </Button>
        <output aria-label="Lifecycle events">{events.join(", ") || "Waiting"}</output>
      </ToastToaster>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(canvas.getByRole("button", { name: "Create temporary notification" }));
    await waitFor(() => expect(body.getByRole("heading", { name: "Temporary notification" })).toBeVisible());
    await waitFor(() => expect(canvas.getByLabelText("Lifecycle events")).toHaveTextContent("Closed, Removed"), {
      timeout: 5000,
    });
    await expect(body.queryByRole("heading", { name: "Temporary notification" })).toBeNull();
  },
};

export const Limit: Story = {
  render: function Render() {
    const [manager] = useState(() => createToastManager());
    return (
      <ToastToaster toastManager={manager} timeout={0} limit={2}>
        <Button
          onClick={() => {
            for (const title of ["First notification", "Second notification", "Latest notification"])
              manager.add({ title });
          }}
        >
          Create limited stack
        </Button>
      </ToastToaster>
    );
  },
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(within(canvasElement).getByRole("button", { name: "Create limited stack" }));
    const first = (await body.findByRole("heading", { name: "First notification", hidden: true })).closest<HTMLElement>(
      '[data-slot="toast"]',
    )!;
    await waitFor(() => expect(first).toHaveAttribute("inert"));
    await waitFor(() => expect(getComputedStyle(first).opacity).toBe("0"));
    const latest = (await body.findByRole("heading", { name: "Latest notification" })).closest<HTMLElement>(
      '[data-slot="toast"]',
    )!;
    await userEvent.keyboard("{F6}");
    await userEvent.click(within(latest).getByRole("button", { name: "Close toast" }));
    await waitFor(() => expect(latest).not.toBeInTheDocument());
    await waitFor(() => expect(first).not.toHaveAttribute("inert"));
    await waitFor(() => expect(getComputedStyle(first).opacity).toBe("1"));
    for (const title of ["Second notification", "First notification"]) {
      const notification = body.getByRole("heading", { name: title }).closest<HTMLElement>('[data-slot="toast"]')!;
      await userEvent.hover(notification);
      await userEvent.click(within(notification).getByRole("button", { name: "Close toast" }));
      await waitFor(() => expect(notification).not.toBeInTheDocument());
    }
  },
};
function ToastButton() {
  const manager = useToastManager();
  return (
    <Button onClick={() => manager.add({ title: "Saved", description: "Your changes are saved.", type: "success" })}>
      Create toast
    </Button>
  );
}

export const Action: Story = {
  render: function Render() {
    const [manager] = useState(() => createToastManager());
    const [isUndone, setUndone] = useState(false);
    return (
      <ToastToaster toastManager={manager} timeout={0}>
        <Button
          onClick={() => {
            const id = manager.add({
              title: "File deleted",
              type: "warning",
              actionProps: {
                children: "Undo",
                onClick: () => {
                  setUndone(true);
                  manager.close(id);
                },
              },
            });
          }}
        >
          Delete file
        </Button>
        <output aria-label="Result">{isUndone ? "Restored" : "Deleted"}</output>
      </ToastToaster>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(canvas.getByRole("button", { name: "Delete file" }));
    await userEvent.click(await body.findByRole("button", { name: "Undo" }));
    await expect(canvas.getByLabelText("Result")).toHaveTextContent("Restored");
    await waitFor(() => expect(body.queryByRole("heading", { name: "File deleted" })).toBeNull());
  },
};

export const CompactStack: Story = {
  render: function Render() {
    const [manager] = useState(() => createToastManager());
    return (
      <ToastToaster toastManager={manager} density="compact" timeout={0}>
        <Button
          onClick={() => {
            manager.add({ title: "First", description: "First notification", type: "info" });
            manager.add({ title: "Second", description: "Second notification", type: "error" });
          }}
        >
          Create stack
        </Button>
      </ToastToaster>
    );
  },
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(within(canvasElement).getByRole("button", { name: "Create stack" }));
    const first = (await body.findByRole("heading", { name: "First" })).closest<HTMLElement>('[data-slot="toast"]');
    const second = (await body.findByRole("heading", { name: "Second" })).closest<HTMLElement>('[data-slot="toast"]');
    await waitFor(() =>
      expect(first?.getBoundingClientRect().bottom).toBeLessThanOrEqual(second?.getBoundingClientRect().top ?? 0),
    );
    await expect(second?.querySelector('[data-slot="toast-close"]')?.getBoundingClientRect().height).toBe(18);
    await userEvent.hover(second ?? canvasElement);
    await userEvent.click(within(second ?? canvasElement).getByRole("button", { name: "Close toast" }));
    await userEvent.hover(first ?? canvasElement);
    await userEvent.click(within(first ?? canvasElement).getByRole("button", { name: "Close toast" }));
    await waitFor(() => expect(body.queryByRole("heading", { name: "First" })).toBeNull());
  },
};

export const StateCallbacks: Story = {
  args: { className: fn(() => "font-normal") },
  render: function Render(args) {
    const [manager] = useState(() => createToastManager());
    return (
      <ToastProvider toastManager={manager} timeout={0}>
        <Button onClick={() => manager.add({ title: "Callback toast", type: "info" })}>Create toast</Button>
        <ToastPortal>
          <ToastViewport>
            <CallbackList className={args.className} />
          </ToastViewport>
        </ToastPortal>
      </ToastProvider>
    );
  },
  play: async ({ canvasElement, args }) => {
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(within(canvasElement).getByRole("button", { name: "Create toast" }));
    await waitFor(() => expect(body.getByRole("heading", { name: "Callback toast" })).toBeVisible());
    await expect(args.className).toHaveBeenCalledWith(expect.objectContaining({ type: "info" }));
    await userEvent.click(body.getByRole("button", { name: "Acknowledge" }));
    await userEvent.click(body.getByRole("button", { name: "Close toast" }));
    await waitFor(() => expect(body.queryByRole("heading", { name: "Callback toast" })).toBeNull());
  },
};
function CallbackList({ className }: Pick<ComponentProps<typeof Toast>, "className">) {
  const { toasts } = useToastManager();
  return (
    <>
      {toasts.map((item) => (
        <Toast key={item.id} toast={item} className={className}>
          <ToastContent className={() => "font-normal"}>
            <ToastTitle className={() => "font-normal"} />
            <ToastDescription className={() => "font-normal"}>Read this notification.</ToastDescription>
            <ToastAction className={() => "font-normal"}>Acknowledge</ToastAction>
            <ToastClose className={() => "font-normal"} />
          </ToastContent>
        </Toast>
      ))}
    </>
  );
}

function UploadToast() {
  const [manager] = useState(() => createToastManager());
  const [upload] = useState(() => Promise.withResolvers<string>());
  return (
    <ToastToaster toastManager={manager} timeout={0}>
      <div className="flex gap-control-gap">
        <Button
          onClick={() => {
            void manager
              .promise(upload.promise, {
                loading: { title: "Uploading" },
                success: (name) => ({ title: `Uploaded ${name}` }),
                error: { title: "Upload failed" },
              })
              .catch(() => undefined);
          }}
        >
          Start upload
        </Button>
        <Button onClick={() => upload.resolve("report.csv")}>Complete upload</Button>
        <Button onClick={() => upload.reject(new Error("Upload failed"))}>Fail upload</Button>
      </div>
    </ToastToaster>
  );
}

export const PromiseSuccess: Story = {
  render: () => <UploadToast />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(canvas.getByRole("button", { name: "Start upload" }));
    await waitFor(() => expect(body.getByRole("heading", { name: "Uploading" })).toBeVisible());
    await userEvent.click(canvas.getByRole("button", { name: "Complete upload" }));
    await expect(await body.findByRole("heading", { name: "Uploaded report.csv" })).toBeVisible();
    await userEvent.keyboard("{F6}");
    await userEvent.click(body.getByRole("button", { name: "Close toast" }));
    await waitFor(() => expect(body.queryByRole("heading", { name: "Uploaded report.csv" })).toBeNull());
  },
};
export const PromiseError: Story = {
  render: () => <UploadToast />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(canvas.getByRole("button", { name: "Start upload" }));
    await waitFor(() => expect(body.getByRole("heading", { name: "Uploading" })).toBeVisible());
    await userEvent.click(canvas.getByRole("button", { name: "Fail upload" }));
    await expect(await body.findByRole("heading", { name: "Upload failed" })).toBeVisible();
    await userEvent.keyboard("{F6}");
    await userEvent.click(body.getByRole("button", { name: "Close toast" }));
    await waitFor(() => expect(body.queryByRole("heading", { name: "Upload failed" })).toBeNull());
  },
};
