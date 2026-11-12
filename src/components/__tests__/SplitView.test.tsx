import { expect, test } from "vitest";
import { render } from "vitest-browser-react";
import { page } from "vitest/browser";
import { SplitView } from "../resizable/SplitView";
import { ThemeProvider } from "../ThemeProvider";
import { DensityProvider } from "../DensityProvider";
import "../../../.storybook/preview.css";

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
    expect(content.getBoundingClientRect().bottom).toBeLessThanOrEqual(
      sidebar.parentElement!.getBoundingClientRect().top + 401,
    );
    if (width < 1024) {
      expect(sidebar.clientHeight).toBeLessThanOrEqual(140);
      expect(content.clientHeight).toBeGreaterThanOrEqual(258);
    }
  });
}
