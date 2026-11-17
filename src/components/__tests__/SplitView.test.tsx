import type { ReactElement } from "react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server.browser";
import { expect, onTestFinished, test } from "vitest";
import { render } from "vitest-browser-react";
import { page, userEvent, type Locator } from "vitest/browser";
import { SplitView } from "../resizable/SplitView";
import { ThemeProvider } from "../ThemeProvider";
import { DensityProvider } from "../DensityProvider";
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
    await expect.element(handle).toHaveAttribute("aria-valuenow", resizedSize);
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
