import type { ReactElement } from "react";
import type { ToasterProps } from "sonner";
import type { IDensityProps } from "../../density/types.js";
import { Toaster } from "sonner";
import { CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon, LoaderCircleIcon, XIcon } from "lucide-react";
import { useTheme } from "../../hooks/useTheme.js";
import { useDensity } from "../../hooks/useDensity.js";
import { useDirection } from "@base-ui/react/direction-provider";
import { cn } from "../../utils/cn.js";
import { buttonVariants } from "../Button.js";

type SonnerProps = ToasterProps & IDensityProps;
function Sonner({
  density,
  className,
  toastOptions,
  icons,
  theme,
  dir,
  expand = true,
  ...props
}: SonnerProps): ReactElement {
  const { resolvedTheme } = useTheme();
  const resolvedDensity = useDensity(density);
  const inheritedDirection = useDirection();
  return (
    <div data-slot="sonner" data-density={resolvedDensity} className="contents">
      <Toaster
        theme={theme ?? resolvedTheme}
        dir={dir ?? inheritedDirection}
        expand={expand}
        className={cn(
          "[&[data-sonner-toaster]]:font-mono",
          "[@media(max-width:600px)]:[&[data-sonner-toaster]]:w-auto!",
          "[@media(max-width:600px)]:[&[data-sonner-toaster]]:left-[var(--mobile-offset-left)]!",
          "[@media(max-width:600px)]:[&[data-sonner-toaster]]:right-[var(--mobile-offset-right)]!",
          "[@media(max-width:600px)]:[&[data-sonner-toaster]_[data-sonner-toast]]:w-full!",
          className,
        )}
        icons={{
          success: (
            <span>
              <CircleCheckIcon aria-hidden="true" />
            </span>
          ),
          info: (
            <span>
              <InfoIcon aria-hidden="true" />
            </span>
          ),
          warning: (
            <span>
              <TriangleAlertIcon aria-hidden="true" />
            </span>
          ),
          error: (
            <span>
              <OctagonXIcon aria-hidden="true" />
            </span>
          ),
          loading: <LoaderCircleIcon aria-hidden="true" className="animate-spin motion-reduce:animate-none" />,
          close: <XIcon aria-hidden="true" />,
          ...icons,
        }}
        toastOptions={{
          ...toastOptions,
          unstyled: toastOptions?.unstyled ?? true,
          closeButtonAriaLabel: toastOptions?.closeButtonAriaLabel ?? "Close toast",
          classNames: {
            ...toastOptions?.classNames,
            toast: cn(
              "flex w-full items-center gap-control-gap rounded-md border border-frame-edge bg-popover p-panel text-sm text-popover-foreground shadow-frame outline-none focus-visible:ring-1 focus-visible:ring-ring",
              "data-[expanded=false]:data-[front=false]:[&>*]:opacity-0 data-[expanded=false]:data-[front=false]:[--y:translateY(calc(var(--lift-amount)*var(--toasts-before)))]!",
              toastOptions?.classNames?.toast,
            ),
            title: cn("font-medium", toastOptions?.classNames?.title),
            description: cn("text-muted-foreground!", toastOptions?.classNames?.description),
            content: cn("flex min-w-0 flex-1 flex-col gap-1", toastOptions?.classNames?.content),
            icon: cn("relative flex size-4 shrink-0 [&_svg]:size-4", toastOptions?.classNames?.icon),
            loader: cn(
              "[&.sonner-loader[data-visible=false]]:[transform:translate(-50%,-50%)]",
              toastOptions?.classNames?.loader,
            ),
            actionButton: cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "ml-auto",
              toastOptions?.classNames?.actionButton,
            ),
            cancelButton: cn(buttonVariants({ variant: "ghost", size: "sm" }), toastOptions?.classNames?.cancelButton),
            closeButton: cn(
              buttonVariants({ variant: "ghost", size: "icon-sm" }),
              "relative order-last shrink-0 [&_svg]:size-4",
              "border-transparent! bg-transparent! text-inherit! hover:bg-muted! hover:text-foreground! focus-visible:border-ring!",
              toastOptions?.classNames?.closeButton,
            ),
          },
        }}
        {...props}
      />
    </div>
  );
}

export { Sonner, Sonner as SonnerToaster, Sonner as Toaster };
export { toast } from "sonner";
