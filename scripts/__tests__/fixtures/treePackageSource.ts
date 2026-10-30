export const fixture_treePackageSource: string = `
import { useState } from "react";
import { createRoot } from "react-dom/client";
import { Tree, TreeItem, useTree, syncDataLoaderFeature, hotkeysCoreFeature, selectionFeature } from "@alexgorbatchev/shadcn/tree";

function Consumer() {
  const [actions, setActions] = useState(0);
  const [links, setLinks] = useState(0);
  const tree = useTree({
    rootItemId: "root",
    getItemName: (item) => item.getItemData(),
    isItemFolder: () => false,
    dataLoader: { getItem: (id) => id, getChildren: () => ["Source", "Destination"] },
    features: [syncDataLoaderFeature, hotkeysCoreFeature, selectionFeature],
  });
  return <>
    <Tree tree={tree} label="Packed tree" renderItem={(item) =>
      <TreeItem item={item}
        linkProps={{ href: "#" + item.getId(), onClick: () => setLinks((count) => count + 1) }}
        endEnhancer={<button type="button" onClick={() => setActions((count) => count + 1)}>Inspect {item.getId()}</button>}
      >{item.getItemName()}</TreeItem>
    } />
    <output aria-label="Focused item">{tree.getState().focusedItem}</output>
    <output aria-label="Actions">{actions}</output>
    <output aria-label="Links">{links}</output>
  </>;
}
createRoot(document.getElementById("root")).render(<Consumer />);
`;
