import type { ReactElement } from "react";
import { memo } from "react";
import { useAuiState } from "@assistant-ui/react";
import { type SyntaxHighlighterProps } from "@assistant-ui/react-markdown";
import { MermaidDiagram as MermaidDiagramBase } from "../elements/MermaidDiagram.js";
import { MermaidZoom } from "../elements/MermaidZoom.js";

export type MermaidDiagramProps = SyntaxHighlighterProps;
/**
 * Use it by passing to `componentsByLanguage` for mermaid in `markdown-text.tsx`.
 *
 * @example
 * const MarkdownTextImpl = () => {
 *   return (
 *     <MarkdownTextPrimitive
 *       remarkPlugins={[remarkGfm]}
 *       className="aui-md"
 *       components={defaultComponents}
 *       componentsByLanguage={{
 *         mermaid: {
 *           SyntaxHighlighter: MermaidDiagram
 *         },
 *       }}
 *     />
 *   );
 * };
 */
export const MermaidDiagram = Object.assign(
  memo(function MermaidDiagram({
    code,
    node: _node,
    components: _components,
    language: _language,
  }: MermaidDiagramProps): ReactElement {
    const isStreaming = useAuiState((s) => s.optional.part?.status.type === "running");
    return <MermaidDiagramBase code={code} streaming={isStreaming} />;
  }),
  { Zoom: MermaidZoom },
);
MermaidDiagram.displayName = "MermaidDiagram";
