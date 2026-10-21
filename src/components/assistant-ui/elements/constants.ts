export const paper = "bg-card border border-frame-edge text-card-foreground shadow-frame";
export const floating = "bg-popover border border-frame-edge text-popover-foreground shadow-frame";
export const field = "bg-secondary border border-input";
export const fieldInteractive = "bg-secondary border border-input transition-colors hover:bg-accent";
export const inkButton =
  "rounded-sm border border-transparent bg-primary font-semibold text-primary-foreground transition-colors hover:brightness-110 motion-reduce:transition-none";
export const labelSwap =
  "col-start-1 row-start-1 flex w-max items-center gap-1.5 leading-none transition-[opacity] duration-300 motion-reduce:transition-none";
export const labelSwapIn = "opacity-100 ";
export const labelSwapOut = "pointer-events-none select-none opacity-0";
export const collapsePanel =
  "h-(--collapsible-panel-height) overflow-hidden transition-[height] duration-200 data-[ending-style]:h-0 data-[starting-style]:h-0 motion-reduce:transition-none";
export const mono = "font-mono text-sm";
export const codeScroll = "overflow-x-auto";
export const codeSurface = "w-max min-w-full";
export const REASONING_ANIMATION_DURATION = 200;
export const HEAT_GRAPH_COLOR_SCALE: string[] = [
  "color-mix(in srgb, var(--foreground) 6%, transparent)",
  "color-mix(in srgb, var(--primary) 25%, transparent)",
  "color-mix(in srgb, var(--primary) 45%, transparent)",
  "color-mix(in srgb, var(--primary) 70%, transparent)",
  "var(--primary)",
];
