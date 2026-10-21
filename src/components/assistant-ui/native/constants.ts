import { cva } from "class-variance-authority";
export const toolGroupVariants = cva("aui-tool-group-root group/tool-group w-full", {
  variants: {
    variant: {
      outline: "rounded-md border py-3",
      ghost: "",
      muted: "border-muted-foreground/30 bg-muted/30 rounded-md border py-3",
    },
  },
  defaultVariants: { variant: "outline" },
});
