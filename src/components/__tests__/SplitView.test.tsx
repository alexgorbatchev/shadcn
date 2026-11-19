import { useState, type ReactElement } from "react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server.browser";
import { expect, onTestFinished, test } from "vitest";
import { render } from "vitest-browser-react";
import { commands, page, userEvent, type Locator } from "vitest/browser";
import { SplitView } from "../resizable/SplitView";
import { ThemeProvider } from "../ThemeProvider";
import { DensityProvider } from "../DensityProvider";
import { DirectionProvider } from "../DirectionProvider";
import { Input } from "../Input";
import { Switch } from "../Switch";
import "../../../.storybook/preview.css";

interface IStatefulPanelProps {
  name: string;
}

function StatefulPanel({ name }: IStatefulPanelProps): ReactElement {
  return (
    <div className="flex flex-col items-start gap-2">
      <Input aria-label={`${name} draft`} />
      <Switch aria-label={`${name} updates`} />
    </div>
  );
}

function getBox(locator: Locator): DOMRect {
  return locator.element().getBoundingClientRect();
}

function getPanelControls(): Locator[] {
  return [
    page.getByRole("complementary", { name: "Navigation" }),
    page.getByRole("region", { name: "Content" }),
    page.getByRole("textbox", { name: "Navigation draft" }),
    page.getByRole("textbox", { name: "Content draft" }),
    page.getByRole("switch", { name: "Navigation updates" }),
    page.getByRole("switch", { name: "Content updates" }),
  ];
}

async function expectPanelState(controls: readonly Locator[], elements: readonly Element[]): Promise<void> {
  await expect.element(page.getByRole("textbox", { name: "Navigation draft" })).toHaveValue("Sidebar note");
  await expect.element(page.getByRole("textbox", { name: "Content draft" })).toHaveValue("Content note");
  await expect.element(page.getByRole("switch", { name: "Navigation updates" })).toBeChecked();
  await expect.element(page.getByRole("switch", { name: "Content updates" })).toBeChecked();
  expect(controls.map((control, index) => control.element() === elements[index])).toEqual(elements.map(() => true));
}

async function changePanelState(): Promise<void> {
  await userEvent.fill(page.getByRole("textbox", { name: "Navigation draft" }), "Sidebar note");
  await userEvent.fill(page.getByRole("textbox", { name: "Content draft" }), "Content note");
  await userEvent.click(page.getByRole("switch", { name: "Navigation updates" }));
  await userEvent.click(page.getByRole("switch", { name: "Content updates" }));
}

test.each(["start", "end"] as const)(
  "%s sidebar and content keep their state when the viewport crosses the wide breakpoint",
  async (sidebarPosition) => {
    const storageKey = `native-breakpoint-${sidebarPosition}`;
    onTestFinished(() => localStorage.removeItem(`react-resizable-panels:${storageKey}`));
    await page.viewport(1280, 844);
    await render(
      <ThemeProvider forcedTheme="dark">
        <DensityProvider density="comfortable">
          <SplitView
            storageKey={storageKey}
            sidebarPosition={sidebarPosition}
            sidebarLabel="Navigation"
            contentLabel="Content"
            resizeLabel="Resize navigation"
            sidebar={<StatefulPanel name="Navigation" />}
          >
            <StatefulPanel name="Content" />
          </SplitView>
        </DensityProvider>
      </ThemeProvider>,
    );
    const sidebar = page.getByRole("complementary", { name: "Navigation" });
    const content = page.getByRole("region", { name: "Content" });
    const handle = page.getByRole("separator", { name: "Resize navigation" });
    await changePanelState();
    const initialSize = handle.element().getAttribute("aria-valuenow");
    handle.element().focus();
    await userEvent.keyboard("{ArrowLeft}");
    await expect.element(handle).not.toHaveAttribute("aria-valuenow", initialSize);
    const resizedSize = handle.element().getAttribute("aria-valuenow");
    const controls = getPanelControls();
    const elements = controls.map((control) => control.element());

    await page.viewport(390, 844);
    await expect.element(handle).not.toBeInTheDocument();
    expect(getBox(sidebar).width).toBe(getBox(content).width);
    expect(getBox(sidebar).top).not.toBe(getBox(content).top);
    await expectPanelState(controls, elements);

    await page.viewport(1280, 844);
    // The width comes back in pixels, which the separator reports as a percentage rounded differently.
    await expect.poll(() => Number(handle.element().getAttribute("aria-valuenow"))).toBeCloseTo(Number(resizedSize), 1);
    expect(getBox(sidebar).top).toBe(getBox(content).top);
    expect(getBox(sidebar).width).not.toBe(getBox(content).width);
    await expectPanelState(controls, elements);
  },
);

