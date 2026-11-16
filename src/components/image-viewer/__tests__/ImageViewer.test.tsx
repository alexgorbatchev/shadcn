import { expect, test } from "vitest";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";
import { ImageViewer } from "../ImageViewer";
import { createSvgImageUrl } from "./helpers";
import "../../../../.storybook/preview.css";

const screenshot = createSvgImageUrl(
  1600,
  1000,
  [241, 245, 249, 255],
  [{ rect: { x: 600, y: 360, width: 160, height: 48 }, color: [37, 99, 235, 255] }],
);

test("keyboard users scroll an original-size image after focusing the viewer", async () => {
  await page.viewport(1000, 700);
  const screen = await render(
    <div className="h-80 w-96">
      <ImageViewer src={screenshot} alt="Dashboard capture" defaultZoom="original" />
    </div>,
  );
  const viewport = screen.getByRole("region", { name: "Dashboard capture" });
  await expect.poll(() => viewport.element().scrollHeight).toBeGreaterThan(viewport.element().clientHeight);
  const top = viewport.element().scrollTop;
  const left = viewport.element().scrollLeft;
  await userEvent.tab();
  await expect.element(viewport).toHaveFocus();
  await userEvent.keyboard("{ArrowDown}{ArrowRight}");
  await expect.poll(() => viewport.element().scrollTop).toBeGreaterThan(top);
  await expect.poll(() => viewport.element().scrollLeft).toBeGreaterThan(left);
});
