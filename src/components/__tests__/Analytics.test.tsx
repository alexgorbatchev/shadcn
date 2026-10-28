import "../../../.storybook/preview.css";
import { StrictMode, type ReactElement } from "react";
import { afterEach, expect, test, vi } from "vitest";
import { cleanup, render, waitFor, within } from "@testing-library/react";
import { userEvent } from "vitest/browser";
import { AnalyticsProvider, AnalyticsScope, AnalyticsImpression, useAnalytics } from "../analytics/index.js";
import { Button } from "../Button.js";
import { Switch } from "../Switch.js";
import { Input } from "../Input.js";
import { PaginationLink } from "../Pagination.js";
import { ImagePicker } from "../ImagePicker.js";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "../Dialog.js";

afterEach(cleanup);

test("tracks pointer and keyboard activation once, with scope and explicit metadata", async () => {
  const track = vi.fn();
  const action = vi.fn();
  const view = render(
    <StrictMode>
      <AnalyticsProvider transport={{ track }}>
        <AnalyticsScope name="settings" properties={{ surface: "page", shared: "outer" }}>
          <AnalyticsScope name="billing" properties={{ shared: "inner" }}>
            <Button analytics={{ id: "upgrade", properties: { plan: "pro" } }} onClick={action}>
              Upgrade
            </Button>
          </AnalyticsScope>
        </AnalyticsScope>
      </AnalyticsProvider>
    </StrictMode>,
  );
  await userEvent.click(view.getByRole("button"));
  await userEvent.keyboard("{Enter}");
  expect(action).toHaveBeenCalledTimes(2);
  expect(track).toHaveBeenCalledTimes(2);
  expect(track).toHaveBeenLastCalledWith({
    schemaVersion: 1,
    name: "ui.activate",
    component: "Button",
    id: "upgrade",
    scope: ["settings", "billing"],
    properties: { surface: "page", shared: "inner", plan: "pro" },
  });
});

test("does not interfere without a provider, when disabled, or when canceled", async () => {
  const action = vi.fn();
  const track = vi.fn();
  const view = render(
    <>
      <Button onClick={action}>Standalone</Button>
      <AnalyticsProvider transport={{ track }}>
        <Button analytics={false}>Private</Button>
        <Button onClick={(event) => event.preventDefault()}>Canceled</Button>
        <Button disabled>Disabled</Button>
        <AnalyticsScope name="private" enabled={false}>
          <Button>Hidden scope</Button>
        </AnalyticsScope>
      </AnalyticsProvider>
    </>,
  );
  await userEvent.click(view.getByRole("button", { name: "Standalone" }));
  await userEvent.click(view.getByRole("button", { name: "Private" }));
  await userEvent.click(view.getByRole("button", { name: "Canceled" }));
  await userEvent.click(view.getByRole("button", { name: "Hidden scope" }));
  expect(action).toHaveBeenCalledTimes(1);
  expect(view.getByRole("button", { name: "Disabled" })).toBeDisabled();
  expect(track).not.toHaveBeenCalled();
});

test("reports change requests without values and honors Base UI cancellation", async () => {
  const track = vi.fn();
  const view = render(
    <AnalyticsProvider transport={{ track }}>
      <Switch aria-label="Controlled" checked={false} analytics={{ id: "controlled" }} />
      <Switch aria-label="Canceled" onCheckedChange={(_checked, details) => details.cancel()} />
    </AnalyticsProvider>,
  );
  await userEvent.click(view.getByRole("switch", { name: "Controlled" }));
  await userEvent.click(view.getByRole("switch", { name: "Canceled" }));
  expect(view.getByRole("switch", { name: "Controlled" })).not.toBeChecked();
  expect(track).toHaveBeenCalledExactlyOnceWith({
    schemaVersion: 1,
    name: "ui.change-request",
    component: "Switch",
    id: "controlled",
    scope: [],
    properties: {},
  });
});

test("commits edited inputs on blur without text, keystrokes, or empty focus visits", async () => {
  const track = vi.fn();
  const view = render(
    <AnalyticsProvider transport={{ track }}>
      <Input aria-label="Email" analytics={{ id: "email" }} />
      <Input aria-label="Other" />
    </AnalyticsProvider>,
  );
  await userEvent.click(view.getByRole("textbox", { name: "Email" }));
  await userEvent.type(view.getByRole("textbox", { name: "Email" }), "private@example.test");
  expect(track).not.toHaveBeenCalled();
  await userEvent.tab();
  expect(track).toHaveBeenCalledExactlyOnceWith({
    schemaVersion: 1,
    name: "ui.commit",
    component: "Input",
    id: "email",
    scope: [],
    properties: {},
  });
  await userEvent.tab();
  expect(track).toHaveBeenCalledTimes(1);
});

