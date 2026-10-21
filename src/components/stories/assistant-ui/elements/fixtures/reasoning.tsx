import { useState, type ReactElement } from "react";
import { Button } from "../../../../Button.js";
import { ReasoningRoot } from "../../../../assistant-ui/elements/ReasoningRoot.js";
import { ReasoningTrigger } from "../../../../assistant-ui/elements/ReasoningTrigger.js";
import { ReasoningContent } from "../../../../assistant-ui/elements/ReasoningContent.js";
import { ReasoningText } from "../../../../assistant-ui/elements/ReasoningText.js";

interface IReasoningPreviewFixtureProps {
  defaultOpen?: boolean;
  onAnimationStart?: () => void;
}
export function ReasoningPreviewFixture({
  defaultOpen,
  onAnimationStart,
}: IReasoningPreviewFixtureProps): ReactElement {
  const [streaming, setStreaming] = useState(false);
  const [count, setCount] = useState(30);
  return (
    <>
      <Button onClick={() => setStreaming(true)}>Start reasoning</Button>
      <Button onClick={() => setStreaming(false)}>Finish reasoning</Button>
      <Button onClick={() => setCount((current) => current + 10)}>Append reasoning</Button>
      <ReasoningRoot streaming={streaming} defaultOpen={defaultOpen} onAnimationStart={onAnimationStart}>
        <ReasoningTrigger active={streaming} />
        <ReasoningContent>
          <ReasoningText>
            {Array.from({ length: count }, (_, index) => (
              <p key={index}>Reasoning step {index + 1}</p>
            ))}
          </ReasoningText>
        </ReasoningContent>
      </ReasoningRoot>
    </>
  );
}
