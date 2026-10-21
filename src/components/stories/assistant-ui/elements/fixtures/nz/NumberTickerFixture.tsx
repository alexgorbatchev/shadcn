import { useState, type ComponentProps, type JSX } from "react";
import { Button } from "../../../../../Button.js";
import { NumberTicker } from "../../../../../assistant-ui/elements/NumberTicker.js";
export function NumberTickerFixture({ value: initialValue, label }: ComponentProps<typeof NumberTicker>): JSX.Element {
  const [value, setValue] = useState(initialValue);
  return (
    <section aria-label="Live token counter">
      <NumberTicker value={value} label={label} />
      <Button onClick={() => setValue((current) => current + 1)}>Add one token</Button>
    </section>
  );
}
