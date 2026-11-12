import { useState, type ReactElement } from "react";
import { afterEach, expect, test, vi } from "vitest";
import { cleanup, render, within, waitFor } from "@testing-library/react";
import { userEvent } from "vitest/browser";
import "../../../.storybook/preview.css";
import { InlineEdit } from "../InlineEdit.js";

afterEach(cleanup);

interface IFailedDraftProps {
  onOpen: () => void;
}

function FailedDraft({ onOpen }: IFailedDraftProps): ReactElement {
  const [value, setValue] = useState("Requested playlist");
  return (
    <div>
      <InlineEdit
        label="Playlist title"
        value={value}
        onValueChange={setValue}
        onCancel={() => {}}
        onCommit={async () => {
          throw new Error("Private diagnostic");
        }}
      />
      <button type="button" onClick={onOpen}>
        Open job details
      </button>
    </div>
  );
}

test("failed validation yields native pointer clicks to the action beneath its popup", async () => {
  const onOpen = vi.fn();
  const view = render(<FailedDraft onOpen={onOpen} />);
  await userEvent.keyboard("{Enter}");
  await within(document.body).findByRole("alert");
  await userEvent.click(view.getByRole("button", { name: "Open job details" }));
  expect(onOpen).toHaveBeenCalledOnce();
});

test("Escape dismisses a blurred failed editor popup while retaining its draft and error state", async () => {
  const view = render(<FailedDraft onOpen={vi.fn()} />);
  await userEvent.keyboard("{Enter}");
  await within(document.body).findByRole("alert");
  expect(await within(document.body).findByTestId("InlineEdit--error-popup")).toBeVisible();
  await userEvent.keyboard("{Escape}");
  await waitFor(() => expect(within(document.body).queryByTestId("InlineEdit--error-popup")).toBeNull());
  const input = view.getByRole("textbox", { name: "Playlist title" });
  expect(input).toHaveValue("Requested playlist");
  expect(input).toHaveAttribute("aria-invalid", "true");
  expect(input).toHaveAccessibleErrorMessage("Could not save this edit.");
  await userEvent.tab();
  await userEvent.tab({ shift: true });
  expect(input).toHaveFocus();
  expect(await within(document.body).findByTestId("InlineEdit--error-popup")).toBeVisible();
});

test("native form submission commits once while the editor is pending", async () => {
  let finish: (() => void) | undefined;
  const onCommit = vi.fn(
    () =>
      new Promise<void>((resolve) => {
        finish = resolve;
      }),
  );
  const view = render(
    <InlineEdit
      label="Playlist title"
      value="Requested playlist"
      onValueChange={vi.fn()}
      onCancel={vi.fn()}
      onCommit={onCommit}
    />,
  );
  const input = view.getByRole("textbox", { name: "Playlist title" }) as HTMLInputElement;
  input.form?.requestSubmit();
  input.form?.requestSubmit();
  await waitFor(() => expect(input).toBeDisabled());
  expect(onCommit).toHaveBeenCalledExactlyOnceWith("Requested playlist");
  finish?.();
  await waitFor(() => expect(input).toBeEnabled());
});
