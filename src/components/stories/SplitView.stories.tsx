import { useId, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { SplitView } from "../resizable/SplitView";
import { Button } from "../Button";

const meta: Meta<typeof SplitView> = {
  title: "shadcn-alexgorbatchev/components/SplitView",
  component: SplitView,
  tags: ["autodocs", "test"],
  args: {
    sidebarLabel: "Navigation",
    contentLabel: "Content",
    resizeLabel: "Resize navigation",
    storageKey: "split-view-story",
    defaultSidebarSize: 220,
  },
  render: function Example(args) {
    const key = useId();
    const [isVisible, setVisible] = useState(true);
    return (
      <div className="flex w-[900px] max-w-full flex-col gap-4">
        <Button onClick={() => setVisible(!isVisible)}>{isVisible ? "Hide panels" : "Show panels"}</Button>
        {isVisible && (
          <SplitView {...args} storageKey={key} sidebar={<h2>Navigation heading</h2>}>
            <h2>Content heading</h2>
            <p>Resizable content</p>
          </SplitView>
        )}
      </div>
    );
  },
};
export default meta;
type Story = StoryObj<typeof meta>;
export const Persistent: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const handle = canvas.getByRole("separator", { name: "Resize navigation" });
    await expect(handle.getBoundingClientRect().width).toBe(2);
    const sidebar = canvas.getByRole("complementary", { name: "Navigation" });
    const content = canvas.getByRole("region", { name: "Content" });
    await expect(canvas.getByRole("heading", { name: "Navigation heading" }).getBoundingClientRect().y).toBe(
      canvas.getByRole("heading", { name: "Content heading" }).getBoundingClientRect().y,
    );
    await expect(getComputedStyle(sidebar).borderWidth).toBe("0px");
    await expect(getComputedStyle(content).borderWidth).toBe("0px");
    const initial = sidebar.getBoundingClientRect().width;
    handle.focus();
    await userEvent.keyboard("{ArrowRight}");
    await waitFor(() => expect(sidebar.getBoundingClientRect().width).toBeGreaterThan(initial));
    const changed = sidebar.getBoundingClientRect().width;
    await userEvent.click(canvas.getByRole("button", { name: "Hide panels" }));
    await userEvent.click(canvas.getByRole("button", { name: "Show panels" }));
    await waitFor(() =>
      expect(canvas.getByRole("complementary", { name: "Navigation" }).getBoundingClientRect().width).toBeCloseTo(
        changed,
        0,
      ),
    );
  },
};

export const ExternalStorage: Story = {
  render: function Example(args) {
    const [values] = useState(() => new Map<string, string>());
    const [isSaved, setSaved] = useState(false);
    const [storage] = useState(() => ({
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => {
        values.set(key, value);
        setSaved(true);
      },
    }));
    const [isVisible, setVisible] = useState(true);
    return (
      <div className="flex w-[900px] flex-col gap-4">
        <Button onClick={() => setVisible(!isVisible)}>{isVisible ? "Hide panels" : "Show panels"}</Button>
        {isVisible && (
          <SplitView {...args} storageKey="external-layout" storage={storage} sidebar={<h2>Navigation</h2>}>
            <h2>Content</h2>
          </SplitView>
        )}
        <Button onClick={() => setVisible(values.has("react-resizable-panels:external-layout"))}>
          Restore saved panels
        </Button>
        <p role="status">{isSaved ? "Layout saved" : "No saved layout"}</p>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const handle = canvas.getByRole("separator", { name: "Resize navigation" });
    const before = handle.getAttribute("aria-valuenow");
    handle.focus();
    await userEvent.keyboard("{ArrowRight}");
    await waitFor(() => expect(handle.getAttribute("aria-valuenow")).not.toBe(before));
    const changed = handle.getAttribute("aria-valuenow");
    await waitFor(() => expect(canvas.getByRole("status")).toHaveTextContent("Layout saved"));
    await userEvent.click(canvas.getByRole("button", { name: "Hide panels" }));
    await userEvent.click(canvas.getByRole("button", { name: "Restore saved panels" }));
    await waitFor(() =>
      expect(canvas.getByRole("separator", { name: "Resize navigation" })).toHaveAttribute("aria-valuenow", changed),
    );
    await expect(localStorage.getItem("react-resizable-panels:external-layout")).toBeNull();
  },
};
