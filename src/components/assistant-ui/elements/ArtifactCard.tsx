import { Button } from "../../Button.js";
import type { JSX } from "react";
import type { ComponentProps } from "react";
import { ArrowUpRightIcon, FileTextIcon } from "lucide-react";
import { cn } from "../../../utils/cn.js";
import { mono } from "./constants.js";
import { ShimmerLabel } from "./ShimmerLabel.js";
export function ArtifactCard({
  title,
  meta,
  generating = false,
  words = 0,
  ...props
}: IArtifactCardProps): JSX.Element {
  return (
    <Button
      data-testid="ArtifactCard"
      data-slot="artifact-card"
      data-scroll="none"
      variant="outline"
      disabled={!props.onClick}
      {...props}
    >
      <FileTextIcon
        aria-hidden="true"
        data-icon="inline-start"
        className={cn(generating && "animate-pulse motion-reduce:animate-none")}
      />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-base font-medium">{title}</span>
        {generating ? (
          <span className={cn(mono, "text-muted-foreground flex items-center gap-1")}>
            <ShimmerLabel>Writing</ShimmerLabel>
            <span>·</span>
            <span className="tabular-nums">{words} words</span>
          </span>
        ) : (
          <span
            className={cn(
              mono,
              "fade-in blur-in-[2px] animate-in text-muted-foreground duration-300 motion-reduce:animate-none",
            )}
          >
            {meta}
          </span>
        )}
      </span>
      <ArrowUpRightIcon aria-hidden="true" data-icon="inline-start" />
    </Button>
  );
}
interface IArtifactCardProps extends Omit<
  Omit<ComponentProps<"button">, "children" | "title" | "meta" | "generating" | "words">,
  "className" | "style"
> {
  title: string;
  meta: string;
  generating?: boolean;
  words?: number;
}
