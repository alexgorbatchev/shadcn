import { useState, type ReactElement } from "react";
import { assert, expect, test } from "vitest";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";
import { ThemeProvider } from "../../ThemeProvider";
import { DiagramSurface } from "../DiagramSurface";
import { DiagramViewer } from "../DiagramViewer";
import { MediaShell } from "../MediaShell";
import { useMermaidTheme } from "../hooks/useMermaidTheme";
import { Button } from "../../Button";
import "../../../../.storybook/preview.css";

const sequenceSvg = [
  '<svg id="seq" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 400" width="800" height="400">',
  "<style>#seq text { fill: currentColor; font-size: 16px; } #seq rect { stroke: currentColor; fill: none; }</style>",
  '<rect x="20" y="20" width="760" height="360" />',
  '<text x="360" y="200">charge</text>',
  "</svg>",
].join("");

function ThemeProbe(): ReactElement {
  const [mode, setMode] = useState<"dark" | "light">("dark");
  return (
    <ThemeProvider forcedTheme={mode}>
      <ThemeProbeInner onToggle={() => setMode((m) => (m === "dark" ? "light" : "dark"))} />
    </ThemeProvider>
  );
}

function ThemeProbeInner({ onToggle }: { onToggle: () => void }): ReactElement {
  const { themeKey, config } = useMermaidTheme();
  return (
    <div>
      <Button type="button" onClick={onToggle}>
        Toggle appearance
      </Button>
      <output aria-label="Theme mode">{config.darkMode ? "dark" : "light"}</output>
      <output aria-label="Theme key">{themeKey}</output>
    </div>
  );
}

test("DiagramViewer opens no narrower than openingWidth, zooms to 400% via keys, and keeps live SVG text", async () => {
  await page.viewport(640, 400);
  const screen = await render(
    <div className="h-[360px] w-[600px]">
      <DiagramViewer
        svg={sequenceSvg}
        label="Payments failure sequence"
        description="App sends charge to Payments."
        openingWidth={560}
        showZoomControl
      />
    </div>,
  );

  const stage = screen.getByRole("region", { name: /^Payments failure sequence, \d+%$/ });
  const svg = screen.getByRole("img", { name: "Payments failure sequence" });
  await expect.poll(() => svg.element().getBoundingClientRect().width).toBeGreaterThanOrEqual(559);
  expect(screen.container.querySelector("img")).toBeNull();
  await expect.element(svg).toHaveAccessibleDescription("App sends charge to Payments.");

  stage.element().focus();
  await userEvent.keyboard("++++++");
  await expect.poll(() => screen.getByRole("status", { name: "Zoom level" }).element().textContent).toBe("400%");
  await expect.poll(() => svg.element().getBoundingClientRect().width).toBe(3200);

  await userEvent.keyboard("0");
  await expect.poll(() => stage.element().getAttribute("data-zoom")).toBe("fit");
});

test("MediaShell at 320x200 keeps Close aligned with the title, separates it from the toolbar, and reveals overflowing toolbar actions", async () => {
  await page.viewport(320, 200);
  const screen = await render(
    <MediaShell
      open
      onOpenChange={() => {}}
      title="Payments failure sequence with a very long descriptive title"
      description="Drag to pan; pinch or zoom."
    >
      <DiagramViewer
        svg={sequenceSvg}
        label="Payments failure sequence"
        showZoomControl
        toolbar={
          <Button type="button" variant="outline" size="sm">
            Diagram source
          </Button>
        }
      />
    </MediaShell>,
  );

  const close = screen.getByRole("button", { name: "Close" });
  const title = screen.getByRole("heading", { name: /Payments failure sequence/ });
  const scrollRight = screen.getByRole("button", { name: "Scroll toolbar right" });
  await expect.element(close).toBeVisible();
  await expect.element(scrollRight).toBeVisible();

  const closeRect = close.element().getBoundingClientRect();
  const titleRect = title.element().getBoundingClientRect();
  const toolbarEl = document.querySelector("[data-slot=diagram-viewer-toolbar]");
  assert(toolbarEl);
  const toolbarRect = toolbarEl.getBoundingClientRect();

  expect(closeRect.left).toBeGreaterThanOrEqual(0);
  expect(closeRect.top).toBeGreaterThanOrEqual(0);
  expect(closeRect.right).toBeLessThanOrEqual(320);
  expect(closeRect.bottom).toBeLessThanOrEqual(200);
  expect(Math.abs(titleRect.top + titleRect.height / 2 - (closeRect.top + closeRect.height / 2))).toBeLessThanOrEqual(
    2,
  );
  expect(toolbarRect.top).toBeGreaterThanOrEqual(closeRect.bottom + 4);
  expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(320);

  await scrollRight.click();
  await expect.poll(() => toolbarEl.scrollLeft).toBeGreaterThan(0);
  await expect.element(screen.getByRole("button", { name: "Scroll toolbar left" })).toBeVisible();
});

test("DiagramSurface mounts inline and expanded copies with isolated IDs", async () => {
  await page.viewport(800, 600);
  const screen = await render(
    <div>
      <DiagramSurface svg={sequenceSvg} label="Inline diagram" />
      <DiagramSurface svg={sequenceSvg} label="Expanded diagram" fit="fill" />
    </div>,
  );
  const svgs = screen.container.querySelectorAll("svg");
  expect(svgs.length).toBe(2);
  expect(svgs[0]?.getAttribute("id")).not.toBe(svgs[1]?.getAttribute("id"));
});

test("useMermaidTheme updates when ThemeProvider switches appearance without reload", async () => {
  await page.viewport(640, 400);
  const screen = await render(<ThemeProbe />);
  await expect.element(screen.getByRole("status", { name: "Theme mode" })).toHaveTextContent("dark");
  const initialKey = screen.getByRole("status", { name: "Theme key" }).element().textContent;
  await userEvent.click(screen.getByRole("button", { name: "Toggle appearance" }));
  await expect.element(screen.getByRole("status", { name: "Theme mode" })).toHaveTextContent("light");
  expect(screen.getByRole("status", { name: "Theme key" }).element().textContent).not.toBe(initialKey);
});