test("keeps scope through portals and does not mistake controlled rerenders for interactions", async () => {
  const track = vi.fn();
  const view = render(
    <AnalyticsProvider transport={{ track }}>
      <AnalyticsScope name="account">
        <Dialog analytics={{ id: "details" }}>
          <DialogTrigger render={<Button />}>Details</DialogTrigger>
          <DialogContent>
            <DialogTitle>Account details</DialogTitle>
            <Button>Portal action</Button>
          </DialogContent>
        </Dialog>
      </AnalyticsScope>
    </AnalyticsProvider>,
  );
  await userEvent.click(view.getByRole("button", { name: "Details" }));
  const dialog = await view.findByRole("dialog", { name: "Account details" });
  await userEvent.click(within(dialog).getByRole("button", { name: "Portal action" }));
  expect(track.mock.calls.map(([event]) => [event.name, event.scope])).toEqual([
    ["ui.open-request", ["account"]],
    ["ui.activate", ["account"]],
    ["ui.activate", ["account"]],
  ]);
  await userEvent.keyboard("{Escape}");
  expect(track).toHaveBeenLastCalledWith({
    schemaVersion: 1,
    name: "ui.open-request",
    component: "Dialog",
    id: "details",
    scope: ["account"],
    properties: {},
    open: false,
  });
});

function SavedCallback({ save }: { save: (track: ReturnType<typeof useAnalytics>) => void }): ReactElement {
  const track = useAnalytics("Custom");
  return (
    <button type="button" onClick={() => save(track)}>
      Save callback
    </button>
  );
}

test("revokes already captured callbacks and filters events", async () => {
  const track = vi.fn();
  let saved: ReturnType<typeof useAnalytics> = () => undefined;
  const save = (callback: ReturnType<typeof useAnalytics>): void => {
    saved = callback;
  };
  const view = render(
    <AnalyticsProvider transport={{ track }}>
      <SavedCallback save={save} />
    </AnalyticsProvider>,
  );
  await userEvent.click(view.getByRole("button"));
  view.rerender(
    <AnalyticsProvider transport={{ track }} enabled={false}>
      <SavedCallback save={save} />
    </AnalyticsProvider>,
  );
  saved({ name: "ui.commit" });
  expect(track).not.toHaveBeenCalled();
  view.rerender(
    <AnalyticsProvider transport={{ track }} filter={(event) => event.id !== undefined}>
      <Button>Anonymous</Button>
      <Button analytics={{ id: "named" }}>Named</Button>
    </AnalyticsProvider>,
  );
  await userEvent.click(view.getByRole("button", { name: "Anonymous" }));
  await userEvent.click(view.getByRole("button", { name: "Named" }));
  expect(track).toHaveBeenCalledTimes(1);
});

test("isolates synchronous and asynchronous transport failures", async () => {
  const error = new Error("Transport unavailable");
  const track = vi
    .fn()
    .mockImplementationOnce(() => {
      throw error;
    })
    .mockRejectedValueOnce(error);
  const onError = vi.fn();
  const action = vi.fn();
  const view = render(
    <AnalyticsProvider transport={{ track }} onError={onError}>
      <Button onClick={action}>Continue</Button>
    </AnalyticsProvider>,
  );
  await userEvent.click(view.getByRole("button"));
  await userEvent.click(view.getByRole("button"));
  await waitFor(() => expect(onError).toHaveBeenCalledTimes(2));
  expect(action).toHaveBeenCalledTimes(2);
  expect(onError).toHaveBeenLastCalledWith(error);
});

test("measures an explicit impression once without adding a wrapper", async () => {
  const track = vi.fn();
  const view = render(
    <StrictMode>
      <AnalyticsProvider transport={{ track }}>
        <AnalyticsImpression
          component="Card"
          analytics={{ id: "welcome" }}
          durationMs={0}
          render={<section aria-label="Welcome" />}
        >
          Welcome
        </AnalyticsImpression>
      </AnalyticsProvider>
    </StrictMode>,
  );
  expect(view.container.firstElementChild).toBe(view.getByRole("region", { name: "Welcome" }));
  await waitFor(() =>
    expect(track).toHaveBeenCalledExactlyOnceWith({
      schemaVersion: 1,
      name: "ui.impression",
      component: "Card",
      id: "welcome",
      scope: [],
      properties: {},
    }),
  );
});

test("deduplicates composed activations and respects cancellation by the outer control", async () => {
  const track = vi.fn();
  const view = render(
    <AnalyticsProvider transport={{ track }}>
      <Button render={<Button analytics={{ id: "inner" }} />} analytics={{ id: "outer" }}>
        Composed
      </Button>
      <Button render={<Button />} onClick={(event) => event.preventDefault()}>
        Canceled composition
      </Button>
    </AnalyticsProvider>,
  );
  await userEvent.click(view.getByRole("button", { name: "Composed" }));
  expect(track).toHaveBeenCalledTimes(1);
  await userEvent.click(view.getByRole("button", { name: "Canceled composition" }));
  expect(track).toHaveBeenCalledTimes(1);
});

