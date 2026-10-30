import { assert, expect, test } from "vitest";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";
import { NativeTree } from "./fixtures";

for (const [role, name] of [
  ["button", "Inspect"],
  ["link", "Help"],
  ["textbox", "Notes"],
  ["combobox", "Choice"],
  ["textbox", "Rich notes"],
] as const)
  test(`embedded ${name} retains keyboard ownership without mutating native tree focus`, async () => {
    const screen = await render(<NativeTree />);
    const first = page.getByRole("treeitem", { name: "First" });
    await first.click();
    const control = page.getByRole(role, { name, exact: true });
    await control.click();
    await userEvent.keyboard("{ArrowDown}{Home}{End}{Control>}{Shift>}d{/Shift}{/Control}");
    await expect.element(screen.getByRole("status", { name: "Focused item" })).toHaveTextContent("First");
    await expect.element(first).toHaveAttribute("tabindex", "0");
    await expect.element(control).toHaveFocus();
    await first.click();
    await userEvent.keyboard("{ArrowDown}");
    await expect.element(screen.getByRole("status", { name: "Focused item" })).toHaveTextContent("Second");
    await expect.element(page.getByRole("treeitem", { name: "Second" })).toHaveAttribute("tabindex", "0");
  });

test("nested native trees update only the owning tree", async () => {
  const screen = await render(<NativeTree hasNestedTree />);
  await page.getByRole("treeitem", { name: "First", exact: true }).click();
  await page.getByRole("treeitem", { name: "Nested First", exact: true }).click();
  await userEvent.keyboard("{ArrowDown}");
  await expect
    .element(screen.getByRole("status", { name: "Nested Focused item", exact: true }))
    .toHaveTextContent("Second");
  await expect.element(screen.getByRole("status", { name: "Focused item", exact: true })).toHaveTextContent("First");
  await expect.element(page.getByRole("treeitem", { name: "First", exact: true })).toHaveAttribute("tabindex", "0");
});

for (const name of ["Audio preview", "Video preview"]) {
  test(`native ${name} controls retain arrow-key volume adjustment`, async () => {
    const screen = await render(<NativeTree />);
    const first = page.getByRole("treeitem", { name: "First" });
    await first.click();
    const media = page.getByLabelText(name).element();
    assert.instanceOf(media, HTMLMediaElement);
    await expect.poll(() => media.readyState).toBeGreaterThan(0);
    media.focus();
    await userEvent.keyboard("{ArrowDown}");
    await expect.element(screen.getByRole("status", { name: "Focused item" })).toHaveTextContent("First");
    await expect.element(first).toHaveAttribute("tabindex", "0");
    await expect.poll(() => media.volume).toBeLessThan(1);
  });
}

test("cancelled native key events leave focus state and subsequent pressed keys intact", async () => {
  const screen = await render(<NativeTree />);
  const first = page.getByRole("treeitem", { name: "First" });
  await first.click();
  const element = first.element();
  const cancel = (event: Event): void => event.preventDefault();
  element.addEventListener("keydown", cancel);
  try {
    await userEvent.keyboard("{ArrowDown}");
    await expect.element(screen.getByRole("status", { name: "Focused item" })).toHaveTextContent("First");
    await expect.element(first).toHaveAttribute("tabindex", "0");
  } finally {
    element.removeEventListener("keydown", cancel);
  }
  await userEvent.keyboard("{ArrowDown}");
  await expect.element(page.getByRole("treeitem", { name: "Second" })).toHaveFocus();
});

test("modifiers pressed in an embedded control retain their meaning on return to a tree row", async () => {
  const screen = await render(<NativeTree />);
  const first = page.getByRole("treeitem", { name: "First" });
  await first.click();
  await page.getByRole("button", { name: "Inspect" }).click();
  await userEvent.keyboard("{Control>}");
  try {
    first.element().focus();
    await userEvent.keyboard("{ArrowDown}");
    await expect.element(screen.getByRole("status", { name: "Focused item" })).toHaveTextContent("First");
    await expect.element(first).toHaveAttribute("tabindex", "0");
  } finally {
    await userEvent.keyboard("{/Control}");
  }
  await userEvent.keyboard("{ArrowDown}");
  await expect.element(page.getByRole("treeitem", { name: "Second" })).toHaveFocus();
});

