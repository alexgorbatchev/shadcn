import { memo, type ReactElement } from "react";
import { defaultDirectiveFormatter, type TextMessagePartProps } from "@assistant-ui/react";
import { DirectiveText as ElementDirectiveText } from "../elements/DirectiveText.js";
export const DirectiveText = memo(function DirectiveText({ text }: TextMessagePartProps): ReactElement {
  return <ElementDirectiveText text={text} formatter={defaultDirectiveFormatter} />;
});
