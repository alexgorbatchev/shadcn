import type { PropsWithChildren, ReactElement } from "react";
import type { PortalContainer } from "../../../../portal/types.js";
import { createRef } from "react";
import { afterEach, expect, test } from "vitest";
import { cleanup, renderHook } from "@testing-library/react";
import { PortalProvider } from "../../../PortalProvider.js";
import { useResolvedPortalContainer } from "../useResolvedPortalContainer.js";

afterEach(cleanup);

test("uses the intentional body fallback only when no container is provided", () => {
  const { result } = renderHook(useResolvedPortalContainer);
  expect(result.current.container).toBeUndefined();
  expect(result.current.isReady).toBe(true);
});

test("defers a missing container then tracks replacement and removal", () => {
  let provided: PortalContainer = null;
  function Wrapper({ children }: PropsWithChildren): ReactElement {
    return <PortalProvider container={provided}>{children}</PortalProvider>;
  }
  const { result, rerender } = renderHook(useResolvedPortalContainer, { wrapper: Wrapper });
  expect(result.current.isReady).toBe(false);
  const first = document.createElement("div");
  provided = first;
  rerender();
  expect(result.current.container).toBe(first);
  expect(result.current.isReady).toBe(true);
  const second = document.createElement("div").attachShadow({ mode: "open" });
  provided = second;
  rerender();
  expect(result.current.container).toBe(second);
  provided = null;
  rerender();
  expect(result.current.container).toBeNull();
  expect(result.current.isReady).toBe(false);
});

test("resolves native refs after mounting and observes their removal", () => {
  const provided = createRef<HTMLDivElement>();
  function Wrapper({ children }: PropsWithChildren): ReactElement {
    return <PortalProvider container={provided}>{children}</PortalProvider>;
  }
  const { result, rerender } = renderHook(useResolvedPortalContainer, { wrapper: Wrapper });
  expect(result.current.isReady).toBe(false);
  provided.current = document.createElement("div");
  rerender();
  expect(result.current.container).toBe(provided.current);
  expect(result.current.isReady).toBe(true);
  provided.current = null;
  rerender();
  expect(result.current.container).toBeNull();
  expect(result.current.isReady).toBe(false);
});
