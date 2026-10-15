import type { ReactElement } from "react";
import type { IDensityProps } from "../density/types";
import { Toast as ToastPrimitive } from "@base-ui/react/toast";
import { CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon, LoaderCircleIcon, XIcon } from "lucide-react";
import { useDensity } from "../hooks/useDensity";
import { useDirection } from "./DirectionProvider";
import { cn } from "../utils/cn";
import { Button } from "./Button";

function ToastProvider(props: ToastPrimitive.Provider.Props): ReactElement {
  return <ToastPrimitive.Provider {...props} />;
}

function ToastPortal(props: ToastPrimitive.Portal.Props): ReactElement {
  return <ToastPrimitive.Portal data-slot="toast-portal" {...props} />;
}

type ToastViewportProps = ToastPrimitive.Viewport.Props & IDensityProps;
function ToastViewport({ density, dir, className, ...props }: ToastViewportProps): ReactElement {
  const resolvedDensity = useDensity(density);
  const inheritedDirection = useDirection();
  return (
    <ToastPrimitive.Viewport
      dir={dir ?? inheritedDirection}
      data-density={resolvedDensity}
      data-slot="toast-viewport"
      className={(state) =>
        cn(
          "pointer-events-none fixed inset-x-4 bottom-4 isolate mx-auto max-w-sm outline-none sm:right-4 sm:left-auto sm:mx-0 sm:w-full",
          typeof className === "function" ? className(state) : className,
        )
      }
      {...props}
    />
  );
}

type ToastProps = ToastPrimitive.Root.Props & IDensityProps;
function Toast({ density, className, ...props }: ToastProps): ReactElement {
  return (
    <ToastPrimitive.Root
      data-density={density}
      data-slot="toast"
      className={(state) =>
        cn(
          "group/toast pointer-events-auto absolute right-0 bottom-0 w-full rounded-md border border-frame-edge bg-popover text-popover-foreground shadow-frame outline-none select-none focus-visible:ring-1 focus-visible:ring-ring [--offset-y:calc(var(--toast-offset-y)*-1-var(--toast-index)*var(--spacing-panel))] [transform:translateX(var(--toast-swipe-movement-x))_translateY(calc(var(--offset-y)+var(--toast-swipe-movement-y)))] transition-[transform,opacity] duration-120 ease-out data-limited:opacity-0 data-starting-style:opacity-0 data-ending-style:opacity-0 motion-reduce:transition-none",
          typeof className === "function" ? className(state) : className,
        )
      }
      {...props}
    />
  );
}

function ToastContent({ className, ...props }: ToastPrimitive.Content.Props): ReactElement {
  return (
    <ToastPrimitive.Content
      data-slot="toast-content"
      className={(state) =>
        cn("flex items-center gap-control-gap p-panel", typeof className === "function" ? className(state) : className)
      }
      {...props}
    />
  );
}

function ToastTitle({ className, ...props }: ToastPrimitive.Title.Props): ReactElement {
  return (
    <ToastPrimitive.Title
      data-slot="toast-title"
      className={(state) => cn("text-sm font-medium", typeof className === "function" ? className(state) : className)}
      {...props}
    />
  );
}

function ToastDescription({ className, ...props }: ToastPrimitive.Description.Props): ReactElement {
  return (
    <ToastPrimitive.Description
      data-slot="toast-description"
      className={(state) =>
        cn("text-sm text-muted-foreground", typeof className === "function" ? className(state) : className)
      }
      {...props}
    />
  );
}

function ToastAction({
  className,
  render = <Button variant="outline" size="sm" />,
  ...props
}: ToastPrimitive.Action.Props): ReactElement {
  return (
    <ToastPrimitive.Action
      data-slot="toast-action"
      render={render}
      className={(state) => cn("shrink-0", typeof className === "function" ? className(state) : className)}
      {...props}
    />
  );
}

function ToastClose({
  className,
  children,
  render = <Button variant="ghost" size="icon-sm" />,
  ...props
}: ToastPrimitive.Close.Props): ReactElement {
  return (
    <ToastPrimitive.Close
      data-slot="toast-close"
      aria-label="Close toast"
      render={render}
      className={(state) =>
        cn(
          "relative shrink-0 text-muted-foreground hover:text-foreground",
          typeof className === "function" ? className(state) : className,
        )
      }
      {...props}
    >
      {children ?? <XIcon aria-hidden="true" />}
    </ToastPrimitive.Close>
  );
}

type ToastIconProps = { type?: string };
function ToastIcon({ type }: ToastIconProps): ReactElement | null {
  switch (type) {
    case "success":
      return <CircleCheckIcon aria-hidden="true" />;
    case "info":
      return <InfoIcon aria-hidden="true" />;
    case "warning":
      return <TriangleAlertIcon aria-hidden="true" />;
    case "error":
      return <OctagonXIcon aria-hidden="true" className="text-destructive" />;
    case "loading":
      return <LoaderCircleIcon aria-hidden="true" className="animate-spin motion-reduce:animate-none" />;
    default:
      return null;
  }
}

function ToastList(): ReactElement {
  const { toasts } = ToastPrimitive.useToastManager();
  return (
    <>
      {toasts.map((toastItem) => (
        <Toast key={toastItem.id} toast={toastItem}>
          <ToastContent>
            <span data-slot="toast-icon" className="shrink-0 empty:hidden [&_svg]:size-4">
              <ToastIcon type={toastItem.type} />
            </span>
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <ToastTitle />
              <ToastDescription />
            </div>
            <ToastAction />
            <ToastClose />
          </ToastContent>
        </Toast>
      ))}
    </>
  );
}

type ToastToasterProps = ToastPrimitive.Provider.Props & IDensityProps;
function ToastToaster({ children, density, ...props }: ToastToasterProps): ReactElement {
  return (
    <ToastProvider {...props}>
      {children}
      <ToastPortal>
        <ToastViewport density={density}>
          <ToastList />
        </ToastViewport>
      </ToastPortal>
    </ToastProvider>
  );
}

const createToastManager = ToastPrimitive.createToastManager;
export {
  Toast,
  ToastToaster,
  ToastProvider,
  ToastPortal,
  ToastViewport,
  ToastContent,
  ToastTitle,
  ToastDescription,
  ToastAction,
  ToastClose,
  createToastManager,
};
