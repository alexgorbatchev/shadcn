import { ComposerPrimitive, ThreadPrimitive, type TriggerAdapter, type TriggerItem } from "@assistant-ui/react";
import type { ReactElement } from "react";
import { ComposerTriggerPopover } from "../../../../assistant-ui/native/ComposerTriggerPopover.js";
import { Textarea } from "../../../../Textarea.js";
import { NativeRuntimeFixture } from "../helpers.js";
interface IComposerTriggerPopoverFixtureProps {
  mode: "directive" | "action";
  onSelect(item: TriggerItem): void;
}
export const fixture_documentTriggerItem: TriggerItem = {
  id: "readme",
  type: "file",
  label: "README",
  description: "Project guide",
};
export const fixture_documentTriggerAdapter: TriggerAdapter = {
  categories: () => [{ id: "documents", label: "Documents" }],
  categoryItems: () => [fixture_documentTriggerItem],
  search: (query) =>
    fixture_documentTriggerItem.label.toLowerCase().includes(query.toLowerCase()) ? [fixture_documentTriggerItem] : [],
};
export function ComposerTriggerPopoverFixture({ mode, onSelect }: IComposerTriggerPopoverFixtureProps): ReactElement {
  return (
    <NativeRuntimeFixture>
      <ThreadPrimitive.Root>
        <ComposerPrimitive.TriggerPopoverRoot>
          <ComposerPrimitive.Root>
            <ComposerPrimitive.Input aria-label="Message with mentions" render={<Textarea />} />
            {mode === "directive" ? (
              <ComposerTriggerPopover
                char="@"
                adapter={fixture_documentTriggerAdapter}
                directive={{ onInserted: onSelect }}
              />
            ) : (
              <ComposerTriggerPopover
                char="@"
                adapter={fixture_documentTriggerAdapter}
                action={{ onExecute: onSelect, removeOnExecute: true }}
              />
            )}
          </ComposerPrimitive.Root>
        </ComposerPrimitive.TriggerPopoverRoot>
      </ThreadPrimitive.Root>
    </NativeRuntimeFixture>
  );
}
