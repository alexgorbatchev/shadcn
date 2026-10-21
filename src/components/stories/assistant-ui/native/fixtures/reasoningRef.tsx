import { useCallback, useRef, useState, type ReactElement } from "react";
import { ThreadPrimitive } from "@assistant-ui/react";
import { Button } from "../../../../Button.js";
import { Reasoning } from "../../../../assistant-ui/native/Reasoning.js";
import { NativeRuntimeFixture } from "../helpers.js";

interface IReasoningRefFixtureProps {
  kind: "object" | "callback" | "cleanup";
  onAttach: (node: HTMLDivElement | null) => void;
  onRelease: () => void;
}
export function ReasoningRefFixture({ kind, onAttach, onRelease }: IReasoningRefFixtureProps): ReactElement {
  const [visible, setVisible] = useState(true);
  const [attachment, setAttachment] = useState("initial");
  const reference = useRef<HTMLDivElement>(null);
  const callback = useCallback(
    (node: HTMLDivElement | null) => {
      onAttach(node);
      setAttachment(node ? "attached" : "released");
      if (kind === "cleanup")
        return () => {
          onRelease();
          setAttachment("released");
        };
    },
    [kind, onAttach, onRelease],
  );
  return (
    <NativeRuntimeFixture>
      <output aria-label="Ref state">{attachment}</output>
      <Button onClick={() => reference.current?.focus()}>Focus reasoning</Button>
      <Button onClick={() => setVisible(false)}>Remove reasoning</Button>
      <ThreadPrimitive.Root>
        <ThreadPrimitive.Viewport>
          {visible && (
            <Reasoning.Root
              ref={kind === "object" ? reference : callback}
              tabIndex={-1}
              data-testid="Referenced reasoning"
            >
              <Reasoning.Trigger />
              <Reasoning.Content>
                <Reasoning.Text>Ref lifecycle details</Reasoning.Text>
              </Reasoning.Content>
            </Reasoning.Root>
          )}
        </ThreadPrimitive.Viewport>
      </ThreadPrimitive.Root>
    </NativeRuntimeFixture>
  );
}
