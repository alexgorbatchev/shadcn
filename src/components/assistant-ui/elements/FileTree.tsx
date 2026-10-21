import type { JSX, ComponentProps } from "react";
import { FileIcon, FolderOpenIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../Card.js";
import { take } from "../utils/range.js";

export interface IFileTreeNode {
  path: string;
  name: string;
  depth: number;
  kind: "folder" | "file";
  additions?: number;
  deletions?: number;
}

export function FileTree({
  nodes,
  visibleCount,
  totalAdditions,
  totalDeletions,
  ...props
}: IFileTreeProps): JSX.Element {
  const files = nodes.filter((node) => node.kind === "file").length;
  return (
    <Card data-testid="FileTree" className="w-full max-w-sm" {...props}>
      <CardHeader>
        <CardTitle>{files} files changed</CardTitle>
        <CardDescription>
          <span className="text-success">+{totalAdditions}</span>{" "}
          <span className="text-destructive">−{totalDeletions}</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ul aria-label="Changed files" className="flex list-none flex-col gap-control-gap">
          {take(nodes, visibleCount).map((node) => (
            <li
              key={node.path}
              className="flex items-center gap-control-gap text-sm"
              style={{ paddingInlineStart: `${Math.max(0, node.depth)}em` }}
            >
              {node.kind === "folder" ? (
                <FolderOpenIcon aria-hidden="true" className="size-4 shrink-0" />
              ) : (
                <FileIcon aria-hidden="true" className="size-4 shrink-0" />
              )}
              <span className="min-w-0 flex-1 truncate">{node.name}</span>
              {node.kind === "file" && (
                <span className="shrink-0 tabular-nums">
                  {node.additions ? <span className="text-success">+{node.additions}</span> : null}{" "}
                  {node.deletions ? <span className="text-destructive">−{node.deletions}</span> : null}
                </span>
              )}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

interface IFileTreeProps extends Omit<ComponentProps<"div">, "children" | "className" | "style"> {
  nodes: readonly IFileTreeNode[];
  visibleCount: number;
  totalAdditions: number;
  totalDeletions: number;
}
