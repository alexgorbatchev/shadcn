import { useState, type JSX } from "react";
import { Button } from "../../../../../Button.js";
import { GenerationLoader } from "../../../../../assistant-ui/elements/GenerationLoader.js";
export function GenerationLoaderFixture(): JSX.Element {
  const [tick, setTick] = useState(0);
  return (
    <>
      <GenerationLoader label="Generating response" tick={tick} />
      <Button onClick={() => setTick((current) => current + 9)}>Advance generation frame</Button>
    </>
  );
}
