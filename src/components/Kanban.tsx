import { useId, type ReactElement, type ReactNode } from "react";
import type { IDensityProps } from "../density/types.js";
import { DragDropProvider } from "./DragDropProvider.js";
import { DragSource } from "./DragSource.js";
import { DropTarget } from "./DropTarget.js";
import { Button } from "./Button.js";
import { Badge } from "./Badge.js";
import { NativeSelect, NativeSelectOption } from "./NativeSelect.js";
import { ArrowDownIcon, ArrowUpIcon } from "lucide-react";
type KanbanColumn = {
  id: string;
  label: string;
};
type KanbanItem = {
  id: string;
  columnId: string;
  title: string;
};
type KanbanProps<T extends KanbanItem> = IDensityProps & {
  label: string;
  columns: readonly KanbanColumn[];
  items: readonly T[];
  onItemsChange: (items: T[]) => void;
  renderItem?: (item: T) => ReactNode;
  canMove?: (item: T, columnId: string) => boolean;
  disabled?: boolean;
};
function Kanban<T extends KanbanItem>({
  label,
  columns,
  items,
  onItemsChange,
  renderItem,
  canMove,
  disabled,
  density,
}: KanbanProps<T>): ReactElement {
  const boardId = useId();
  const type = `application/x-kanban-${boardId.replaceAll(":", "").toLowerCase()}`;
  const canDropInto = (data: unknown, columnId: string): boolean =>
    typeof data === "string" &&
    !disabled &&
    items.some((item) => item.id === data && (!canMove || canMove(item, columnId)));
  const move = (id: string, columnId: string, beforeId?: string): void => {
    const item = items.find((candidate) => candidate.id === id);
    if (
      !item ||
      disabled ||
      !columns.some((column) => column.id === columnId) ||
      (canMove && !canMove(item, columnId)) ||
      id === beforeId
    )
      return;
    const remaining = items.filter((candidate) => candidate.id !== id);
    const index = beforeId ? remaining.findIndex((candidate) => candidate.id === beforeId) : remaining.length;
    remaining.splice(index < 0 ? remaining.length : index, 0, { ...item, columnId });
    onItemsChange(remaining);
  };
  return (
    <DragDropProvider>
      <div role="region" aria-label={label} data-density={density} className="overflow-x-auto">
        <div className="grid min-w-max auto-cols-[18rem] grid-flow-col gap-4">
          {columns.map((column) => {
            const cards = items.filter((item) => item.columnId === column.id);
            return (
              <DropTarget
                key={column.id}
                accept={[type]}
                canDrop={(item) => canDropInto(item.data, column.id)}
                onDrop={(item) => {
                  if (typeof item.data === "string") move(item.data, column.id);
                }}
                render={<section aria-label={column.label} data-scroll="none" />}
                className="flex min-h-48 flex-col gap-3 rounded-sm border border-border bg-muted/30 p-3 data-over:border-primary"
              >
                <header className="flex items-center justify-between gap-2">
                  <h2 className="text-sm font-semibold">{column.label}</h2>
                  <Badge variant="secondary" aria-label={`${column.label} count`}>
                    {cards.length}
                  </Badge>
                </header>
                <ol className="grid gap-2">
                  {cards.map((item, index) => (
                    <li key={item.id}>
                      <DropTarget
                        accept={[type]}
                        canDrop={(drag) => canDropInto(drag.data, column.id)}
                        onDrop={(drag) => {
                          if (typeof drag.data === "string") move(drag.data, column.id, item.id);
                        }}
                      >
                        <DragSource
                          type={type}
                          data={item.id}
                          labels={[item.title]}
                          disabled={disabled}
                          className="grid gap-3 rounded-sm border border-border bg-card p-3 text-sm data-dragging:opacity-50"
                          role="group"
                          aria-label={item.title}
                          data-scroll="none"
                        >
                          <div>{renderItem ? renderItem(item) : <h3 className="font-medium">{item.title}</h3>}</div>
                          <div className="flex items-center gap-1">
                            <NativeSelect
                              aria-label={`Move ${item.title} to`}
                              value={column.id}
                              disabled={disabled}
                              onChange={(event) => move(item.id, event.target.value)}
                            >
                              {columns.map((target) => (
                                <NativeSelectOption
                                  key={target.id}
                                  value={target.id}
                                  disabled={Boolean(canMove && !canMove(item, target.id))}
                                >
                                  {target.label}
                                </NativeSelectOption>
                              ))}
                            </NativeSelect>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-sm"
                              aria-label={`Move ${item.title} up`}
                              disabled={disabled || index === 0}
                              onClick={() => move(item.id, column.id, cards[index - 1]?.id)}
                            >
                              <ArrowUpIcon />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-sm"
                              aria-label={`Move ${item.title} down`}
                              disabled={disabled || index === cards.length - 1}
                              onClick={() => move(cards[index + 1]!.id, column.id, item.id)}
                            >
                              <ArrowDownIcon />
                            </Button>
                          </div>
                        </DragSource>
                      </DropTarget>
                    </li>
                  ))}
                </ol>
                {!cards.length && <p className="py-6 text-center text-sm text-muted-foreground">No items</p>}
              </DropTarget>
            );
          })}
        </div>
      </div>
    </DragDropProvider>
  );
}
export { Kanban };
export type { KanbanProps, KanbanColumn, KanbanItem };
