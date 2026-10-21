import { useState, type ReactElement } from "react";
import { PromptLibrary } from "../../../../assistant-ui/elements/PromptLibrary.js";

export function PromptLibraryFixture(): ReactElement {
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState("missing");
  const [inserted, setInserted] = useState("");
  return (
    <>
      <PromptLibrary
        prompts={[
          { id: "review", name: "Review", body: "Review source", variables: [] },
          { id: "fix", name: "Fix", body: "Fix {{file}} with {{test}}", variables: ["file", "test"] },
        ]}
        query={query}
        selectedId={selectedId}
        onQueryChange={setQuery}
        onSelect={setSelectedId}
        onInsert={setInserted}
      />
      <output aria-label="Inserted prompt">{inserted}</output>
    </>
  );
}
