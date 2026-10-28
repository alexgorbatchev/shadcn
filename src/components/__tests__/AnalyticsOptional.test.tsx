import { useState, type ReactElement } from "react";
import "react-image-crop/dist/ReactCrop.css";
import "../../../.storybook/preview.css";
import { afterEach, expect, test, vi } from "vitest";
import { cleanup, render, waitFor } from "@testing-library/react";
import { userEvent } from "vitest/browser";
import { AnalyticsProvider } from "../analytics/index.js";
import { Command, CommandInput, CommandList, CommandItem } from "../command/Command.js";
import { ImageCrop, type Crop } from "../image-crop/ImageCrop.js";

afterEach(cleanup);

test("command initialization and controlled highlights do not masquerade as activation", async () => {
  const track = vi.fn();
  const change = vi.fn();
  const view = render(
    <AnalyticsProvider transport={{ track }}>
      <Command value="" onValueChange={change}>
        <CommandInput aria-label="Commands" />
        <CommandList>
          <CommandItem value="open">Open</CommandItem>
        </CommandList>
      </Command>
    </AnalyticsProvider>,
  );
  await waitFor(() => expect(change).toHaveBeenCalled());
  expect(track).not.toHaveBeenCalled();
  await userEvent.click(view.getByRole("option", { name: "Open" }));
  expect(track).toHaveBeenCalledExactlyOnceWith(
    expect.objectContaining({ name: "ui.activate", component: "CommandItem" }),
  );
});

function CropInitialization({ complete }: { complete: () => void }): ReactElement {
  const [crop, setCrop] = useState<Crop>();
  return (
    <>
      <button type="button" onClick={() => setCrop({ unit: "px", x: 10, y: 10, width: 100, height: 100 })}>
        Initialize crop
      </button>
      <ImageCrop crop={crop} onChange={setCrop} onComplete={complete}>
        <img
          alt="Crop example"
          width={200}
          height={200}
          src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'/%3E"
        />
      </ImageCrop>
    </>
  );
}

test("programmatically initializing a crop preserves completion without reporting an edit", async () => {
  const track = vi.fn();
  const complete = vi.fn();
  const view = render(
    <AnalyticsProvider transport={{ track }}>
      <CropInitialization complete={complete} />
    </AnalyticsProvider>,
  );
  await waitFor(() => expect(view.getByRole("img")).toHaveProperty("complete", true));
  await userEvent.click(view.getByRole("button", { name: "Initialize crop" }));
  await waitFor(() => expect(complete).toHaveBeenCalled());
  expect(track).not.toHaveBeenCalled();
  view.getByRole("group", { name: "Use the arrow keys to move the crop selection area" }).focus();
  await userEvent.keyboard("{ArrowRight}");
  expect(track).toHaveBeenCalledExactlyOnceWith(expect.objectContaining({ name: "ui.commit", component: "ImageCrop" }));
});
