import { forwardRef, type ComponentPropsWithoutRef, useCallback, useRef } from "react";
import { cn } from "../../../utils/cn.js";
import { floating } from "./constants.js";
import { useFitInComposer } from "../hooks/useFitInComposer.js";
interface IComposerMenuProps extends Omit<ComponentPropsWithoutRef<"div">, "className" | "style"> {
  open: boolean;
  align?: "start" | "end";
}
export const ComposerMenu = forwardRef<HTMLDivElement, IComposerMenuProps>(function ComposerMenu(
  { open, align = "start", ...props },
  ref,
) {
  const menuRef = useRef<HTMLDivElement | null>(null);
  const fit = useFitInComposer(menuRef, align);
  const composedRef = useCallback(
    (node: HTMLDivElement | null) => {
      menuRef.current = node;
      if (typeof ref === "function") return ref(node);
      if (ref) ref.current = node;
      return undefined;
    },
    [ref],
  );
  return (
    <div
      data-testid="ComposerMenu"
      ref={composedRef}
      data-slot="composer-menu"
      data-open={open || undefined}
      inert={!open}
      style={fit ? { maxWidth: fit.maxWidth, translate: `${fit.shift}px 0` } : undefined}
      className={cn(
        floating,
        "absolute bottom-full z-10 mb-2 flex w-72 flex-col gap-0.5 rounded-md p-1.5",
        align === "start" ? "start-0 origin-bottom-left" : "end-0 origin-bottom-right",
        "transition-opacity duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none",
        open ? " opacity-100" : "pointer-events-none opacity-0",
      )}
      {...props}
    />
  );
});
