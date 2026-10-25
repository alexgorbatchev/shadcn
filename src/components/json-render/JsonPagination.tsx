import { useState } from "react";
import { useBoundProp } from "@json-render/react";
import { type BaseComponentProps } from "@json-render/react";
import { Pagination as PaginationPrimitive } from "../../index.js";
import { PaginationContent } from "../../index.js";
import { PaginationEllipsis } from "../../index.js";
import { PaginationItem } from "../../index.js";
import { PaginationLink } from "../../index.js";
import { PaginationNext } from "../../index.js";
import { PaginationPrevious } from "../../index.js";
import { type JsonProps } from "./catalog.js";
import { getPaginationRange } from "./getPaginationRange.js";
export const JsonPagination = ({ props, bindings, emit }: BaseComponentProps<JsonProps<"Pagination">>) => {
  const [boundPage, setBoundPage] = useBoundProp<number>(props.page ?? undefined, bindings?.page);
  const [localPage, setLocalPage] = useState(props.page ?? 1);
  const currentPage = bindings?.page ? (boundPage ?? 1) : localPage;
  const setPage = bindings?.page ? setBoundPage : setLocalPage;
  const totalPages = props.totalPages ?? 1;
  const pages = getPaginationRange(currentPage, totalPages);

  return (
    <PaginationPrimitive>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href="#"
            onClick={(e) => {
              e.preventDefault();
              if (currentPage > 1) {
                setPage(currentPage - 1);
                emit("change");
              }
            }}
          />
        </PaginationItem>
        {pages.map((page, idx) =>
          page === "ellipsis" ? (
            <PaginationItem key={`ellipsis-${idx}`}>
              <PaginationEllipsis />
            </PaginationItem>
          ) : (
            <PaginationItem key={page}>
              <PaginationLink
                href="#"
                isActive={page === currentPage}
                onClick={(e) => {
                  e.preventDefault();
                  setPage(page);
                  emit("change");
                }}
              >
                {page}
              </PaginationLink>
            </PaginationItem>
          ),
        )}
        <PaginationItem>
          <PaginationNext
            href="#"
            onClick={(e) => {
              e.preventDefault();
              if (currentPage < totalPages) {
                setPage(currentPage + 1);
                emit("change");
              }
            }}
          />
        </PaginationItem>
      </PaginationContent>
    </PaginationPrimitive>
  );
};
