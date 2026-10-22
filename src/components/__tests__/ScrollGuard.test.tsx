import { expect, onTestFinished, test, vi } from "vitest";
import { render } from "vitest-browser-react";
import { Card, CardContent } from "../Card";
import { ScrollArea } from "../ScrollArea";
import { observeScrollGuards } from "../../utils/observeScrollGuards";
import "../../../.storybook/preview.css";

test("cards reject accidental scrolling on their outer surface", async () => {
  const report = vi.fn<(error: Error) => void>();
  onTestFinished(observeScrollGuards(document, report));
  await render(
    <Card className="h-24 w-64 overflow-y-auto" aria-label="Accidental scrolling">
      <CardContent>
        <div className="h-96">Long content</div>
      </CardContent>
    </Card>,
  );
  await expect.poll(() => report.mock.calls.length).toBe(1);
});

test("cards allow a nested ScrollArea to scroll without moving the surface", async () => {
  const report = vi.fn<(error: Error) => void>();
  onTestFinished(observeScrollGuards(document, report));
  const screen = await render(
    <Card className="w-64" role="region" aria-label="Intentional scrolling">
      <CardContent>
        <ScrollArea className="h-24">
          <div className="h-96">Long content</div>
        </ScrollArea>
      </CardContent>
    </Card>,
  );
  const surface = screen.getByRole("region", { name: "Intentional scrolling" }).element();
  const viewport = surface.querySelector('[data-slot="scroll-area-viewport"]');
  expect(viewport).not.toBeNull();
  viewport?.scrollTo({ top: 60, behavior: "instant" });
  await expect.poll(() => viewport?.scrollTop).toBe(60);
  expect(surface.scrollTop).toBe(0);
  expect(report).not.toHaveBeenCalled();
});
