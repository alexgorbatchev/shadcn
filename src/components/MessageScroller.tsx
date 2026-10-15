import type { ComponentProps, ReactElement } from "react";
import type { IDensityProps } from "../density/types";
import { MessageScroller as MessageScrollerPrimitive } from "@shadcn/react/message-scroller";
import { ArrowDownIcon } from "lucide-react";
import { useMediaQuery } from "usehooks-ts";
import { cn } from "../utils/cn";
import { Button } from "./Button";

function MessageScrollerProvider(props: ComponentProps<typeof MessageScrollerPrimitive.Provider>): ReactElement {
  return <MessageScrollerPrimitive.Provider {...props} />;
}
type MessageScrollerProps = ComponentProps<typeof MessageScrollerPrimitive.Root> & IDensityProps;
function MessageScroller({ density, className, ...props }: MessageScrollerProps): ReactElement {
  return (
    <MessageScrollerPrimitive.Root
      data-slot="message-scroller"
      data-density={density}
      className={cn("group/message-scroller relative flex size-full min-h-0 flex-col overflow-hidden", className)}
      {...props}
    />
  );
}
type MessageScrollerViewportProps = ComponentProps<typeof MessageScrollerPrimitive.Viewport> & IDensityProps;
function MessageScrollerViewport({ density, className, ...props }: MessageScrollerViewportProps): ReactElement {
  return (
    <MessageScrollerPrimitive.Viewport
      data-slot="message-scroller-viewport"
      data-density={density}
      className={cn(
        "size-full min-h-0 min-w-0 scroll-fade-b [scrollbar-width:thin] [scrollbar-gutter:stable] overflow-y-auto overscroll-contain contain-content data-autoscrolling:[scrollbar-color:transparent_transparent] data-pending-scroll:invisible",
        className,
      )}
      {...props}
    />
  );
}
type MessageScrollerContentProps = ComponentProps<typeof MessageScrollerPrimitive.Content> & IDensityProps;
function MessageScrollerContent({ density, className, ...props }: MessageScrollerContentProps): ReactElement {
  return (
    <MessageScrollerPrimitive.Content
      data-slot="message-scroller-content"
      data-density={density}
      className={cn("flex h-max min-h-full flex-col gap-6", className)}
      {...props}
    />
  );
}
type MessageScrollerItemProps = ComponentProps<typeof MessageScrollerPrimitive.Item> & IDensityProps;
function MessageScrollerItem({
  density,
  className,
  scrollAnchor = false,
  ...props
}: MessageScrollerItemProps): ReactElement {
  return (
    <MessageScrollerPrimitive.Item
      data-slot="message-scroller-item"
      data-density={density}
      scrollAnchor={scrollAnchor}
      className={cn("min-w-0 shrink-0", className)}
      {...props}
    />
  );
}
type MessageScrollerButtonProps = ComponentProps<typeof MessageScrollerPrimitive.Button> &
  Pick<ComponentProps<typeof Button>, "variant" | "size"> &
  IDensityProps;
function MessageScrollerButton({
  density,
  direction = "end",
  behavior,
  className,
  children,
  render,
  variant = "secondary",
  size = "icon-sm",
  ...props
}: MessageScrollerButtonProps): ReactElement {
  const isReducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  return (
    <MessageScrollerPrimitive.Button
      data-slot="message-scroller-button"
      data-density={density}
      data-variant={variant}
      data-size={size}
      direction={direction}
      behavior={isReducedMotion ? "instant" : behavior}
      className={cn(
        "absolute left-1/2 -translate-x-1/2 border-border bg-background text-foreground transition-opacity duration-120 motion-reduce:transition-none hover:bg-muted hover:text-foreground data-[active=false]:pointer-events-none data-[active=false]:opacity-0 data-[active=true]:opacity-100 data-[direction=end]:bottom-4 data-[direction=start]:top-4 data-[direction=start]:[&_svg]:rotate-180",
        className,
      )}
      render={render ?? <Button density={density} variant={variant} size={size} />}
      {...props}
    >
      {children ?? (
        <>
          <ArrowDownIcon aria-hidden="true" />
          <span className="sr-only">{direction === "end" ? "Scroll to end" : "Scroll to start"}</span>
        </>
      )}
    </MessageScrollerPrimitive.Button>
  );
}
export {
  MessageScrollerProvider,
  MessageScroller,
  MessageScrollerViewport,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerButton,
};
