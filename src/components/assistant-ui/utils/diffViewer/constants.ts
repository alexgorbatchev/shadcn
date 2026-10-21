import { cva } from "class-variance-authority";
export const diffViewerVariants = cva(
  "overflow-hidden rounded-md font-mono leading-relaxed [font-variant-ligatures:none]",
  {
    variants: {
      variant: {
        default: "border border-frame-edge bg-card text-card-foreground",
        ghost: "bg-transparent",
        muted: "border border-frame-edge bg-muted text-foreground",
      },
      size: { sm: "text-xs", default: "text-sm", lg: "text-base" },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);
export const diffLineVariants = cva("flex", {
  variants: {
    type: {
      add: "border-s-2 border-success bg-success/10 text-foreground",
      del: "border-s-2 border-destructive bg-destructive/10 text-foreground",
      normal: "border-s-2 border-transparent",
      marker: "border-s-2 border-transparent text-muted-foreground",
      empty: "border-s-2 border-transparent",
    },
  },
  defaultVariants: { type: "normal" },
});
export const diffLineTextVariants = cva("", {
  variants: {
    type: {
      add: "text-foreground",
      del: "text-foreground",
      normal: "text-muted-foreground",
      marker: "text-muted-foreground",
      empty: "",
    },
  },
  defaultVariants: { type: "normal" },
});
