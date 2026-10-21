import type { ReactElement } from "react";
import { afterEach, expect, test } from "vitest";
import { cleanup, render, within, waitFor } from "@testing-library/react";
import { userEvent } from "vitest/browser";
import { PortalProvider } from "../PortalProvider.js";
import { Popover, PopoverContent, PopoverTitle, PopoverTrigger } from "../Popover.js";

afterEach(cleanup);

function Details(): ReactElement {
  return (
    <Popover>
      <PopoverTrigger>Inspect context</PopoverTrigger>
      <PopoverContent>
        <PopoverTitle>Selected page</PopoverTitle>
        <button type="button">Copy context</button>
      </PopoverContent>
    </Popover>
  );
}

test("renders native popovers inside a supplied shadow root and restores trigger focus", async () => {
  const host = document.createElement("section");
  document.body.append(host);
  const shadowRoot = host.attachShadow({ mode: "open" });
  const mount = document.createElement("div");
  shadowRoot.append(mount);
  try {
    const view = render(
      <PortalProvider container={shadowRoot}>
        <Details />
      </PortalProvider>,
      { container: mount },
    );
    const trigger = view.getByRole("button", { name: "Inspect context" });
    await userEvent.click(trigger);
    const popup = await waitFor(() => {
      const element = shadowRoot.querySelector('[role="dialog"]');
      expect(element).not.toBeNull();
      if (!(element instanceof HTMLElement)) throw new Error("Missing native popover");
      return element;
    });
    expect(within(popup).getByRole("heading", { name: "Selected page" })).toBeVisible();
    expect(document.body.querySelector('[role="dialog"]')).toBeNull();
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(shadowRoot.querySelector('[role="dialog"]')).toBeNull());
    await waitFor(() => expect(shadowRoot.activeElement).toBe(trigger));
  } finally {
    cleanup();
    host.remove();
  }
});

test("uses the nearest provider without affecting the outer workspace", async () => {
  const outer = document.createElement("div");
  const inner = document.createElement("div");
  document.body.append(outer, inner);
  try {
    const view = render(
      <PortalProvider container={outer}>
        <PortalProvider container={inner}>
          <Details />
        </PortalProvider>
      </PortalProvider>,
    );
    await userEvent.click(view.getByRole("button", { name: "Inspect context" }));
    await within(inner).findByRole("dialog", { name: "Selected page" });
    expect(within(outer).queryByRole("dialog")).toBeNull();
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(within(inner).queryByRole("dialog")).toBeNull());
  } finally {
    cleanup();
    outer.remove();
    inner.remove();
  }
});
