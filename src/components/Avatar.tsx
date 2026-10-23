import type { IDensityProps } from "../density/types.js";
import type { ComponentProps, ReactElement } from "react";

import { Avatar as AvatarPrimitive } from "@base-ui/react/avatar";
import { cn } from "../utils/cn.js";

type AvatarProps = AvatarPrimitive.Root.Props & {
  size?: "default" | "sm" | "lg" | "preview" | "full";
  shape?: "circle" | "square";
} & IDensityProps;

function Avatar({ density, className, size = "default", shape = "circle", ...props }: AvatarProps): ReactElement {
  return (
    <AvatarPrimitive.Root
      data-density={density}
      data-slot="avatar"
      data-size={size}
      data-shape={shape}
      className={(state) =>
        cn(
          "group/avatar relative flex size-8 shrink-0 rounded-full select-none after:absolute after:inset-0 after:rounded-full after:border after:border-border  data-[size=lg]:size-10 data-[size=sm]:size-6 ",
          "data-[shape=square]:rounded-none data-[shape=square]:after:rounded-none",
          "data-[size=preview]:size-64",
          "data-[size=full]:aspect-square data-[size=full]:h-auto data-[size=full]:w-full",
          typeof className === "function" ? className(state) : className,
        )
      }
      {...props}
    />
  );
}

type AvatarImageProps = AvatarPrimitive.Image.Props & IDensityProps;

function AvatarImage({ density, className, ...props }: AvatarImageProps): ReactElement {
  return (
    <AvatarPrimitive.Image
      data-density={density}
      data-slot="avatar-image"
      className={(state) =>
        cn(
          "aspect-square size-full rounded-full object-cover group-data-[shape=square]/avatar:rounded-none",
          typeof className === "function" ? className(state) : className,
        )
      }
      {...props}
    />
  );
}

type AvatarFallbackProps = AvatarPrimitive.Fallback.Props & IDensityProps;

function AvatarFallback({ density, className, ...props }: AvatarFallbackProps): ReactElement {
  return (
    <AvatarPrimitive.Fallback
      data-density={density}
      data-slot="avatar-fallback"
      className={(state) =>
        cn(
          "flex size-full items-center justify-center rounded-full bg-muted text-sm text-muted-foreground group-data-[size=sm]/avatar:text-xs group-data-[shape=square]/avatar:rounded-none",
          typeof className === "function" ? className(state) : className,
        )
      }
      {...props}
    />
  );
}

type AvatarBadgeProps = ComponentProps<"span"> & IDensityProps;

function AvatarBadge({ density, className, ...props }: AvatarBadgeProps): ReactElement {
  return (
    <span
      data-density={density}
      data-slot="avatar-badge"
      className={cn(
        "absolute right-0 bottom-0 z-10 inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground bg-blend-color ring-2 ring-background select-none",
        "group-data-[size=sm]/avatar:size-2 group-data-[size=sm]/avatar:[&>svg]:hidden",
        "group-data-[size=default]/avatar:size-2.5 group-data-[size=default]/avatar:[&>svg]:size-2",
        "group-data-[size=lg]/avatar:size-3 group-data-[size=lg]/avatar:[&>svg]:size-2",
        className,
      )}
      {...props}
    />
  );
}

type AvatarGroupProps = ComponentProps<"div"> & IDensityProps;

function AvatarGroup({ density, className, ...props }: AvatarGroupProps): ReactElement {
  return (
    <div
      data-density={density}
      data-slot="avatar-group"
      className={cn(
        "group/avatar-group flex [&>*+*]:-ms-2 *:data-[slot=avatar]:ring-2 *:data-[slot=avatar]:ring-background",
        className,
      )}
      {...props}
    />
  );
}

type AvatarGroupCountProps = ComponentProps<"div"> & IDensityProps;

function AvatarGroupCount({ density, className, ...props }: AvatarGroupCountProps): ReactElement {
  return (
    <div
      data-density={density}
      data-slot="avatar-group-count"
      className={cn(
        "relative flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-sm text-muted-foreground ring-2 ring-background group-has-data-[size=lg]/avatar-group:size-10 group-has-data-[size=sm]/avatar-group:size-6 [&>svg]:size-4 group-has-data-[size=lg]/avatar-group:[&>svg]:size-5 group-has-data-[size=sm]/avatar-group:[&>svg]:size-3",
        className,
      )}
      {...props}
    />
  );
}

export { Avatar, AvatarImage, AvatarFallback, AvatarGroup, AvatarGroupCount, AvatarBadge };
