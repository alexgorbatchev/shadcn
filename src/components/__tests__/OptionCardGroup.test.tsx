import { expect, onTestFinished, test } from "vitest";
import { render } from "vitest-browser-react";
import { commands, page } from "vitest/browser";
import { DensityProvider } from "../DensityProvider";
import { OptionCard, OptionCardGroup } from "../OptionCardGroup";
import { ThemeProvider } from "../ThemeProvider";
import "../../../.storybook/preview.css";

// Screenshots taken during a hover or selection color transition would differ for the wrong reason.
async function settleTransitions(element: Element): Promise<void> {
  await Promise.all(element.getAnimations({ subtree: true }).map((animation) => animation.finished));
}

test("forced colors keep a selected option card distinguishable from an unselected one", async () => {
  await commands.emulateForcedColors("active");
  onTestFinished(() => commands.emulateForcedColors(null));
  const screen = await render(
    <ThemeProvider forcedTheme="dark">
      <DensityProvider density="comfortable">
        <div className="w-96 p-8">
          <OptionCardGroup aria-label="Deployment strategy">
            <OptionCard value="rolling" label="Rolling update" description="Replaces instances one at a time." />
          </OptionCardGroup>
        </div>
      </DensityProvider>
    </ThemeProvider>,
  );
  const card = screen.getByRole("radio", { name: "Rolling update" });
  await card.hover();
  await settleTransitions(card.element());
  const unselectedImage = await page.screenshot({ element: card, save: false });

  await card.click();
  await expect.element(card).toBeChecked();
  await settleTransitions(card.element());
  expect(await page.screenshot({ element: card, save: false })).not.toBe(unselectedImage);
});

test("radio markers leave room for the option label in touch density", async () => {
  const screen = await render(
    <DensityProvider density="touch">
      <OptionCardGroup aria-label="Deployment strategy">
        <OptionCard value="rolling" label="Rolling update" />
      </OptionCardGroup>
    </DensityProvider>,
  );
  const card = screen.getByRole("radio", { name: "Rolling update" }).element();
  const marker = card.querySelector('[data-slot="option-card-marker"]');
  const label = card.querySelector('[data-slot="option-card-label"]');
  expect(marker?.firstElementChild?.scrollWidth).toBeLessThanOrEqual(marker?.clientWidth ?? 0);
  expect(marker?.getBoundingClientRect().right).toBeLessThan(label?.getBoundingClientRect().left ?? 0);
});
