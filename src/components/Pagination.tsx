import type { IDensityProps } from "../density/types";
import type { ComponentProps, ReactElement } from "react";
import { ChevronLeftIcon, ChevronRightIcon, MoreHorizontalIcon } from "lucide-react";
import { cn } from "../utils/cn";

import { buttonVariants } from "./Button";
import type { VariantProps } from "class-variance-authority";

type PaginationProps = ComponentProps<"nav"> & IDensityProps;

function Pagination({ density, className, ...props }: PaginationProps): ReactElement {
  return (
    <nav
      role="navigation"
      aria-label="pagination"
      data-density={density}
      data-slot="pagination"
      className={cn("mx-auto flex w-full justify-center", className)}
      {...props}
    />
  );
}

type PaginationContentProps = ComponentProps<"ul"> & IDensityProps;

function PaginationContent({ density, className, ...props }: PaginationContentProps): ReactElement {
  return (
    <ul
      data-density={density}
      data-slot="pagination-content"
      className={cn("flex items-center gap-0.5", className)}
      {...props}
    />
  );
}

function PaginationItem({ ...props }: ComponentProps<"li">): ReactElement {
  return <li data-slot="pagination-item" {...props} />;
}

type PaginationLinkProps = {
  isActive?: boolean;
} & Pick<VariantProps<typeof buttonVariants>, "size"> &
  ComponentProps<"a">;

function PaginationLink({
  density,
  className,
  isActive,
  size = "icon",
  ...props
}: PaginationLinkProps & IDensityProps): ReactElement {
  return (
    <a
      data-density={density}
      className={cn(buttonVariants({ variant: isActive ? "outline" : "ghost", size }), className)}
      aria-current={isActive ? "page" : undefined}
      data-slot="pagination-link"
      data-active={isActive}
      {...props}
    />
  );
}

type PaginationDirectionProps = ComponentProps<typeof PaginationLink> & { text?: string };

function PaginationPrevious({
  density,
  className,
  text = "Previous",
  ...props
}: PaginationDirectionProps): ReactElement {
  return (
    <PaginationLink
      density={density}
      aria-label="Go to previous page"
      size="default"
      className={cn("ps-1.5!", className)}
      {...props}
    >
      <ChevronLeftIcon data-icon="inline-start" className="rtl:rotate-180" />
      <span className="hidden sm:block">{text}</span>
    </PaginationLink>
  );
}

function PaginationNext({ density, className, text = "Next", ...props }: PaginationDirectionProps): ReactElement {
  return (
    <PaginationLink
      density={density}
      aria-label="Go to next page"
      size="default"
      className={cn("pe-1.5!", className)}
      {...props}
    >
      <span className="hidden sm:block">{text}</span>
      <ChevronRightIcon data-icon="inline-end" className="rtl:rotate-180" />
    </PaginationLink>
  );
}

type PaginationEllipsisProps = ComponentProps<"span"> & IDensityProps;

function PaginationEllipsis({ density, className, ...props }: PaginationEllipsisProps): ReactElement {
  return (
    <span
      aria-hidden
      data-density={density}
      data-slot="pagination-ellipsis"
      className={cn("flex size-control items-center justify-center [&_svg:not([class*='size-'])]:size-4", className)}
      {...props}
    >
      <MoreHorizontalIcon />
      <span className="sr-only">More pages</span>
    </span>
  );
}

export {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
};
