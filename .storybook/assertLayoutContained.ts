import { getLayoutAnimations } from "../src/utils/getLayoutAnimations";
import { expect, waitFor } from "storybook/test";
import { collectLayoutViolations } from "../src/utils/collectLayoutViolations";

/** Call at every meaningful interaction checkpoint, not just at the end of a story. */
export async function assertLayoutContained(root: Element): Promise<void> {
  await root.ownerDocument.fonts.ready;
  await waitFor(() => {
    const active = getLayoutAnimations(root);
    expect(active).toHaveLength(0);
    expect(collectLayoutViolations(root).map((violation) => violation.message)).toEqual([]);
  });
}
