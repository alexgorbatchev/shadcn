import { expect, test } from "vitest";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";
import { useState, type ReactElement } from "react";
import { DragDropProvider } from "../DragDropProvider";
import { DragSource } from "../DragSource";
import { DropTarget } from "../DropTarget";
import { Button } from "../Button";
import type { IDragDropItem } from "../../drag-drop/types";
import { renderToString } from "react-dom/server";
import { useDragDrop } from "../../hooks/useDragDrop";
import "../../../.storybook/preview.css";

test("requires a provider for drag and drop hooks", () => {
  function Probe(): ReactElement {
    const context = useDragDrop();
    return <p>{context.active?.type}</p>;
  }
  expect(() => renderToString(<Probe />)).toThrow("Drag and drop requires DragDropProvider.");
});

interface IExampleProps {
  type?: string;
  labels?: readonly string[];
  disabled?: boolean;
  canDrop?: (item: IDragDropItem) => boolean;
}

function Example({
  type = "application/x-test",
  labels = ["First light"],
  disabled,
  canDrop,
}: IExampleProps): ReactElement {
  const [result, setResult] = useState("Waiting");
  return (
    <DragDropProvider>
      <div className="flex gap-12 p-8">
        <DragSource type={type} data={{ title: "First light" }} labels={labels} disabled={disabled} render={<Button />}>
          Source
        </DragSource>
        <DropTarget
          accept={["application/x-test"]}
          canDrop={canDrop}
          getDropEffect={(_item, event) => (event.altKey ? "copy" : "move")}
          onDrop={(item, event) =>
            setResult(
              JSON.stringify({ data: item.data, alt: event.altKey, text: event.dataTransfer.getData("text/plain") }),
            )
          }
          render={<Button variant="outline" />}
        >
          Target
        </DropTarget>
        <output aria-label="Result">{result}</output>
      </div>
    </DragDropProvider>
  );
}

test("native dragging transfers the payload and labels and cleans up its preview", async () => {
  const screen = await render(<Example />);
  await page.getByRole("button", { name: "Source" }).dropTo(page.getByRole("button", { name: "Target" }));
  await expect
    .element(screen.getByRole("status", { name: "Result" }))
    .toHaveTextContent('{"data":{"title":"First light"},"alt":false,"text":"First light"}');
  await expect.element(screen.getByRole("status", { name: "Drag status" })).toHaveTextContent("");
});

test("Alt is preserved for native copy operations", async () => {
  const screen = await render(<Example />);
  await userEvent.keyboard("{Alt>}");
  await page.getByRole("button", { name: "Source" }).dropTo(page.getByRole("button", { name: "Target" }));
  await userEvent.keyboard("{/Alt}");
  await expect
    .element(screen.getByRole("status", { name: "Result" }))
    .toHaveTextContent('{"data":{"title":"First light"},"alt":true,"text":"First light"}');
});

test.each([{ type: "application/x-unrelated" }, { canDrop: () => false }, { disabled: true }, { labels: [] }])(
  "rejects unavailable or unrelated drag operations %#",
  async (options) => {
    const screen = await render(<Example {...options} />);
    await page.getByRole("button", { name: "Source" }).dropTo(page.getByRole("button", { name: "Target" }));
    await expect.element(screen.getByRole("status", { name: "Result" })).toHaveTextContent("Waiting");
  },
);

test("accepts native drags that started outside the provider and preserves non-JSON text", async () => {
  function ExternalExample(): ReactElement {
    const [result, setResult] = useState("");
    return (
      <div className="flex gap-12 p-8">
        <button
          type="button"
          draggable
          onDragStart={(event) => event.dataTransfer.setData("text/plain", "External text")}
        >
          External source
        </button>
        <DragDropProvider>
          <DropTarget
            accept={["text/plain"]}
            onDrop={(item) => setResult(JSON.stringify(item.data))}
            render={<Button />}
          >
            Target
          </DropTarget>
        </DragDropProvider>
        <output aria-label="Result">{result}</output>
      </div>
    );
  }
  const screen = await render(<ExternalExample />);
  await page.getByRole("button", { name: "External source" }).dropTo(page.getByRole("button", { name: "Target" }));
  await expect.element(screen.getByRole("status", { name: "Result" })).toHaveTextContent('"External text"');
});