test("server-rendered split views hydrate in place and keep panel state across the wide breakpoint", async () => {
  await page.viewport(1280, 844);
  const view = (
    <SplitView
      storageKey="native-hydrated-split"
      sidebarLabel="Navigation"
      contentLabel="Content"
      resizeLabel="Resize navigation"
      sidebar={<StatefulPanel name="Navigation" />}
    >
      <StatefulPanel name="Content" />
    </SplitView>
  );
  const container = document.createElement("div");
  document.body.append(container);
  container.innerHTML = renderToString(view);
  expect(container.querySelector('aside[aria-label="Navigation"] input[aria-label="Navigation draft"]')).not.toBeNull();
  expect(container.querySelector('section[aria-label="Content"] input[aria-label="Content draft"]')).not.toBeNull();
  const errors: unknown[] = [];
  const root = hydrateRoot(container, view, { onRecoverableError: (error) => errors.push(error) });
  try {
    await expect.element(page.getByRole("separator", { name: "Resize navigation" })).toBeVisible();
    expect(errors).toEqual([]);
    await changePanelState();
    const controls = getPanelControls();
    const elements = controls.map((control) => control.element());
    await page.viewport(390, 844);
    await expect.element(page.getByRole("separator", { name: "Resize navigation" })).not.toBeInTheDocument();
    await expectPanelState(controls, elements);
    await page.viewport(1280, 844);
    await expect.element(page.getByRole("separator", { name: "Resize navigation" })).toBeVisible();
    await expectPanelState(controls, elements);
  } finally {
    root.unmount();
    container.remove();
  }
});

test("mobile split views stack without horizontal scrolling and retain the desktop preference", async () => {
  await page.viewport(390, 844);
  localStorage.setItem("react-resizable-panels:native-mobile-split", JSON.stringify({ sidebar: 35, content: 65 }));
  const screen = await render(
    <ThemeProvider forcedTheme="dark">
      <DensityProvider density="comfortable">
        <SplitView
          storageKey="native-mobile-split"
          sidebarLabel="Navigation"
          contentLabel="Content"
          resizeLabel="Resize navigation"
          sidebar={<h2>Navigation heading</h2>}
        >
          <h2>Content heading</h2>
        </SplitView>
      </DensityProvider>
    </ThemeProvider>,
  );
  const sidebar = screen.getByRole("complementary", { name: "Navigation" });
  const content = screen.getByRole("region", { name: "Content" });
  await expect.element(sidebar).toBeVisible();
  expect(content.element().getBoundingClientRect().top).toBeGreaterThan(
    sidebar.element().getBoundingClientRect().bottom,
  );
  expect(screen.getByRole("separator").element().getBoundingClientRect().height).toBe(2);
  expect(document.documentElement.scrollWidth).toBe(window.innerWidth);
  expect(localStorage.getItem("react-resizable-panels:native-mobile-split")).toBe(
    JSON.stringify({ sidebar: 35, content: 65 }),
  );
});

