import { expect, test } from "vitest";
import { userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";
import { DateInputPickerExample } from "../stories/helpers";
import { DirectionProvider } from "../DirectionProvider";
import { DensityProvider } from "../DensityProvider";
import { ThemeProvider } from "../ThemeProvider";
import "../../../.storybook/preview.css";

test.each(["ltr", "rtl"] as const)("date input opens and selects through native keyboard in %s", async (direction) => {
  const screen = await render(
    <ThemeProvider forcedTheme="dark">
      <DensityProvider density="compact">
        <DirectionProvider direction={direction}>
          <DateInputPickerExample dir={direction} defaultMonth={new Date(2026, 9)} today={new Date(2026, 9, 8)} />
        </DirectionProvider>
      </DensityProvider>
    </ThemeProvider>,
  );
  const input = screen.getByRole("textbox", { name: "Subscription date" });
  await input.fill("October 9, 2026");
  await input.click();
  await userEvent.keyboard("{ArrowDown}");
  const dialog = screen.getByRole("dialog", { name: "Choose an appointment date" });
  await expect.element(dialog).toBeVisible();
  await expect.element(dialog).toHaveAttribute("dir", direction);
  await expect.element(dialog.getByRole("button", { name: "Friday, October 9th, 2026, selected" })).toHaveFocus();
  await userEvent.keyboard("{ArrowDown}");
  await expect.element(dialog.getByRole("button", { name: "Friday, October 16th, 2026" })).toHaveFocus();
  await userEvent.keyboard("{Enter}");
  await expect.element(dialog).not.toBeInTheDocument();
  await expect.element(input).toHaveValue("October 16, 2026");
  await expect.element(input).toHaveFocus();
  await input.fill("");
  await expect.element(screen.getByRole("status", { name: "Selected appointment" })).toHaveTextContent("No date");
  await userEvent.keyboard("{ArrowDown}");
  await expect.element(dialog).toBeVisible();
  await expect.element(dialog.getByRole("button", { name: "Today, Thursday, October 8th, 2026" })).toHaveFocus();
  await userEvent.keyboard("{Escape}");
  await expect.element(dialog).not.toBeInTheDocument();
  await expect.element(input).toHaveFocus();
});
