import { useState, type ReactElement } from "react";
import type { IDensityProps } from "../../density/types.js";
import { Kanban, type KanbanItem, type KanbanColumn } from "../Kanban.js";
import { Gantt, type GanttTask } from "./Gantt.js";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../Tabs.js";
import { Table, TableHeader, TableHead, TableBody, TableCell, TableRow } from "../Table.js";
import { Button } from "../Button.js";
import { format } from "date-fns";
import { TZDate } from "@date-fns/tz";
type RoadmapItem = GanttTask & KanbanItem;
type RoadmapProps<T extends RoadmapItem> = IDensityProps & {
  label: string;
  items: readonly T[];
  columns: readonly KanbanColumn[];
  startDate: Date;
  days?: number;
  timeZone?: string;
  onItemsChange: (items: T[]) => void;
  onItemSelect: (item: T) => void;
};
function Roadmap<T extends RoadmapItem>({
  label,
  items,
  columns,
  startDate,
  days,
  timeZone,
  onItemsChange,
  onItemSelect,
  density,
}: RoadmapProps<T>): ReactElement {
  const [view, setView] = useState("board");
  return (
    <Tabs
      value={view}
      onValueChange={(value) => {
        if (typeof value === "string") setView(value);
      }}
      density={density}
    >
      <TabsList aria-label={`${label} view`}>
        <TabsTrigger value="board">Board</TabsTrigger>
        <TabsTrigger value="timeline">Timeline</TabsTrigger>
        <TabsTrigger value="list">List</TabsTrigger>
      </TabsList>
      <TabsContent value="board">
        <Kanban
          label={label}
          items={items}
          columns={columns}
          onItemsChange={onItemsChange}
          renderItem={(item) => (
            <Button type="button" variant="link" className="h-auto px-0" onClick={() => onItemSelect(item)}>
              {item.title}
            </Button>
          )}
        />
      </TabsContent>
      <TabsContent value="timeline">
        <Gantt
          label={label}
          tasks={items}
          startDate={startDate}
          days={days}
          timeZone={timeZone}
          onTaskSelect={onItemSelect}
          onTaskChange={(task) => onItemsChange(items.map((item) => (item.id === task.id ? task : item)))}
        />
      </TabsContent>
      <TabsContent value="list">
        <Table aria-label={label}>
          <TableHeader>
            <TableRow>
              <TableHead>Task</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Start</TableHead>
              <TableHead>End</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <Button type="button" variant="link" onClick={() => onItemSelect(item)}>
                    {item.title}
                  </Button>
                </TableCell>
                <TableCell>{columns.find((column) => column.id === item.columnId)?.label ?? item.columnId}</TableCell>
                <TableCell>{format(new TZDate(item.start, timeZone), "PP")}</TableCell>
                <TableCell>{format(new TZDate(item.end, timeZone), "PP")}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TabsContent>
    </Tabs>
  );
}
export { Roadmap };
export type { RoadmapProps, RoadmapItem };