for (const width of [390, 1280]) {
  test(`fill split view bounds scroll at ${width}px and keeps unpadded content available`, async () => {
    await page.viewport(width, 844);
    const screen = await render(
      <ThemeProvider forcedTheme="dark">
        <DensityProvider density="comfortable">
          <div style={{ height: 400 }}>
            <SplitView
              storageKey={`native-fill-${width}`}
              layout="fill"
              sidebarPadding="none"
              contentPadding="none"
              sidebarLabel="Navigation"
              contentLabel="Content"
              resizeLabel="Resize navigation"
              sidebar={<div style={{ height: 800 }}>Long navigation</div>}
            >
              <h2>Content heading</h2>
            </SplitView>
          </div>
        </DensityProvider>
      </ThemeProvider>,
    );
    const sidebar = screen.getByRole("complementary", { name: "Navigation" }).element();
    const content = screen.getByRole("region", { name: "Content" }).element();
    expect(sidebar.scrollHeight).toBeGreaterThan(sidebar.clientHeight);
    sidebar.scrollTop = 300;
    expect(sidebar.scrollTop).toBeGreaterThan(0);
    expect(getComputedStyle(sidebar).paddingTop).toBe("0px");
    expect(getComputedStyle(content).paddingTop).toBe("0px");
    expect(content.getBoundingClientRect().bottom).toBeLessThanOrEqual(sidebar.getBoundingClientRect().top + 401);
    if (width < 1024) {
      expect(sidebar.clientHeight).toBeLessThanOrEqual(140);
      expect(content.clientHeight).toBeGreaterThanOrEqual(258);
    }
  });
}

interface IOverlayExampleProps {
  narrowLayout: "sheet" | "drawer";
  sidebarPosition?: "start" | "end";
  onOpenChange?: (open: boolean) => void;
  finalFocus?: false;
}

function OverlayExample({
  narrowLayout,
  sidebarPosition = "start",
  onOpenChange,
  finalFocus,
}: IOverlayExampleProps): ReactElement {
  const [isOpen, setOpen] = useState(false);
  const [isExpanded, setExpanded] = useState(false);
  return (
    <ThemeProvider forcedTheme="dark">
      <DensityProvider density="comfortable">
        <button type="button" onClick={() => setOpen(true)}>
          Open panel
        </button>
        <SplitView
          storageKey={`native-overlay-${narrowLayout}`}
          layout="fill"
          sidebarPosition={sidebarPosition}
          narrowLayout={narrowLayout}
          sidebarOpen={isOpen}
          sidebarExpanded={isExpanded}
          sidebarFinalFocus={finalFocus}
          onSidebarOpenChange={(open) => {
            onOpenChange?.(open);
            setOpen(open);
          }}
          sidebarLabel="Navigation"
          contentLabel="Content"
          resizeLabel="Resize navigation"
          sidebar={
            <div className="flex flex-col gap-2">
              <StatefulPanel name="Navigation" />
              <button type="button" onClick={() => setExpanded(!isExpanded)}>
                {isExpanded ? "Collapse" : "Full height"}
              </button>
              <div style={{ height: 1600 }}>Long navigation</div>
            </div>
          }
        >
          <StatefulPanel name="Content" />
          <div style={{ height: 2000 }}>Long content</div>
        </SplitView>
      </DensityProvider>
    </ThemeProvider>
  );
}

