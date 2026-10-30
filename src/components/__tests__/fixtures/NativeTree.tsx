import { useState, type ReactElement } from "react";
import {
  useTree,
  syncDataLoaderFeature,
  hotkeysCoreFeature,
  selectionFeature,
  renamingFeature,
  searchFeature,
} from "../../tree";

import type { INativeTreeProps } from "../types";

export function NativeTree({
  rowTag = "div",
  isNested = false,
  hasNestedTree = false,
}: INativeTreeProps): ReactElement {
  const [renamed, setRenamed] = useState("");
  const prefix = isNested ? "Nested " : "";
  const tree = useTree<string>({
    rootItemId: "root",
    getItemName: (item) => `${prefix}${item.getItemData()}`,
    isItemFolder: () => false,
    dataLoader: { getItem: (id) => id, getChildren: () => ["First", "Second"] },
    onRename: (_, value) => setRenamed(value),
    features: [syncDataLoaderFeature, hotkeysCoreFeature, selectionFeature, renamingFeature, searchFeature],
  });
  const Row = rowTag;
  const Wrapper = isNested ? "div" : "form";
  return (
    <Wrapper aria-label="Outer form" onSubmit={(event) => event.preventDefault()}>
      <div {...tree.getContainerProps(`${prefix}Native ownership`)}>
        {tree.isSearchOpen() && <input aria-label="Search tree" {...tree.getSearchInputElementProps()} />}
        {tree.getItems().map((item) => (
          <Row
            key={item.getId()}
            {...item.getProps()}
            type={rowTag === "button" ? "button" : undefined}
            href={rowTag === "a" ? `#${item.getId()}` : undefined}
          >
            {item.getItemName()}
            {item.isRenaming() && <input aria-label="Rename tree item" {...item.getRenameInputProps()} />}
          </Row>
        ))}
        <textarea aria-label="Notes" />
        <select aria-label="Choice">
          <option>One</option>
          <option>Two</option>
        </select>
        <div role="textbox" aria-label="Rich notes" contentEditable suppressContentEditableWarning>
          Notes
        </div>
        <button type="button">Inspect</button>
        <a href="#help">Help</a>
        <audio
          controls
          aria-label="Audio preview"
          src={new URL("../../stories/assistant-ui/elements/fixtures/sample.wav", import.meta.url).href}
        />
        <video
          controls
          aria-label="Video preview"
          src={new URL("../../stories/assistant-ui/elements/fixtures/sample.wav", import.meta.url).href}
        />
        {hasNestedTree && <NativeTree isNested />}
      </div>
      <output aria-label={`${prefix}Focused item`}>{tree.getState().focusedItem}</output>
      <output aria-label="Renamed item">{renamed}</output>
    </Wrapper>
  );
}
