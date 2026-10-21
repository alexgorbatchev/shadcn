import type { JSX } from "react";
type ResearchReportProps = Omit<ComponentProps<"div">, "children" | "title" | "sections" | "sourcesRead"> & {
  title: string;
  sections: readonly IReportSection[];
  sourcesRead: number;
};
import type { ComponentProps } from "react";
import { CheckIcon, Loader2Icon } from "lucide-react";
import { cn } from "../../../utils/cn.js";
import { mono, paper } from "./constants.js";
export type SectionState = "pending" | "writing" | "done";
export interface IReportSection {
  id: string;
  heading: string;
  state: SectionState;
  sources: number;
  preview?: string;
}
export function ResearchReport({
  title,
  sections,
  sourcesRead,
  className,
  ...props
}: ResearchReportProps): JSX.Element {
  const done = sections.filter((section) => section.state === "done").length;
  return (
    <div
      data-testid="ResearchReport"
      data-slot="research-report"
      className={cn(cn(paper, "flex w-full max-w-sm flex-col gap-3 rounded-md p-4"), className)}
      {...props}
    >
      <div className="flex flex-col gap-1">
        <span className="text-base font-medium">{title}</span>
        <span className={cn(mono, "text-muted-foreground tabular-nums")}>
          {done}/{sections.length} sections · {sourcesRead} sources read
        </span>
      </div>

      <div className="flex flex-col">
        {sections.map((section) => (
          <div
            key={section.id}
            className="border-foreground/[0.06] flex flex-col gap-1 border-t py-2 first:border-t-0 first:pt-0"
          >
            <div className="flex items-center gap-2">
              <span className="flex size-3.5 shrink-0 items-center justify-center">
                {section.state === "done" ? (
                  <CheckIcon aria-hidden="true" className={cn("size-4")} />
                ) : section.state === "writing" ? (
                  <Loader2Icon aria-hidden="true" className={cn("size-4", "animate-spin motion-reduce:animate-none")} />
                ) : (
                  <span aria-hidden className="bg-foreground/15 size-1.5 rounded-full" />
                )}
              </span>
              <span
                className={cn(
                  "min-w-0 flex-1 truncate text-base",
                  section.state === "pending" ? "text-muted-foreground" : "text-foreground",
                )}
              >
                {section.heading}
              </span>
              {section.sources > 0 && (
                <span className={cn(mono, "text-muted-foreground shrink-0")}>{section.sources} src</span>
              )}
            </div>
            {section.preview && (
              <p className="text-muted-foreground fade-in animate-in ps-5.5 text-sm leading-relaxed duration-300">
                {section.preview}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