test("sheet narrow layout opens the sidebar as a full-height start panel and closes back to its opener", async () => {
  await page.viewport(390, 844);
  const changes: boolean[] = [];
  const screen = await render(<OverlayExample narrowLayout="sheet" onOpenChange={(open) => changes.push(open)} />);
  const content = screen.getByRole("region", { name: "Content" });
  // Closed, the content flows in the document: it scrolls with the page, not inside a box of its own.
  await expect.element(content).toBeVisible();
  expect(document.documentElement.scrollHeight).toBeGreaterThan(window.innerHeight);
  expect(content.element().scrollHeight).toBe(content.element().clientHeight);
  expect(document.querySelector('aside[aria-label="Navigation"]')?.isConnected ?? false).toBe(false);
  const opener = screen.getByRole("button", { name: "Open panel" });
  await opener.click();
  const dialog = page.getByRole("dialog", { name: "Navigation" });
  await expect.element(dialog).toBeVisible();
  await expect.poll(() => getBox(dialog).left).toBe(0);
  await expect.poll(() => getBox(dialog).top).toBeLessThanOrEqual(1);
  await expect.poll(() => getBox(dialog).bottom).toBeGreaterThanOrEqual(843);
  const sidebar = dialog.getByRole("complementary", { name: "Navigation" });
  // The panel's own list scrolls inside it.
  expect(sidebar.element().scrollHeight).toBeGreaterThan(sidebar.element().clientHeight);
  await userEvent.fill(dialog.getByRole("textbox", { name: "Navigation draft" }), "Kept");
  // Focus stays inside the modal panel.
  for (let index = 0; index < 6; index += 1) {
    await userEvent.keyboard("{Tab}");
    expect(dialog.element().contains(document.activeElement)).toBe(true);
  }
  await dialog.getByRole("button", { name: "Close" }).click();
  await expect.element(dialog).not.toBeInTheDocument();
  await expect.element(opener).toHaveFocus();
  expect(changes).toEqual([false]);
  await opener.click();
  await expect.element(page.getByRole("textbox", { name: "Navigation draft" })).toHaveValue("Kept");
  await userEvent.keyboard("{Escape}");
  await expect.element(page.getByRole("dialog", { name: "Navigation" })).not.toBeInTheDocument();
  await expect.element(opener).toHaveFocus();
  expect(changes).toEqual([false, false]);
});

test("sheet narrow layout closes on a swipe toward its edge", async () => {
  await page.viewport(390, 844);
  const screen = await render(<OverlayExample narrowLayout="sheet" />);
  await screen.getByRole("button", { name: "Open panel" }).click();
  const dialog = page.getByRole("dialog", { name: "Navigation" });
  await expect.element(dialog).toBeVisible();
  await commands.nativeSwipe('[data-slot="drawer-swipe-handle"]', -300, 0);
  await expect.element(dialog).not.toBeInTheDocument();
});

test.each(["ltr", "rtl"] as const)("an end sheet opens from the end edge in %s", async (direction) => {
  await page.viewport(390, 844);
  await render(
    <DirectionProvider direction={direction}>
      <div dir={direction}>
        <OverlayExample narrowLayout="sheet" sidebarPosition="end" />
      </div>
    </DirectionProvider>,
  );
  await page.getByRole("button", { name: "Open panel" }).click();
  const dialog = page.getByRole("dialog", { name: "Navigation" });
  await expect.element(dialog).toBeVisible();
  if (direction === "ltr") await expect.poll(() => Math.round(getBox(dialog).right)).toBe(390);
  else await expect.poll(() => getBox(dialog).left).toBe(0);
});

test("drawer narrow layout opens at 85% of the viewport and at full height while expanded", async () => {
  await page.viewport(390, 844);
  const screen = await render(<OverlayExample narrowLayout="drawer" sidebarPosition="end" />);
  const opener = screen.getByRole("button", { name: "Open panel" });
  await opener.click();
  const dialog = page.getByRole("dialog", { name: "Navigation" });
  await expect.element(dialog).toBeVisible();
  await expect.poll(() => Math.round(getBox(dialog).height)).toBe(Math.round(844 * 0.85));
  await expect.poll(() => Math.round(getBox(dialog).bottom)).toBe(844);
  await dialog.getByRole("button", { name: "Full height" }).click();
  await expect.poll(() => Math.round(getBox(dialog).height)).toBe(844);
  await dialog.getByRole("button", { name: "Collapse" }).click();
  await expect.poll(() => Math.round(getBox(dialog).height)).toBe(Math.round(844 * 0.85));
  await userEvent.keyboard("{Escape}");
  await expect.element(dialog).not.toBeInTheDocument();
  await expect.element(opener).toHaveFocus();
});

