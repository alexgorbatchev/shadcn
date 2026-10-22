import type { ComponentProps, ReactElement } from "react";
import { useState } from "react";
import { expect, test } from "vitest";
import { render } from "vitest-browser-react";
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

test("default cards ignore pointer movement", async () => {
  const screen = await render(<ReleaseCard />);
  const card = screen.getByRole("region", { name: "Release notes" });

  await card.hover({ position: { x: 40, y: 12 } });
  await screen.getByRole("button", { name: "Open notes" }).click();
  await expect.element(screen.getByText("Notes opened")).toBeVisible();
  expect(readSpotlight(card.element())).toEqual(["", ""]);
});
