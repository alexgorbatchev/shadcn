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
