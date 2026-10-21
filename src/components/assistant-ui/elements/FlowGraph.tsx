import type { JSX } from "react";
import type { ComponentProps } from "react";
import { cn } from "../../../utils/cn.js";
import { mono } from "./constants.js";
import { Card, CardContent } from "../../Card.js";
import { take } from "../utils/range.js";
export type FlowNodeState = "done" | "active" | "pending";
export interface IFlowNode {
  id: string;
  label: string;
  column: number;
  row: number;
  state: FlowNodeState;
}
export interface IFlowEdge {
  from: string;
  to: string;
}
const COL_W = 96;
const ROW_H = 58;
const NODE_W = 78;
const NODE_H = 30;
export function FlowGraph({ nodes, edges, visibleCount, ...props }: IFlowGraphProps): JSX.Element {
  const shown = take(nodes, visibleCount);
  const shownIds = new Set(shown.map((node) => node.id));
  const columns = Math.max(0, ...nodes.map((node) => node.column)) + 1;
  const rows = Math.max(0, ...nodes.map((node) => node.row)) + 1;
  const width = (columns - 1) * COL_W + NODE_W;
  const height = (rows - 1) * ROW_H + NODE_H;
  const center = (node: IFlowNode) => ({
    x: node.column * COL_W + NODE_W / 2,
    y: node.row * ROW_H + NODE_H / 2,
  });
  return (
    <Card data-testid="FlowGraph" className="w-full max-w-md" {...props}>
      <CardContent className="overflow-x-auto">
        <ol aria-label="Workflow nodes" className="relative list-none" style={{ width, height, minWidth: width }}>
          <svg aria-hidden className="absolute inset-0 overflow-visible" width={width} height={height}>
            {edges.map((edge) => {
              const from = nodes.find((node) => node.id === edge.from);
              const to = nodes.find((node) => node.id === edge.to);
              if (!from || !to) return null;
              const live = shownIds.has(edge.from) && shownIds.has(edge.to);
              const a = center(from);
              const b = center(to);
              const midX = (a.x + b.x) / 2;
              return (
                <path
                  key={`${edge.from}-${edge.to}`}
                  d={`M ${a.x + NODE_W / 2} ${a.y} C ${midX} ${a.y}, ${midX} ${b.y}, ${b.x - NODE_W / 2} ${b.y}`}
                  fill="none"
                  strokeWidth="1.5"
                  className={cn(
                    "transition-opacity duration-500 motion-reduce:transition-none",
                    live ? "stroke-foreground/20" : "stroke-foreground/5",
                  )}
                />
              );
            })}
          </svg>

          {shown.map((node) => (
            <li
              key={node.id}
              aria-label={`${node.label}: ${node.state}`}
              className={cn(
                "fade-in animate-in fill-mode-both absolute flex items-center justify-center rounded-md border text-center text-[11.5px] leading-tight duration-300",
                node.state === "done" && "border-foreground/10 bg-foreground/[0.04] text-muted-foreground",
                node.state === "active" && "text-foreground/90 border-primary/30 bg-primary/10 border-primary/30",
                node.state === "pending" && "border-border text-muted-foreground border-dashed",
              )}
              style={{
                left: node.column * COL_W,
                top: node.row * ROW_H,
                width: NODE_W,
                height: NODE_H,
              }}
            >
              <span className={cn(mono, "px-2")}>{node.label}</span>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
}
interface IFlowGraphProps extends Omit<
  Omit<ComponentProps<"div">, "children" | "nodes" | "edges" | "visibleCount">,
  "className" | "style"
> {
  nodes: readonly IFlowNode[];
  edges: readonly IFlowEdge[];
  visibleCount: number;
}
