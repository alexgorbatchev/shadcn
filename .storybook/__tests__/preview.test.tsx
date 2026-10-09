import { composeStory } from "@storybook/react-vite";
import { afterEach as auditAccessibility } from "@storybook/addon-a11y/preview";
import { createPortal } from "react-dom";
import { expect, test } from "vitest";
import { Button } from "../../src/components/Button";
import preview from "../preview";

test("the preview audits readable component text", async () => {
  const story = composeStory(
    { args: { children: "Save changes" } },
    { component: Button },
    { ...preview, afterEach: auditAccessibility },
  );
  await story.run();
  expect(story.reporting.reports).toEqual([
    expect.objectContaining({
      type: "a11y",
      status: "passed",
      result: expect.objectContaining({ passes: [expect.objectContaining({ id: "color-contrast" })] }),
    }),
  ]);
});

test("the preview reports insufficient text contrast outside the story canvas", async () => {
  const story = composeStory(
    {
      // Intentionally inaccessible colors verify the actual browser audit and its portal scope.
      render: () =>
        createPortal(<p style={{ color: "#777777", backgroundColor: "#888888" }}>Portaled message</p>, document.body),
    },
    { title: "Contrast detector" },
    { ...preview, afterEach: auditAccessibility },
  );
  await story.run();
  expect(story.reporting.reports).toEqual([
    expect.objectContaining({
      type: "a11y",
      status: "failed",
      result: expect.objectContaining({ violations: [expect.objectContaining({ id: "color-contrast" })] }),
    }),
  ]);
});
