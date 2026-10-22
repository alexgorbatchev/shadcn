import type { ComponentProps, ReactElement } from "react";
import { useState } from "react";
import { expect, onTestFinished, test } from "vitest";
import { render } from "vitest-browser-react";
import { commands, page, userEvent } from "vitest/browser";
import { Button } from "../Button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../Card";
import { DensityProvider } from "../DensityProvider";
import { ThemeProvider } from "../ThemeProvider";
import "../../../.storybook/preview.css";

type ReleaseCardProps = Pick<ComponentProps<typeof Card>, "variant">;

function ReleaseCard({ variant }: ReleaseCardProps): ReactElement {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <ThemeProvider forcedTheme="dark">
      <DensityProvider density="comfortable">
        <div className="flex flex-col gap-8 p-8">
          <Card variant={variant} role="region" aria-label="Release notes" className="w-80">
            <CardHeader>
              <CardTitle>Release notes</CardTitle>
            </CardHeader>
            <CardContent>{isOpen ? "Notes opened" : "Version 2 is ready."}</CardContent>
            <CardFooter>
              <Button onClick={() => setIsOpen(true)}>Open notes</Button>
            </CardFooter>
          </Card>
          <p>Outside the card</p>
        </div>
      </DensityProvider>
    </ThemeProvider>
  );
}

function ScrollingReleaseCard(): ReactElement {
  const [isWide, setIsWide] = useState(false);
  return (
    <ThemeProvider forcedTheme="dark">
      <DensityProvider density="comfortable">
        <div role="region" aria-label="Release feed" tabIndex={0} className="h-96 overflow-y-auto">
          <div className="flex h-[200vh] items-start justify-center pt-8">
            <Card variant="hero" role="region" aria-label="Release notes" className={isWide ? "w-96" : "w-80"}>
              <CardHeader>
                <CardTitle>Release notes</CardTitle>
              </CardHeader>
              <CardContent>Version 2 is ready.</CardContent>
              <CardFooter>
                <Button onClick={() => setIsWide(true)}>Widen card</Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </DensityProvider>
    </ThemeProvider>
  );
}

// Playwright hover positions are relative to the padding box; the spotlight is positioned in the border box.
function borderBoxOffset(element: Element, x: number, y: number): string[] {
  const style = getComputedStyle(element);
  return [`${x + Number.parseFloat(style.borderLeftWidth)}px`, `${y + Number.parseFloat(style.borderTopWidth)}px`];
}

function readSpotlight(element: Element): string[] {
  const style = getComputedStyle(element);
  return [style.getPropertyValue("--card-spotlight-x"), style.getPropertyValue("--card-spotlight-y")];
}

test("hero cards follow a native pointer, glow while hovered, and keep content interactive", async () => {
  const screen = await render(<ReleaseCard variant="hero" />);
  const card = screen.getByRole("region", { name: "Release notes" });

  await card.hover({ position: { x: 40, y: 12 } });
  await expect.poll(() => readSpotlight(card.element())).toEqual(borderBoxOffset(card.element(), 40, 12));
  await expect.poll(() => getComputedStyle(card.element(), "::before").opacity).toBe("1");

  await card.hover({ position: { x: 200, y: 30 } });
  await expect.poll(() => readSpotlight(card.element())).toEqual(borderBoxOffset(card.element(), 200, 30));

  await screen.getByRole("button", { name: "Open notes" }).click();
  await expect.element(screen.getByText("Notes opened")).toBeVisible();

  await screen.getByText("Outside the card").hover();
  await expect.poll(() => readSpotlight(card.element())).toEqual(["", ""]);
  await expect.poll(() => getComputedStyle(card.element(), "::before").opacity).toBe("0");
});

test("hero spotlight stays under a stationary pointer while the card scrolls, moves, or resizes", async () => {
  const pointer = { clientX: 0, clientY: 0 };
  const recordPointer = (event: PointerEvent): void => {
    pointer.clientX = event.clientX;
    pointer.clientY = event.clientY;
  };
  document.addEventListener("pointermove", recordPointer);
  onTestFinished(() => document.removeEventListener("pointermove", recordPointer));
  const pointerOnCard = (card: Element): string[] => {
    const bounds = card.getBoundingClientRect();
    return [`${Math.round(pointer.clientX - bounds.left)}px`, `${Math.round(pointer.clientY - bounds.top)}px`];
  };

  const screen = await render(<ScrollingReleaseCard />);
  const card = screen.getByRole("region", { name: "Release notes" });
  const feed = screen.getByRole("region", { name: "Release feed" });

  await commands.nativeWheel('[aria-label="Release notes"]', 40);
  await expect.poll(() => feed.element().scrollTop).toBe(40);
  await expect.poll(() => readSpotlight(card.element())).toEqual(pointerOnCard(card.element()));

  await page.viewport(window.innerWidth + 100, window.innerHeight);
  await expect.poll(() => readSpotlight(card.element())).toEqual(pointerOnCard(card.element()));

  screen.getByRole("button", { name: "Widen card" }).element().focus();
  await userEvent.keyboard("{Enter}");
  await expect.poll(() => card.element().getBoundingClientRect().width).toBeGreaterThan(320);
  await expect.poll(() => readSpotlight(card.element())).toEqual(pointerOnCard(card.element()));

  await feed.hover({ position: { x: 4, y: 4 } });
  await expect.poll(() => readSpotlight(card.element())).toEqual(["", ""]);
  feed.element().scrollTop = 0;
  await new Promise((resolve) => feed.element().addEventListener("scroll", resolve, { once: true }));
  await new Promise(requestAnimationFrame);
  await new Promise(requestAnimationFrame);
  expect(readSpotlight(card.element())).toEqual(["", ""]);
});

test("forced colors render a hovered hero card exactly like a default card", async () => {
  await commands.emulateForcedColors("active");
  onTestFinished(() => commands.emulateForcedColors(null));
  const screen = await render(<ReleaseCard />);
  const card = screen.getByRole("region", { name: "Release notes" });
  await card.hover({ position: { x: 40, y: 0 } });
  const defaultImage = await page.screenshot({ element: card, save: false });

  await screen.rerender(<ReleaseCard variant="hero" />);
  await card.hover({ position: { x: 4, y: 0 } });
  await expect.poll(() => readSpotlight(card.element())).toEqual(borderBoxOffset(card.element(), 4, 0));
  expect(await page.screenshot({ element: card, save: false })).toBe(defaultImage);
});

test("default cards ignore pointer movement", async () => {
  const screen = await render(<ReleaseCard />);
  const card = screen.getByRole("region", { name: "Release notes" });

  await card.hover({ position: { x: 40, y: 12 } });
  await screen.getByRole("button", { name: "Open notes" }).click();
  await expect.element(screen.getByText("Notes opened")).toBeVisible();
  expect(readSpotlight(card.element())).toEqual(["", ""]);
});
