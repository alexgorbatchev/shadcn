import type { JSX } from "react";
import type { ComponentProps } from "react";
import { cn } from "../../../utils/cn.js";
import { codeScroll } from "./constants.js";
import { codeSurface } from "./constants.js";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../Card.js";
export type DiffKind = "context" | "added" | "removed";
export interface IDiffLine {
  kind: DiffKind;
  text: string;
}
const GUTTER: Record<DiffKind, string> = {
  context: "",
  added: "+",
  removed: "−",
};
export function CodeDiff({ filename, additions, deletions, lines, cycle, ...props }: ICodeDiffProps): JSX.Element {
  return (
    <Card data-testid="CodeDiff" className="w-full max-w-md" {...props}>
      <CardHeader>
        <CardTitle>{filename}</CardTitle>
        <CardDescription>
          <span className="text-success">+{additions}</span> <span className="text-destructive">−{deletions}</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className={codeScroll}>
          <pre className={codeSurface}>
            <code>
              {lines.map((line, i) => (
                <span
                  key={`${cycle}-${i}-${line.text}`}
                  className={cn(
                    "fade-in animate-in fill-mode-both flex px-4 py-0.5 leading-relaxed whitespace-pre duration-300",
                    line.kind === "context" && "text-muted-foreground",
                    line.kind === "added" && "bg-success/5 text-success",
                    line.kind === "removed" && "bg-destructive/10 text-destructive",
                  )}
                >
                  <span className="w-4 shrink-0 select-none">{GUTTER[line.kind]}</span>
                  {line.kind === "added" ? (
                    <ins className="no-underline">{line.text}</ins>
                  ) : line.kind === "removed" ? (
                    <del className="no-underline">{line.text}</del>
                  ) : (
                    <span>{line.text}</span>
                  )}
                </span>
              ))}
            </code>
          </pre>
        </div>
      </CardContent>
    </Card>
  );
}
interface ICodeDiffProps extends Omit<
  Omit<ComponentProps<"div">, "children" | "filename" | "additions" | "deletions" | "lines" | "cycle">,
  "className" | "style"
> {
  filename: string;
  additions: number;
  deletions: number;
  lines: readonly IDiffLine[];
  cycle: number;
}
