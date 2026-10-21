import { useCallback, useState, type JSX } from "react";
import { createPortal } from "react-dom";
import previewCss from "../../../../../../../.storybook/preview.css?inline";
import { ThreadSearchFixture } from "./ThreadSearchFixture.js";

export function ShadowThreadSearchFixture(): JSX.Element {
  const [root, setRoot] = useState<ShadowRoot | null>(null);
  const attach = useCallback((host: HTMLDivElement | null) => {
    if (host) setRoot(host.shadowRoot ?? host.attachShadow({ mode: "open" }));
  }, []);
  return (
    <div data-testid="ShadowThreadSearchFixture" ref={attach}>
      {root
        ? createPortal(
            <>
              <style>{previewCss}</style>
              <div data-testid="ShadowThreadSearchFixture--content">
                <ThreadSearchFixture />
              </div>
            </>,
            root,
          )
        : null}
    </div>
  );
}