test("accepted row keys release on controls after ordinary keyup", async () => {
  await render(<NativeTree />);
  const first = page.getByRole("treeitem", { name: "First" });
  const action = page.getByRole("button", { name: "Inspect" });
  await first.click();
  await userEvent.keyboard("{Control>}{Space>}");
  await expect.element(first).toHaveAttribute("aria-selected", "false");
  try {
    action.element().focus();
    await userEvent.keyboard("{/Space}");
    first.element().focus();
    await userEvent.keyboard("{Space}");
    await expect.element(first).toHaveAttribute("aria-selected", "true");
    await expect.element(first).toHaveAttribute("tabindex", "0");
  } finally {
    await userEvent.keyboard("{/Control}");
  }
});

test("accepted row keys release on controls even when keyup is cancelled", async () => {
  await render(<NativeTree />);
  const first = page.getByRole("treeitem", { name: "First" });
  const action = page.getByRole("button", { name: "Inspect" });
  await first.click();
  await userEvent.keyboard("{Control>}{Space>}");
  await expect.element(first).toHaveAttribute("aria-selected", "false");
  const cancel = (event: Event): void => event.preventDefault();
  action.element().addEventListener("keyup", cancel);
  try {
    action.element().focus();
    await userEvent.keyboard("{/Space}");
    first.element().focus();
    await userEvent.keyboard("{Space}");
    await expect.element(first).toHaveAttribute("aria-selected", "true");
    await expect.element(first).toHaveAttribute("tabindex", "0");
  } finally {
    action.element().removeEventListener("keyup", cancel);
    await userEvent.keyboard("{/Control}");
  }
});

for (const rowTag of ["button", "a"] as const) {
  test(`registered native ${rowTag} rows remain tree keyboard owners inside an ancestor form`, async () => {
    const screen = await render(<NativeTree rowTag={rowTag} />);
    await page.getByRole("treeitem", { name: "First" }).click();
    await userEvent.keyboard("{ArrowDown}");
    await expect.element(screen.getByRole("status", { name: "Focused item" })).toHaveTextContent("Second");
    await expect.element(page.getByRole("treeitem", { name: "Second" })).toHaveFocus();
  });
}

test("native rename and search input hotkeys still complete and cancel", async () => {
  const screen = await render(<NativeTree />);
  await page.getByRole("treeitem", { name: "First" }).click();
  await userEvent.keyboard("{F2}");
  const rename = page.getByRole("textbox", { name: "Rename tree item" });
  await expect.element(rename).toHaveFocus();
  await rename.fill("New name");
  await userEvent.keyboard("{Enter}");
  await expect.element(rename).not.toBeInTheDocument();
  await expect.element(screen.getByRole("status", { name: "Renamed item" })).toHaveTextContent("New name");
  await userEvent.keyboard("{F2}{Escape}");
  await expect.element(rename).not.toBeInTheDocument();
  await expect.element(page.getByRole("treeitem", { name: "First" })).toHaveFocus();
  await userEvent.keyboard("s");
  const search = page.getByRole("textbox", { name: "Search tree" });
  await expect.element(search).toHaveFocus();
  await search.fill("Second");
  await expect.element(screen.getByRole("status", { name: "Focused item" })).toHaveTextContent("Second");
  await userEvent.keyboard("{Enter}");
  await expect.element(search).not.toBeInTheDocument();
  await expect.element(page.getByRole("treeitem", { name: "Second" })).toHaveAttribute("aria-selected", "true");
  await expect.element(page.getByRole("treeitem", { name: "Second" })).toHaveFocus();
  await userEvent.keyboard("f");
  await expect.element(search).toHaveFocus();
  await userEvent.keyboard("{Escape}");
  await expect.element(search).not.toBeInTheDocument();
});