test("an overlay's final focus can leave focus where the consumer moved it", async () => {
  await page.viewport(390, 844);
  const screen = await render(<OverlayExample narrowLayout="sheet" finalFocus={false} />);
  await screen.getByRole("button", { name: "Open panel" }).click();
  await expect.element(page.getByRole("dialog", { name: "Navigation" })).toBeVisible();
  await userEvent.keyboard("{Escape}");
  await expect.element(page.getByRole("dialog", { name: "Navigation" })).not.toBeInTheDocument();
  await expect.element(screen.getByRole("button", { name: "Open panel" })).not.toHaveFocus();
});

test("a narrow overlay becomes a docked sidebar on a wide screen", async () => {
  await page.viewport(390, 844);
  await render(<OverlayExample narrowLayout="sheet" />);
  await page.getByRole("button", { name: "Open panel" }).click();
  await userEvent.fill(page.getByRole("textbox", { name: "Navigation draft" }), "Kept");
  await page.viewport(1280, 844);
  await expect.element(page.getByRole("dialog")).not.toBeInTheDocument();
  await expect.element(page.getByRole("separator", { name: "Resize navigation" })).toBeVisible();
  await expect.element(page.getByRole("textbox", { name: "Navigation draft" })).toHaveValue("Kept");
});

test("the sidebar keeps its width in pixels when the window resizes and after a reload", async () => {
  const storageKey = "native-pixel-width";
  onTestFinished(() => localStorage.removeItem(`split-view:${storageKey}:sidebar-px`));
  await page.viewport(1600, 844);
  const view = (
    <SplitView
      storageKey={storageKey}
      sidebarLabel="Navigation"
      contentLabel="Content"
      resizeLabel="Resize navigation"
      defaultSidebarSize={288}
      sidebar={<h2>Navigation heading</h2>}
    >
      <h2>Content heading</h2>
    </SplitView>
  );
  const screen = await render(view);
  const sidebar = page.getByRole("complementary", { name: "Navigation" });
  await expect.poll(() => Math.round(getBox(sidebar).width)).toBe(288);
  page.getByRole("separator", { name: "Resize navigation" }).element().focus();
  await userEvent.keyboard("{ArrowRight}");
  await expect.poll(() => getBox(sidebar).width).toBeGreaterThan(300);
  const chosen = Math.round(getBox(sidebar).width);
  await expect.poll(() => Math.round(Number(localStorage.getItem(`split-view:${storageKey}:sidebar-px`)))).toBe(chosen);
  await page.viewport(1280, 844);
  await expect.poll(() => Math.round(getBox(sidebar).width)).toBe(chosen);
  await screen.unmount();
  await render(view);
  await expect
    .poll(() => Math.round(getBox(page.getByRole("complementary", { name: "Navigation" })).width))
    .toBe(chosen);
});

test("a stored width that is not a positive number falls back to the default", async () => {
  const storageKey = "native-pixel-invalid";
  localStorage.setItem(`split-view:${storageKey}:sidebar-px`, '"wide"');
  onTestFinished(() => localStorage.removeItem(`split-view:${storageKey}:sidebar-px`));
  await page.viewport(1280, 844);
  await render(
    <SplitView
      storageKey={storageKey}
      sidebarLabel="Navigation"
      contentLabel="Content"
      resizeLabel="Resize navigation"
      defaultSidebarSize={288}
      sidebar={<h2>Navigation heading</h2>}
    >
      <h2>Content heading</h2>
    </SplitView>,
  );
  await expect.poll(() => Math.round(getBox(page.getByRole("complementary", { name: "Navigation" })).width)).toBe(288);
});