test("discards edits across consent changes and uses the current transport", async () => {
  const first = vi.fn();
  const second = vi.fn();
  const content = (
    <>
      <Input aria-label="Private input" />
      <Input aria-label="Next" />
    </>
  );
  const view = render(<AnalyticsProvider transport={{ track: first }}>{content}</AnalyticsProvider>);
  await userEvent.type(view.getByRole("textbox", { name: "Private input" }), "before consent revoked");
  view.rerender(
    <AnalyticsProvider transport={{ track: first }} enabled={false}>
      {content}
    </AnalyticsProvider>,
  );
  view.rerender(<AnalyticsProvider transport={{ track: second }}>{content}</AnalyticsProvider>);
  await userEvent.tab();
  expect(first).not.toHaveBeenCalled();
  expect(second).not.toHaveBeenCalled();
  await userEvent.type(view.getByRole("textbox", { name: "Private input" }), "new edit");
  await userEvent.tab();
  expect(second).toHaveBeenCalledTimes(1);
});

test("nested providers cannot override disabled ancestors and diagnostics cannot break actions", async () => {
  const track = vi.fn();
  const action = vi.fn();
  const view = render(
    <AnalyticsProvider transport={{ track }} enabled={false}>
      <AnalyticsProvider transport={{ track }} enabled>
        <Button onClick={action}>Nested</Button>
      </AnalyticsProvider>
    </AnalyticsProvider>,
  );
  await userEvent.click(view.getByRole("button"));
  expect(track).not.toHaveBeenCalled();
  view.rerender(
    <AnalyticsProvider
      transport={{ track }}
      filter={() => {
        throw new Error("filter");
      }}
      onError={() => {
        throw new Error("diagnostics");
      }}
    >
      <Button onClick={action}>Continue</Button>
    </AnalyticsProvider>,
  );
  await userEvent.click(view.getByRole("button"));
  expect(action).toHaveBeenCalledTimes(2);
  expect(track).not.toHaveBeenCalled();
});

test("disabled impressions begin their observation only after enabling", async () => {
  const track = vi.fn();
  const content = (
    <AnalyticsImpression component="Card" durationMs={0}>
      Visible card
    </AnalyticsImpression>
  );
  const view = render(
    <AnalyticsProvider transport={{ track }} enabled={false}>
      {content}
    </AnalyticsProvider>,
  );
  await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  expect(track).not.toHaveBeenCalled();
  view.rerender(<AnalyticsProvider transport={{ track }}>{content}</AnalyticsProvider>);
  await waitFor(() => expect(track).toHaveBeenCalledTimes(1));
});

test("revokes callbacks captured in a removed scope", async () => {
  const track = vi.fn();
  let saved: ReturnType<typeof useAnalytics> = () => undefined;
  const view = render(
    <AnalyticsProvider transport={{ track }}>
      <AnalyticsScope name="removed">
        <SavedCallback
          save={(callback) => {
            saved = callback;
          }}
        />
      </AnalyticsScope>
    </AnalyticsProvider>,
  );
  await userEvent.click(view.getByRole("button"));
  view.rerender(
    <AnalyticsProvider transport={{ track }}>
      <span>Removed</span>
    </AnalyticsProvider>,
  );
  saved({ name: "ui.commit" });
  expect(track).not.toHaveBeenCalled();
});

test("pagination delegates tracking once and honors its own opt-out", async () => {
  const track = vi.fn();
  const view = render(
    <AnalyticsProvider transport={{ track }}>
      <PaginationLink size="default" analytics={{ id: "next" }}>
        Next page
      </PaginationLink>
      <PaginationLink size="default" analytics={false}>
        Private page
      </PaginationLink>
    </AnalyticsProvider>,
  );
  await userEvent.click(view.getByText("Next page"));
  expect(track).toHaveBeenCalledExactlyOnceWith(expect.objectContaining({ component: "PaginationLink", id: "next" }));
  await userEvent.click(view.getByText("Private page"));
  expect(track).toHaveBeenCalledTimes(1);
});

test("image selection commits without collecting the file or its name", async () => {
  const track = vi.fn();
  const changed = vi.fn();
  const file = new File(["private contents"], "private-name.png", { type: "image/png" });
  const view = render(
    <AnalyticsProvider transport={{ track }}>
      <ImagePicker label="Portrait" onFileChange={changed} onClear={() => undefined} />
    </AnalyticsProvider>,
  );
  await userEvent.upload(view.getByLabelText("Choose image file"), file);
  expect(changed).toHaveBeenCalledTimes(1);
  expect(track).toHaveBeenCalledExactlyOnceWith({
    schemaVersion: 1,
    name: "ui.commit",
    component: "ImagePicker",
    scope: [],
    properties: {},
  });
});
