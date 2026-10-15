import { useContext, type ReactElement } from "react";
import { Toggle as TogglePrimitive } from "@base-ui/react/toggle";
import { ToggleGroup as ToggleGroupPrimitive } from "@base-ui/react/toggle-group";
import type { VariantProps } from "class-variance-authority";
import type { IDensityProps } from "../density/types.js";
import { ToggleGroupContext } from "../toggle-group/ToggleGroupContext.js";
import { toggleVariants, type ToggleProps } from "./Toggle.js";
import { cn } from "../utils/cn.js";

export type ToggleGroupProps = ToggleGroupPrimitive.Props &
  VariantProps<typeof toggleVariants> &
  IDensityProps &
  IToggleGroupLayout;

interface IToggleGroupLayout {
  spacing?: number;
}

export function ToggleGroup({
  density,
  className,
  variant,
  size,
  spacing = 2,
  orientation = "horizontal",
  children,
  style,
  ...props
}: ToggleGroupProps): ReactElement {
  return (
    <ToggleGroupPrimitive
      data-density={density}
      data-slot="toggle-group"
      data-variant={variant}
      data-size={size}
      data-spacing={spacing}
      orientation={orientation}
      style={(state) => ({
        gap: `calc(var(--spacing) * ${spacing})`,
        ...(typeof style === "function" ? style(state) : style),
      })}
      className={(state) =>
        cn(
          "group/toggle-group flex w-fit flex-row items-center rounded-sm data-[orientation=vertical]:flex-col data-[orientation=vertical]:items-stretch",
          typeof className === "function" ? className(state) : className,
        )
      }
      {...props}
    >
      <ToggleGroupContext.Provider value={{ variant, size, spacing }}>{children}</ToggleGroupContext.Provider>
    </ToggleGroupPrimitive>
  );
}

export function ToggleGroupItem({
  density,
  className,
  variant = "default",
  size = "default",
  ...props
}: ToggleProps): ReactElement {
  const context = useContext(ToggleGroupContext);
  return (
    <TogglePrimitive
      data-density={density}
      data-slot="toggle-group-item"
      data-variant={context.variant ?? variant}
      data-size={context.size ?? size}
      data-spacing={context.spacing}
      className={(state) =>
        cn(
          "shrink-0 group-data-[spacing=0]/toggle-group:rounded-none focus:relative focus:z-10 group-data-[orientation=horizontal]/toggle-group:data-[spacing=0]:first:rounded-s-sm group-data-[orientation=vertical]/toggle-group:data-[spacing=0]:first:rounded-t-sm group-data-[orientation=horizontal]/toggle-group:data-[spacing=0]:last:rounded-e-sm group-data-[orientation=vertical]/toggle-group:data-[spacing=0]:last:rounded-b-sm group-data-[orientation=horizontal]/toggle-group:data-[spacing=0]:data-[variant=outline]:border-s-0 group-data-[orientation=vertical]/toggle-group:data-[spacing=0]:data-[variant=outline]:border-t-0 group-data-[orientation=horizontal]/toggle-group:data-[spacing=0]:data-[variant=outline]:first:border-s group-data-[orientation=vertical]/toggle-group:data-[spacing=0]:data-[variant=outline]:first:border-t",
          toggleVariants({ variant: context.variant ?? variant, size: context.size ?? size }),
          typeof className === "function" ? className(state) : className,
        )
      }
      {...props}
    />
  );
}
