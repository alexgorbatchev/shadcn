import { act, cleanup } from "@testing-library/react";
import { afterEach, describe, expect, test } from "vitest";
import { userEvent } from "vitest/browser";

import { renderReceiptFocusHarness } from "./parentHelpers.js";

afterEach(cleanup);

describe("useReceiptFocus", () => {
  test("moves keyboard focus from a removed action to its receipt", async () => {
    const rendered = renderReceiptFocusHarness();
    await act(async () => {
      await userEvent.click(rendered.getByRole("button", { name: "Approve" }));
    });
    expect(document.activeElement).toBe(rendered.getByRole("status"));
  });

  test("retains focus within a shadow-root conversation when its action disappears", async () => {
    const host = document.createElement("div");
    document.body.append(host);
    const shadowRoot = host.attachShadow({ mode: "open" });
    const container = document.createElement("div");
    shadowRoot.append(container);
    try {
      const rendered = renderReceiptFocusHarness(container);
      await act(async () => {
        await userEvent.click(rendered.getByRole("button", { name: "Approve" }));
      });
      expect(shadowRoot.activeElement).toBe(rendered.getByRole("status"));
    } finally {
      cleanup();
      host.remove();
    }
  });
});
