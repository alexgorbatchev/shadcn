import type { ComponentProps, ReactElement } from "react";
import type { Density, IDensityProps } from "../density/types";
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../utils/cn";
import { Button } from "./Button";

const attachmentVariants = cva(
  "group/attachment relative flex w-fit max-w-full min-w-0 shrink-0 flex-wrap rounded-md border bg-card text-card-foreground transition-colors motion-reduce:transition-none focus-within:ring-1 focus-within:ring-ring has-[>a,>button]:hover:bg-muted/50 data-[state=error]:border-destructive data-[state=idle]:border-dashed",
  {
    variants: {
      size: {
        default:
          "gap-control-gap text-sm has-data-[slot=attachment-content]:px-control-x has-data-[slot=attachment-content]:py-control-gap has-data-[slot=attachment-media]:p-control-gap",
        sm: "gap-control-gap text-xs has-data-[slot=attachment-content]:px-2 has-data-[slot=attachment-content]:py-1.5 has-data-[slot=attachment-media]:p-1.5",
        xs: "gap-1.5 text-xs has-data-[slot=attachment-content]:px-1.5 has-data-[slot=attachment-content]:py-1 has-data-[slot=attachment-media]:p-1",
      },
      orientation: {
        horizontal: "min-w-40 items-center",
        vertical: "w-24 flex-col has-data-[slot=attachment-content]:w-30",
      },
    },
  },
);
type AttachmentProps = ComponentProps<"div"> &
  VariantProps<typeof attachmentVariants> &
  IDensityProps & {
    state?: "idle" | "uploading" | "processing" | "error" | "done";
  };
function Attachment({
  density,
  className,
  state = "done",
  size = "default",
  orientation = "horizontal",
  ...props
}: AttachmentProps): ReactElement {
  return (
    <div
      data-slot="attachment"
      data-density={density}
      data-state={state}
      data-size={size}
      data-orientation={orientation}
      className={cn(attachmentVariants({ size, orientation }), className)}
      {...props}
    />
  );
}
const attachmentMediaVariants = cva(
  "relative flex aspect-square w-10 shrink-0 items-center justify-center overflow-hidden rounded-sm bg-muted text-foreground group-data-[orientation=vertical]/attachment:w-full group-data-[orientation=horizontal]/attachment:group-data-[size=sm]/attachment:w-8 group-data-[orientation=horizontal]/attachment:group-data-[size=xs]/attachment:w-7 group-data-[state=error]/attachment:bg-destructive/10 group-data-[state=error]/attachment:text-destructive group-data-[orientation=vertical]/attachment:*:data-[slot=spinner]:size-6! [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 group-data-[orientation=vertical]/attachment:[&_svg:not([class*='size-'])]:size-6 group-data-[size=xs]/attachment:[&_svg:not([class*='size-'])]:size-3.5",
  {
    variants: {
      variant: {
        icon: "",
        image:
          "opacity-60 group-data-[state=done]/attachment:opacity-100 group-data-[state=idle]/attachment:opacity-100 *:[img]:aspect-square *:[img]:w-full *:[img]:object-cover",
      },
    },
    defaultVariants: { variant: "icon" },
  },
);
type AttachmentMediaProps = ComponentProps<"div"> & VariantProps<typeof attachmentMediaVariants> & IDensityProps;
function AttachmentMedia({ density, className, variant = "icon", ...props }: AttachmentMediaProps): ReactElement {
  return (
    <div
      data-slot="attachment-media"
      data-density={density}
      data-variant={variant}
      className={cn(attachmentMediaVariants({ variant }), className)}
      {...props}
    />
  );
}
type AttachmentContentProps = ComponentProps<"div"> & IDensityProps;
function AttachmentContent({ density, className, ...props }: AttachmentContentProps): ReactElement {
  return (
    <div
      data-slot="attachment-content"
      data-density={density}
      className={cn(
        "max-w-full min-w-0 flex-1 leading-tight group-data-[orientation=vertical]/attachment:px-1",
        className,
      )}
      {...props}
    />
  );
}
type AttachmentTitleProps = ComponentProps<"span"> & IDensityProps;
function AttachmentTitle({ density, className, ...props }: AttachmentTitleProps): ReactElement {
  return (
    <span
      data-slot="attachment-title"
      data-density={density}
      className={cn(
        "block max-w-full min-w-0 truncate font-medium group-data-[state=processing]/attachment:shimmer group-data-[state=uploading]/attachment:shimmer",
        className,
      )}
      {...props}
    />
  );
}
type AttachmentDescriptionProps = ComponentProps<"span"> & IDensityProps;
function AttachmentDescription({ density, className, ...props }: AttachmentDescriptionProps): ReactElement {
  return (
    <span
      data-slot="attachment-description"
      data-density={density}
      className={cn(
        "mt-0.5 block max-w-full min-w-0 truncate text-xs text-muted-foreground group-data-[state=error]/attachment:text-destructive",
        className,
      )}
      {...props}
    />
  );
}
type AttachmentActionsProps = ComponentProps<"div"> & IDensityProps;
function AttachmentActions({ density, className, ...props }: AttachmentActionsProps): ReactElement {
  return (
    <div
      data-slot="attachment-actions"
      data-density={density}
      className={cn(
        "relative z-20 flex shrink-0 items-center group-data-[orientation=vertical]/attachment:absolute group-data-[orientation=vertical]/attachment:top-3 group-data-[orientation=vertical]/attachment:end-3 group-data-[orientation=vertical]/attachment:gap-1",
        className,
      )}
      {...props}
    />
  );
}
function AttachmentAction({
  className,
  variant = "ghost",
  size = "icon-xs",
  ...props
}: ComponentProps<typeof Button>): ReactElement {
  return <Button data-slot="attachment-action" variant={variant} size={size} className={className} {...props} />;
}
type AttachmentTriggerState = { slot: "attachment-trigger"; density?: Density };
type AttachmentTriggerProps = useRender.ComponentProps<"button", AttachmentTriggerState> & IDensityProps;
function AttachmentTrigger({ density, className, render, type, ...props }: AttachmentTriggerProps): ReactElement {
  return useRender({
    defaultTagName: "button",
    props: mergeProps<"button">(
      { type: render ? type : (type ?? "button"), className: cn("absolute inset-0 z-10 outline-none", className) },
      props,
    ),
    render,
    state: { slot: "attachment-trigger", density },
  });
}
type AttachmentGroupProps = ComponentProps<"div"> & IDensityProps;
function AttachmentGroup({ density, className, ...props }: AttachmentGroupProps): ReactElement {
  return (
    <div
      data-slot="attachment-group"
      data-density={density}
      className={cn(
        "flex min-w-0 scroll-fade-x snap-x snap-mandatory scroll-px-1 no-scrollbar gap-3 overflow-x-auto overscroll-x-contain py-1 *:data-[slot=attachment]:flex-none *:data-[slot=attachment]:snap-start",
        className,
      )}
      {...props}
    />
  );
}
export {
  Attachment,
  AttachmentGroup,
  AttachmentMedia,
  AttachmentContent,
  AttachmentTitle,
  AttachmentDescription,
  AttachmentActions,
  AttachmentAction,
  AttachmentTrigger,
};
