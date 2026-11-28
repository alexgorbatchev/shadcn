import type { ReactElement, ReactNode } from "react";
import { expect, onTestFinished, test } from "vitest";
import { render } from "vitest-browser-react";
import { commands, page, userEvent } from "vitest/browser";
import { Button } from "../Button";
import { Card, CardContent } from "../Card";
import { Checkbox } from "../Checkbox";
import { Field, FieldContent, FieldLabel, FieldTitle } from "../Field";
import { RadioGroup, RadioGroupItem } from "../RadioGroup";
import { Switch } from "../Switch";
import { ThemeProvider } from "../ThemeProvider";
import { Tree, TreeItem, hotkeysCoreFeature, selectionFeature, syncDataLoaderFeature, useTree } from "../tree";
import "../../../.storybook/preview.css";

async function forceColors(): Promise<void> {
  await commands.emulateForcedColors("active");
  onTestFinished(() => commands.emulateForcedColors(null));
}

function Light({ children }: { children: ReactNode }): ReactElement {
  return (
    <ThemeProvider forcedTheme="light">
      <div className="flex w-96 flex-col gap-4 p-8">{children}</div>
    </ThemeProvider>
  );
}

async function shot(element: HTMLElement): Promise<string> {
  await Promise.all(element.getAnimations({ subtree: true }).map((animation) => animation.finished));
  return page.screenshot({ element, save: false });
}

test("forced colors outline every keyboard-focused control", async () => {
  await forceColors();
  const screen = await render(
    <Light>
      <Button>First</Button>
      <Button variant="outline">Second</Button>
    </Light>,
  );
  await userEvent.keyboard("{Tab}");
  const first = screen.getByRole("button", { name: "First" }).element();
  expect(document.activeElement).toBe(first);
  const style = getComputedStyle(first);
  expect(style.outlineStyle).toBe("solid");
  expect(style.outlineWidth).toBe("2px");
  await userEvent.keyboard("{Tab}");
  expect(getComputedStyle(screen.getByRole("button", { name: "Second" }).element()).outlineStyle).toBe("solid");
});

test("forced colors keep a checked radio, checkbox and switch distinguishable from unchecked ones", async () => {
  await forceColors();
  const screen = await render(
    <Light>
      <RadioGroup aria-label="Direction" defaultValue="quiet" className="flex gap-4">
        <RadioGroupItem value="quiet" aria-label="Quiet" />
        <RadioGroupItem value="bold" aria-label="Bold" />
      </RadioGroup>
      <div className="flex gap-4">
        <Checkbox aria-label="Checked" defaultChecked />
        <Checkbox aria-label="Unchecked" />
      </div>
      <div className="flex gap-4">
        <Switch aria-label="On" defaultChecked />
        <Switch aria-label="Off" />
      </div>
    </Light>,
  );
  const pairs = [
    ["radio", "Quiet", "Bold"],
    ["checkbox", "Checked", "Unchecked"],
    ["switch", "On", "Off"],
  ] as const;
  for (const [role, on, off] of pairs) {
    const checked = screen.getByRole(role, { name: on, exact: true }).element();
    const unchecked = screen.getByRole(role, { name: off, exact: true }).element();
    if (!(checked instanceof HTMLElement && unchecked instanceof HTMLElement)) throw new Error(`missing ${role}`);
    expect({ role, same: (await shot(checked)) === (await shot(unchecked)) }).toEqual({ role, same: false });
  }
});

test("forced colors mark the chosen card of a selectable field group", async () => {
  await forceColors();
  const screen = await render(
    <Light>
      <RadioGroup aria-label="Hero direction" defaultValue="quiet">
        {["quiet", "bold"].map((value) => (
          <FieldLabel key={value} htmlFor={`direction-${value}`} selectable>
            <Field orientation="horizontal">
              <FieldContent>
                <FieldTitle>{value}</FieldTitle>
              </FieldContent>
              <RadioGroupItem id={`direction-${value}`} value={value} aria-label={value} />
            </Field>
          </FieldLabel>
        ))}
      </RadioGroup>
    </Light>,
  );
  const card = (name: string) => screen.getByRole("radio", { name }).element().closest<HTMLElement>("label");
  const chosen = card("quiet");
  const other = card("bold");
  if (!chosen || !other) throw new Error("missing cards");
  expect(getComputedStyle(chosen).outlineStyle).toBe("solid");
  expect(getComputedStyle(other).outlineStyle).toBe("none");
});

function SelectedTree(): ReactElement {
  const tree = useTree<string>({
    rootItemId: "root",
    initialState: { selectedItems: ["Plan"] },
    getItemName: (item) => item.getItemData(),
    isItemFolder: (item) => item.getId() === "root",
    dataLoader: { getItem: (id) => id, getChildren: (id) => (id === "root" ? ["Plan", "Notes"] : []) },
    features: [syncDataLoaderFeature, hotkeysCoreFeature, selectionFeature],
  });
  return (
    <Light>
      <Tree tree={tree} label="Pages" variant="sidebar" renderItem={(item) => <TreeItem item={item} />} />
    </Light>
  );
}

test("forced colors fill the selected tree row with the system selection colours", async () => {
  await forceColors();
  const screen = await render(<SelectedTree />);
  const selected = screen.getByRole("treeitem", { name: "Plan" }).element();
  const other = screen.getByRole("treeitem", { name: "Notes" }).element();
  const probe = document.createElement("div");
  probe.style.backgroundColor = "Highlight";
  document.body.append(probe);
  onTestFinished(() => probe.remove());
  const highlight = getComputedStyle(probe).backgroundColor;
  expect(getComputedStyle(selected).backgroundColor).toBe(highlight);
  expect(getComputedStyle(other).backgroundColor).not.toBe(highlight);
  // Without this, Chrome paints a Canvas backplate behind the HighlightText title, hiding it.
  expect(getComputedStyle(selected).forcedColorAdjust).toBe("none");
  expect(getComputedStyle(other).forcedColorAdjust).toBe("auto");
});

/** WCAG relative luminance of an `rgb()` colour. */
function luminance(color: string): number {
  const channels = (color.match(/[\d.]+/g) ?? []).slice(0, 3).map(Number);
  const [r = 0, g = 0, b = 0] = channels.map((value) => {
    const c = value / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

test.each(["light", "dark"] as const)(
  "with prefers-contrast: more, card borders measure at least 3:1 against the %s page",
  async (theme) => {
    await commands.emulateContrast("more");
    onTestFinished(() => commands.emulateContrast(null));
    const screen = await render(
      <ThemeProvider forcedTheme={theme}>
        <div data-testid="page" className="bg-background p-8">
          <Card>
            <CardContent>Card</CardContent>
          </Card>
        </div>
      </ThemeProvider>,
    );
    const card = screen.getByText("Card").element().closest<HTMLElement>('[data-slot="card"]');
    if (!card) throw new Error("missing card");
    const pageColor = getComputedStyle(screen.getByTestId("page").element()).backgroundColor;
    const [lighter, darker] = [luminance(getComputedStyle(card).borderTopColor), luminance(pageColor)].sort(
      (a, b) => b - a,
    );
    expect((lighter + 0.05) / ((darker ?? 0) + 0.05)).toBeGreaterThanOrEqual(3);
  },
);
