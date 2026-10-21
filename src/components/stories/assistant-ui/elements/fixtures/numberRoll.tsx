import { useState, type ComponentProps, type ReactElement } from "react";
import { Button } from "../../../../Button.js";
import { NumberRoll } from "../../../../assistant-ui/elements/NumberRoll.js";
import { NumberRollDigit } from "../../../../assistant-ui/elements/NumberRollDigit.js";
import { NumberRollPart } from "../../../../assistant-ui/elements/NumberRollPart.js";
export function NumberRollScene(props: ComponentProps<typeof NumberRoll>): ReactElement {
  const [value, setValue] = useState(props.value);
  const [isVisible, setVisible] = useState(true);
  const [duration, setDuration] = useState(props.duration);
  return (
    <>
      {isVisible && <NumberRoll {...props} value={value} duration={duration} role="status" aria-label="Amount" />}
      <Button onClick={() => setValue(1000)}>Increase amount</Button>
      <Button onClick={() => setValue(9)}>Decrease amount</Button>
      <Button onClick={() => setVisible(false)}>Remove amount</Button>
      <Button onClick={() => setDuration(0)}>Finish animation</Button>
    </>
  );
}

export function NumberRollDigitScene(props: ComponentProps<typeof NumberRollDigit>): ReactElement {
  const [digit, setDigit] = useState(props.digit);
  return (
    <>
      <NumberRollDigit {...props} digit={digit} />
      <Button onClick={() => setDigit(0)}>Roll to zero</Button>
    </>
  );
}

export function NumberRollPartScene(props: ComponentProps<typeof NumberRollPart>): ReactElement {
  const [isExiting, setExiting] = useState(false);
  return (
    <>
      <NumberRollPart {...props} part={{ ...props.part, isExiting }} />
      <Button onClick={() => setExiting(true)}>Remove column</Button>
    </>
  );
}
