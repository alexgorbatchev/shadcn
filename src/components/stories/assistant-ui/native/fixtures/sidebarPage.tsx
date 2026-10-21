import { useState, type ReactElement } from "react";
import { Button } from "../../../../Button.js";

export function SidebarPage(): ReactElement {
  const [clicks, setClicks] = useState(0);
  return (
    <main aria-label="Project page">
      <Button onClick={() => setClicks(clicks + 1)}>Use project page</Button>
      <output aria-label="Page interactions">{clicks}</output>
    </main>
  );
}
