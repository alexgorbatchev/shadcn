import { useState, type JSX } from "react";
import { EmptyStateComposer } from "../../../../../assistant-ui/elements/EmptyStateComposer.js";
export function EmptyStateComposerFixture(): JSX.Element {
  const [value, setValue] = useState("Inspect source");
  const [sent, setSent] = useState("");
  return (
    <>
      <EmptyStateComposer
        placeholder="Ask about the workspace"
        value={value}
        onValueChange={setValue}
        onSend={(message) => {
          setSent(message);
          setValue("");
        }}
      />
      <output aria-label="Sent message">{sent}</output>
    </>
  );
}
