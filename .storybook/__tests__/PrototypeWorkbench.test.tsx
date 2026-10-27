import { afterEach, expect, test } from "vitest";
import { render } from "vitest-browser-react";
import { page } from "vitest/browser";
import { Workbench } from "../../templates/prototype/src/components/Workbench";
import "../../templates/prototype/src/styles.css";

const original = window.location.href;
afterEach(() => {
  window.history.replaceState(null, "", original);
});

function openCanvas(prototype: string, parameters = "") {
  window.history.replaceState(null, "", `?canvas=1&prototype=${prototype}${parameters}`);
  return render(<Workbench />);
}

test("dashboard filtering updates the project counts and rows", async () => {
  await openCanvas("dashboard");
  await page.getByLabelText("Team", { exact: true }).selectOptions("Engineering");
  await expect.element(page.getByRole("row")).toHaveLength(2);
  await page.getByLabelText("Team", { exact: true }).selectOptions("Product");
  await expect.element(page.getByRole("row")).toHaveLength(3);
});

test("project editing saves both fields, cancellation discards changes, and search handles empty results", async () => {
  await openCanvas("projects");
  await page.getByRole("button", { name: "Edit Onboarding redesign", exact: true }).click();
  await page.getByLabelText("Project name", { exact: true }).fill("Orbit");
  await page.getByLabelText("Owner", { exact: true }).fill("Katherine Johnson");
  await page.getByRole("button", { name: "Save project", exact: true }).click();
  await expect.element(page.getByRole("status")).toHaveTextContent("Saved Orbit");
  await expect.element(page.getByRole("cell", { name: "Katherine Johnson", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Edit Orbit", exact: true }).click();
  await page.getByLabelText("Project name", { exact: true }).fill("Discard me");
  await page.getByRole("button", { name: "Cancel", exact: true }).click();
  await expect.element(page.getByRole("cell", { name: "Orbit", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Edit Orbit", exact: true }).click();
  await page.getByRole("button", { name: "Close", exact: true }).click();
  await page.getByLabelText("Search projects", { exact: true }).fill("absent");
  await expect.element(page.getByText("No matching projects", { exact: true })).toBeVisible();
});

test("settings save edited values and both notification states", async () => {
  await openCanvas("settings", "&theme=light&density=compact");
  await page.getByLabelText("Workspace name", { exact: true }).fill("Orbit");
  await page.getByLabelText("Contact email", { exact: true }).fill("orbit@example.com");
  await page.getByRole("button", { name: "Save settings", exact: true }).click();
  await expect
    .element(page.getByRole("status"))
    .toHaveTextContent("Saved Orbit. Email updates enabled for orbit@example.com.");
  await page.getByRole("switch", { name: "Email updates", exact: true }).click();
  await page.getByRole("button", { name: "Save settings", exact: true }).click();
  await expect
    .element(page.getByRole("status"))
    .toHaveTextContent("Saved Orbit. Email updates disabled for orbit@example.com.");
});

test.each([
  ["empty", "No data yet"],
  ["loading", "Loading sample data…"],
  ["error", "Unable to load data"],
])("renders the %s scenario", async (scenario, text) => {
  await openCanvas("dashboard", `&scenario=${scenario}`);
  await expect.element(page.getByText(text, { exact: true })).toBeVisible();
});

test("unknown prototype URLs show an explicit error", async () => {
  await openCanvas("missing");
  await expect.element(page.getByRole("alert")).toHaveTextContent("Unknown prototype: missing");
});

test("workbench controls update the canvas URL and reset replaces the iframe", async () => {
  window.history.replaceState(null, "", "?prototype=dashboard");
  const screen = await render(<Workbench />);
  const firstFrame = screen.container.querySelector("iframe");
  await page.getByLabelText("Prototype", { exact: true }).selectOptions("projects");
  await page.getByLabelText("Scenario", { exact: true }).selectOptions("error");
  await page.getByLabelText("Theme", { exact: true }).selectOptions("light");
  await page.getByLabelText("Density", { exact: true }).selectOptions("compact");
  await page.getByLabelText("Viewport", { exact: true }).selectOptions("390");
  const link = page.getByRole("link", { name: "Open screen", exact: true });
  await expect
    .element(link)
    .toHaveAttribute("href", "?canvas=1&prototype=projects&scenario=error&theme=light&density=compact");
  await page.getByRole("button", { name: "Reset data", exact: true }).click();
  expect(screen.container.querySelector("iframe")).not.toBe(firstFrame);
  await page.getByLabelText("Theme", { exact: true }).selectOptions("dark");
  await page.getByLabelText("Density", { exact: true }).selectOptions("comfortable");
  await page.getByLabelText("Scenario", { exact: true }).selectOptions("populated");
});

test("workbench defaults and unknown selections remain understandable", async () => {
  window.history.replaceState(null, "", "?prototype=missing");
  const screen = await render(<Workbench />);
  await expect.element(page.getByText("Choose a prototype", { exact: false })).toBeVisible();
  await screen.unmount();
  window.history.replaceState(null, "", "?");
  await render(<Workbench />);
  await expect.element(page.getByLabelText("Prototype", { exact: true })).toHaveValue("dashboard");
});
