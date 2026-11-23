import { expect, test } from "vitest";
import { page } from "vitest/browser";
import { render } from "vitest-browser-react";
import { Button } from "../Button";
import { DensityProvider } from "../DensityProvider";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../DropdownMenu";
import { Input } from "../Input";
import "../../../.storybook/preview.css";

test("touch density enlarges controls and follows the provider through a portal", async () => {
  await page.viewport(390, 844);
  const screen = await render(
    <DensityProvider density="touch">
      <Button>Save</Button>
      <Input aria-label="Search" />
      <DensityProvider density="compact">
        <Button>Compact action</Button>
      </DensityProvider>
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button />}>Actions</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Edit item</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </DensityProvider>,
  );
  expect(screen.getByRole("button", { name: "Save" }).element().getBoundingClientRect().height).toBe(44);
  expect(getComputedStyle(screen.getByRole("textbox", { name: "Search" }).element()).fontSize).toBe("16px");
  expect(screen.getByRole("button", { name: "Compact action" }).element().getBoundingClientRect().height).toBe(20);

  await screen.getByRole("button", { name: "Actions" }).click();
  const item = page.getByRole("menuitem", { name: "Edit item" });
  await expect.element(item).toBeVisible();
  expect(item.element().getBoundingClientRect().height).toBeGreaterThanOrEqual(44);
});

test("mobile opt-in updates density on resize without remounting inputs", async () => {
  await page.viewport(1280, 800);
  const screen = await render(
    <DensityProvider touchOnMobile>
      <Input aria-label="Search" defaultValue="Original" />
    </DensityProvider>,
  );
  const input = screen.getByRole("textbox", { name: "Search" });
  expect(input.element().getBoundingClientRect().height).toBe(28);
  await input.fill("Edited");
  await page.viewport(390, 844);
  await expect.poll(() => input.element().getBoundingClientRect().height).toBe(44);
  await expect.element(input).toHaveValue("Edited");
  await page.viewport(1280, 800);
  await expect.poll(() => input.element().getBoundingClientRect().height).toBe(28);
});

test("desktop density pairs larger type with shorter controls and retains responsive touch sizing", async () => {
  await page.viewport(1280, 800);
  const screen = await render(
    <DensityProvider density="desktop" touchOnMobile>
      <p>Page content</p>
      <Button>Save</Button>
      <Input aria-label="Search" />
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button />}>Actions</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Edit item</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </DensityProvider>,
  );
  const save = screen.getByRole("button", { name: "Save" });
  const input = screen.getByRole("textbox", { name: "Search" });
  const content = screen.getByText("Page content");
  expect(save.element().getBoundingClientRect().height).toBe(34);
  expect(input.element().getBoundingClientRect().height).toBe(34);
  expect(getComputedStyle(save.element()).fontSize).toBe("15px");
  expect(getComputedStyle(input.element()).fontSize).toBe("17px");
  expect(getComputedStyle(content.element()).fontSize).toBe("17px");

  await screen.getByRole("button", { name: "Actions" }).click();
  const item = page.getByRole("menuitem", { name: "Edit item" });
  await expect.element(item).toBeVisible();
  expect(getComputedStyle(item.element()).fontSize).toBe("15px");
  await item.click();

  await page.viewport(390, 844);
  await expect.poll(() => save.element().getBoundingClientRect().height).toBe(44);
  expect(input.element().getBoundingClientRect().height).toBe(44);
  expect(getComputedStyle(content.element()).fontSize).toBe("16px");
});
