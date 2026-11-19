import { expect, onTestFinished, test, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "../DropdownMenu";
import { MenuEmpty, MenuFilterProvider, MenuInput, MenuItem, MenuList } from "../MenuParts";
import { observeScrollGuards } from "../../utils/observeScrollGuards";
import type { MenuPoint } from "../../menu/types";
import "../../../.storybook/preview.css";

const ITEMS = ["Alpha", "Bravo", "Charlie", "Delta", "Echo", "Foxtrot", "Golf", "Hotel"];

interface IPointMenuProps {
  point: MenuPoint;
  items?: readonly string[];
}

function PointMenu({ point, items = ITEMS }: IPointMenuProps): React.ReactElement {
  return (
    <DropdownMenu open>
      <DropdownMenuTrigger>Actions</DropdownMenuTrigger>
      <DropdownMenuContent point={point} aria-label="Point menu">
        {items.map((item) => (
          <MenuItem key={item}>{item}</MenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function menuRect(): DOMRect {
  return page.getByRole("menu", { name: "Point menu" }).element().getBoundingClientRect();
}

test("a menu given a point opens with its top start corner on that point", async () => {
  await page.viewport(1280, 800);
  await render(<PointMenu point={{ clientX: 400, clientY: 300 }} />);
  await expect.poll(() => Math.round(menuRect().left)).toBe(400);
  expect(Math.round(menuRect().top)).toBe(300);
});

test("a menu opened at a point near the bottom and end edges stays wholly visible without scrolling", async () => {
  await page.viewport(900, 900);
  await render(<PointMenu point={{ clientX: 895, clientY: 895 }} />);
  const menu = page.getByRole("menu", { name: "Point menu" });
  await expect.element(menu).toBeVisible();
  await expect.poll(() => menuRect().bottom).toBeLessThanOrEqual(900);
  const rect = menuRect();
  expect(rect.right).toBeLessThanOrEqual(900);
  expect(rect.top).toBeGreaterThanOrEqual(0);
  expect(rect.left).toBeGreaterThanOrEqual(0);
  const element = menu.element();
  expect(element.scrollHeight).toBeLessThanOrEqual(element.clientHeight);
  expect(element.scrollWidth).toBeLessThanOrEqual(element.clientWidth);
});

test("a menu taller than the viewport is reported by the scroll guard instead of quietly scrolling", async () => {
  await page.viewport(900, 400);
  const report = vi.fn<(error: Error) => void>();
  onTestFinished(observeScrollGuards(document, report));
  await render(
    <PointMenu
      point={{ clientX: 100, clientY: 100 }}
      items={Array.from({ length: 40 }, (_, index) => `Item ${index}`)}
    />,
  );
  await expect.poll(() => report.mock.calls.length).toBe(1);
  expect(report.mock.calls[0]?.[0].message).toContain("Scrolling is forbidden");
});

test("a menu that fits raises no scroll guard report", async () => {
  await page.viewport(900, 900);
  const report = vi.fn<(error: Error) => void>();
  onTestFinished(observeScrollGuards(document, report));
  await render(<PointMenu point={{ clientX: 100, clientY: 100 }} />);
  await expect.element(page.getByRole("menu", { name: "Point menu" })).toBeVisible();
  await new Promise((resolve) => requestAnimationFrame(resolve));
  expect(report).not.toHaveBeenCalled();
});

test("a filterable menu narrows its items as people type and says when none match", async () => {
  await page.viewport(1280, 800);
  await render(
    <MenuFilterProvider>
      <DropdownMenu>
        <DropdownMenuTrigger>Playlists</DropdownMenuTrigger>
        <DropdownMenuContent aria-label="Playlist menu">
          <MenuInput aria-label="Filter playlists" placeholder="Filter playlists" />
          <MenuList>
            {ITEMS.map((item) => (
              <MenuItem key={item}>{item}</MenuItem>
            ))}
          </MenuList>
          <MenuEmpty>No playlists match</MenuEmpty>
        </DropdownMenuContent>
      </DropdownMenu>
    </MenuFilterProvider>,
  );
  await userEvent.click(page.getByRole("button", { name: "Playlists" }));
  const input = page.getByRole("searchbox", { name: "Filter playlists" });
  await expect.element(input).toBeVisible();
  await userEvent.click(input);
  await userEvent.keyboard("ho");
  await expect.element(page.getByRole("menuitem", { name: "Hotel" })).toBeVisible();
  await expect.element(page.getByRole("menuitem", { name: "Alpha" })).not.toBeInTheDocument();
  await userEvent.keyboard("zz");
  await expect.element(page.getByText("No playlists match")).toBeVisible();
});

test("a trigger's menu with room on neither side shifts until it fits instead of scrolling", async () => {
  await page.viewport(900, 600);
  const report = vi.fn<(error: Error) => void>();
  onTestFinished(observeScrollGuards(document, report));
  const items = Array.from({ length: 15 }, (_, index) => `Item ${index}`);
  await render(
    <div style={{ position: "fixed", top: 280, left: 100 }}>
      <DropdownMenu open>
        <DropdownMenuTrigger>Middle actions</DropdownMenuTrigger>
        <DropdownMenuContent aria-label="Middle menu">
          {items.map((item) => (
            <MenuItem key={item}>{item}</MenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>,
  );
  const menu = page.getByRole("menu", { name: "Middle menu" });
  await expect.element(menu).toBeVisible();
  const element = menu.element();
  // Taller than the room below (~300px) and above (~280px) the trigger, but shorter than the window.
  await expect.poll(() => element.getBoundingClientRect().height).toBeGreaterThan(320);
  await expect.poll(() => element.getBoundingClientRect().bottom).toBeLessThanOrEqual(600);
  expect(element.getBoundingClientRect().top).toBeGreaterThanOrEqual(0);
  expect(element.scrollHeight).toBeLessThanOrEqual(element.clientHeight);
  await new Promise((resolve) => requestAnimationFrame(resolve));
  expect(report).not.toHaveBeenCalled();
});
