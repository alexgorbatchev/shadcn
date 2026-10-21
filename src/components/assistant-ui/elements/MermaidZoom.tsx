import { useRef, useState, type JSX, type ReactNode } from "react";
import { Maximize2Icon, MinusIcon, PlusIcon, RotateCcwIcon } from "lucide-react";
import { Button } from "../../Button.js";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "../../Dialog.js";
import { MermaidSvg } from "./MermaidSvg.js";

interface IMermaidZoomProps {
  svg: string;
  children: ReactNode;
}
interface IDiagramTransform {
  x: number;
  y: number;
  scale: number;
}
interface IDiagramDrag {
  startX: number;
  startY: number;
  originX: number;
  originY: number;
}
const INITIAL_TRANSFORM: IDiagramTransform = { x: 0, y: 0, scale: 1 };

export function MermaidZoom({ svg, children }: IMermaidZoomProps): JSX.Element {
  const [isOpen, setIsOpen] = useState(false);
  const [transform, setTransform] = useState(INITIAL_TRANSFORM);
  const viewportRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<IDiagramDrag | null>(null);
  const zoomBy = (factor: number, x?: number, y?: number) => {
    const cx = x ?? (viewportRef.current?.clientWidth ?? 0) / 2;
    const cy = y ?? (viewportRef.current?.clientHeight ?? 0) / 2;
    setTransform((current) => {
      const scale = Math.min(4, Math.max(0.5, current.scale * factor));
      const ratio = scale / current.scale;
      return { scale, x: cx - (cx - current.x) * ratio, y: cy - (cy - current.y) * ratio };
    });
  };
  return (
    <div data-testid="MermaidZoom" className="relative">
      {children}
      <Dialog
        open={isOpen}
        onOpenChange={(open) => {
          setIsOpen(open);
          if (!open) {
            setTransform(INITIAL_TRANSFORM);
            dragRef.current = null;
          }
        }}
      >
        <div className="absolute end-control-x top-control-y">
          <DialogTrigger render={<Button variant="outline" size="icon-sm" aria-label="Expand diagram" />}>
            <Maximize2Icon aria-hidden="true" />
          </DialogTrigger>
        </div>
        <DialogContent size="fullscreen">
          <DialogTitle className="sr-only">Diagram</DialogTitle>
          <div className="flex items-center gap-control-gap">
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Zoom in"
              disabled={transform.scale >= 4}
              onClick={() => zoomBy(1.25)}
            >
              <PlusIcon aria-hidden="true" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Zoom out"
              disabled={transform.scale <= 0.5}
              onClick={() => zoomBy(0.8)}
            >
              <MinusIcon aria-hidden="true" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Reset zoom"
              onClick={() => setTransform(INITIAL_TRANSFORM)}
            >
              <RotateCcwIcon aria-hidden="true" />
            </Button>
            <output aria-label="Zoom level" className="text-sm tabular-nums">
              {Math.round(transform.scale * 100)}%
            </output>
          </div>
          <div
            ref={viewportRef}
            className="h-[70dvh] w-full touch-none overflow-hidden cursor-grab active:cursor-grabbing"
            onWheel={(event) => {
              const viewport = viewportRef.current;
              if (!viewport) return;
              const rect = viewport.getBoundingClientRect();
              zoomBy(Math.exp(-event.deltaY * 0.0015), event.clientX - rect.left, event.clientY - rect.top);
            }}
            onPointerDown={(event) => {
              if (event.button !== 0) return;
              event.currentTarget.setPointerCapture(event.pointerId);
              dragRef.current = {
                startX: event.clientX,
                startY: event.clientY,
                originX: transform.x,
                originY: transform.y,
              };
            }}
            onPointerMove={(event) => {
              const drag = dragRef.current;
              if (!drag) return;
              setTransform((current) => ({
                ...current,
                x: drag.originX + event.clientX - drag.startX,
                y: drag.originY + event.clientY - drag.startY,
              }));
            }}
            onPointerUp={() => {
              dragRef.current = null;
            }}
            onPointerCancel={() => {
              dragRef.current = null;
            }}
          >
            <div
              className="h-full w-full origin-top-left"
              style={{ transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})` }}
            >
              <MermaidSvg svg={svg} isExpanded />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
