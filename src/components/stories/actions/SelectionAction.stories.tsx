import { useEffect, useRef, useState } from "react";
import type { ReactElement } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, waitFor, within } from "storybook/test";
import { Button } from "../../Button.js";
import { SelectionAction } from "../../SelectionAction.js";

const meta: Meta<typeof SelectionAction> = {
  title: "Actions/SelectionAction",
  component: SelectionAction,
  tags: ["autodocs", "test"],
};
export default meta;
type Story = StoryObj<typeof SelectionAction>;

function SelectionExample(): ReactElement {
  const block = useRef<HTMLElement>(null);
  const [isSelected, setSelected] = useState(false);
  useEffect(() => {
    const update = () => {
      const selection = document.getSelection();
      setSelected(Boolean(selection && !selection.isCollapsed && block.current?.contains(selection.anchorNode)));
    };
    document.addEventListener("selectionchange", update);
    return () => document.removeEventListener("selectionchange", update);
  }, []);
  return (
    <div className="h-[80vh] overflow-auto pt-24">
      <section ref={block} className="relative h-[130vh] w-screen">
        <p>Beginning of the content.</p>
        <p className="absolute top-[42vh]">Choose this text to reveal the action.</p>
      </section>
      {isSelected && block.current && (
        <SelectionAction anchor={block.current}>
          <Button size="sm" onMouseDown={(event) => event.preventDefault()}>
            Comment on selected text
          </Button>
        </SelectionAction>
      )}
    </div>
  );
}

export const FollowsSelectionInTallBlock: Story = {
  render: () => <SelectionExample />,
  async play({ canvasElement }) {
    const canvas = within(canvasElement);
    const line = canvas.getByText("Choose this text to reveal the action.");
    const doc = line.ownerDocument;
    const range = doc.createRange();
    range.selectNodeContents(line);
    doc.getSelection()?.addRange(range);
    const button = await canvas.findByRole("button", { name: "Comment on selected text" });
    const checkPlacement = () => {
      const text = range.getBoundingClientRect();
      const rect = button.getBoundingClientRect();
      const gap = Math.max(rect.top - text.bottom, text.top - rect.bottom);
      expect(gap).toBeGreaterThanOrEqual(0);
      expect(gap).toBeLessThan(12);
    };
    await waitFor(checkPlacement);
    expect(button.parentElement?.previousElementSibling).toBe(line.parentElement);
    const scroll = line.parentElement?.parentElement;
    if (scroll) scroll.scrollTop = 45;
    await waitFor(checkPlacement);
    // Some content renderers retain the semantic wrapper without giving it a layout box.
    if (line.parentElement) line.parentElement.style.display = "contents";
    await waitFor(checkPlacement);
    doc.getSelection()?.removeAllRanges();
    await waitFor(() => expect(canvasElement.querySelector('[data-slot="selection-action"]')).toBeNull());
  },
};
