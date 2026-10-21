import type { CSSProperties, JSX } from "react";
import { PrismAsyncLight } from "react-syntax-highlighter";
import { makePrismAsyncLightSyntaxHighlighter } from "@assistant-ui/react-syntax-highlighter";
import type { SyntaxHighlighterProps } from "@assistant-ui/react-markdown";
import tsx from "react-syntax-highlighter/dist/esm/languages/prism/tsx";
import python from "react-syntax-highlighter/dist/esm/languages/prism/python";
PrismAsyncLight.registerLanguage("js", tsx);
PrismAsyncLight.registerLanguage("jsx", tsx);
PrismAsyncLight.registerLanguage("ts", tsx);
PrismAsyncLight.registerLanguage("tsx", tsx);
PrismAsyncLight.registerLanguage("python", python);
const syntaxHighlighterCustomStyle = {
  background: "var(--secondary)",
  color: "var(--foreground)",
  border: "1px solid var(--border)",
  borderRadius: "var(--radius-sm)",
  margin: 0,
  width: "100%",
  padding: "6px",
};
const semanticPrismTheme: Record<string, CSSProperties> = {
  'code[class*="language-"]': { color: "var(--foreground)", background: "var(--secondary)" },
  'pre[class*="language-"]': { color: "var(--foreground)", background: "var(--secondary)" },
  comment: { color: "var(--muted-foreground)" },
  prolog: { color: "var(--muted-foreground)" },
  doctype: { color: "var(--muted-foreground)" },
  cdata: { color: "var(--muted-foreground)" },
  punctuation: { color: "var(--muted-foreground)" },
  property: { color: "var(--primary)" },
  tag: { color: "var(--primary)" },
  boolean: { color: "var(--warning)" },
  number: { color: "var(--warning)" },
  constant: { color: "var(--warning)" },
  symbol: { color: "var(--warning)" },
  deleted: { color: "var(--destructive)" },
  selector: { color: "var(--success)" },
  "attr-name": { color: "var(--primary)" },
  string: { color: "var(--success)" },
  char: { color: "var(--success)" },
  builtin: { color: "var(--primary)" },
  inserted: { color: "var(--success)" },
  operator: { color: "var(--foreground)" },
  entity: { color: "var(--foreground)" },
  url: { color: "var(--primary)" },
  atrule: { color: "var(--primary)" },
  "attr-value": { color: "var(--success)" },
  keyword: { color: "var(--primary)" },
  function: { color: "var(--primary)" },
  "class-name": { color: "var(--primary)" },
  regex: { color: "var(--warning)" },
  important: { color: "var(--warning)" },
  variable: { color: "var(--foreground)" },
};
const SemanticSyntaxHighlighter = makePrismAsyncLightSyntaxHighlighter({
  style: semanticPrismTheme,
  customStyle: syntaxHighlighterCustomStyle,
});
export function SyntaxHighlighter(props: SyntaxHighlighterProps): JSX.Element {
  return (
    <div data-testid="SyntaxHighlighter">
      <SemanticSyntaxHighlighter {...props} />
    </div>
  );
}
