import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, waitFor, within } from "storybook/test";
import { useState, type ReactElement } from "react";
import { DiagramSurface, DiagramViewer, MediaShell, useMermaidTheme } from "../../image-viewer";
import { Button } from "../../Button";

function buildThemedSequenceSvg(vars: {
  background: string;
  actorBkg: string;
  actorBorder: string;
  actorTextColor: string;
  signalColor: string;
  signalTextColor: string;
  fontFamily: string;
}): string {
  return [
    `<svg id="story-seq" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 760 320" width="760" height="320">`,
    `<style>#story-seq text { font-family: ${vars.fontFamily}; font-size: 14px; }</style>`,
    `<rect x="0" y="0" width="760" height="320" fill="${vars.background}" />`,
    `<rect x="40" y="24" width="140" height="44" rx="4" fill="${vars.actorBkg}" stroke="${vars.actorBorder}" stroke-width="1.5" />`,
    `<text x="110" y="51" text-anchor="middle" fill="${vars.actorTextColor}">App</text>`,
    `<rect x="310" y="24" width="140" height="44" rx="4" fill="${vars.actorBkg}" stroke="${vars.actorBorder}" stroke-width="1.5" />`,
    `<text x="380" y="51" text-anchor="middle" fill="${vars.actorTextColor}">Payments</text>`,
    `<rect x="580" y="24" width="140" height="44" rx="4" fill="${vars.actorBkg}" stroke="${vars.actorBorder}" stroke-width="1.5" />`,
    `<text x="650" y="51" text-anchor="middle" fill="${vars.actorTextColor}">Processor</text>`,
    `<line x1="110" y1="68" x2="110" y2="290" stroke="${vars.actorBorder}" stroke-dasharray="4 4" />`,
    `<line x1="380" y1="68" x2="380" y2="290" stroke="${vars.actorBorder}" stroke-dasharray="4 4" />`,
    `<line x1="650" y1="68" x2="650" y2="290" stroke="${vars.actorBorder}" stroke-dasharray="4 4" />`,
    `<line x1="110" y1="130" x2="380" y2="130" stroke="${vars.signalColor}" stroke-width="2" />`,
    `<text x="245" y="120" text-anchor="middle" fill="${vars.signalTextColor}">charge</text>`,
    `<line x1="380" y1="190" x2="650" y2="190" stroke="${vars.signalColor}" stroke-width="2" />`,
    `<text x="515" y="180" text-anchor="middle" fill="${vars.signalTextColor}">POST /charges</text>`,
    `<line x1="650" y1="250" x2="380" y2="250" stroke="${vars.signalColor}" stroke-width="2" stroke-dasharray="6 4" />`,
    `<text x="515" y="240" text-anchor="middle" fill="${vars.signalTextColor}">ECONNRESET</text>`,
    `</svg>`,
  ].join("");
}

function ThemedDiagramViewer(props: {
  openingWidth?: number;
  showZoomControl?: boolean;
  onZoomChange?: (zoom: "fit" | "fit-width" | number) => void;
}): ReactElement {
  const { config } = useMermaidTheme();
  const svg = buildThemedSequenceSvg(config.themeVariables);
  return (
    <div className="h-96 w-full border border-border">
      <DiagramViewer
        svg={svg}
        label="Payments failure sequence"
        description="App calls Payments; Payments calls Processor and receives ECONNRESET."
        showZoomControl={props.showZoomControl}
        openingWidth={props.openingWidth}
        onZoomChange={props.onZoomChange}
      />
    </div>
  );
}

function FullscreenDiagramExample(): ReactElement {
  const { config } = useMermaidTheme();
  const svg = buildThemedSequenceSvg(config.themeVariables);
  const [open, setOpen] = useState(false);
  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-end">
        <Button type="button" variant="outline" size="sm" onClick={() => setOpen(true)}>
          Full screen: Payments failure sequence
        </Button>
      </div>
      <div className="rounded-sm border border-border">
        <DiagramSurface
          svg={svg}
          label="Payments failure sequence"
          description="App calls Payments; Payments calls Processor and receives ECONNRESET."
        />
      </div>
      <MediaShell
        open={open}
        onOpenChange={setOpen}
        title="Payments failure sequence"
        description="Drag to pan; pinch or zoom with +, -, 0, and arrow keys."
      >
        <DiagramViewer
          svg={svg}
          label="Payments failure sequence"
          description="App calls Payments; Payments calls Processor and receives ECONNRESET."
          showZoomControl
        />
      </MediaShell>
    </div>
  );
}

const meta: Meta<typeof DiagramViewer> = {
  title: "@alexgorbatchev/shadcn/components/data-display/DiagramViewer",
  component: DiagramViewer,
  tags: ["autodocs", "test"],
  parameters: {
    docs: {
      description: {
        component:
          "Import from `@alexgorbatchev/shadcn/image-viewer`. `DiagramViewer` renders a live vector `<svg>` diagram inside the shared pan-and-zoom `ImageViewport` with `ImageZoomControl` (Fit, Fit width, zoom out/in up to 400%, keyboard shortcuts, drag/pinch/Mod+wheel, and `openingWidth` floor). Pair with `DiagramSurface` for inline rendering and `getMermaidThemeConfig` / `useMermaidTheme` to map active theme tokens onto Mermaid diagrams.",
      },
    },
  },
  args: {
    svg: buildThemedSequenceSvg({
      background: "#121417",
      actorBkg: "#1c1f24",
      actorBorder: "#6f7783",
      actorTextColor: "#eceff3",
      signalColor: "#a3abb6",
      signalTextColor: "#eceff3",
      fontFamily: "JetBrains Mono Variable, monospace",
    }),
    label: "Payments failure sequence",
    showZoomControl: true,
    onZoomChange: fn(),
  },
};
export default meta;
type Story = StoryObj<typeof DiagramViewer>;

export const ZoomableLiveSvg: Story = {
  render: (args) => <ThemedDiagramViewer showZoomControl={args.showZoomControl} onZoomChange={args.onZoomChange} />,
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const diagram = await canvas.findByRole("img", { name: "Payments failure sequence" });
    await expect(diagram).toBeVisible();
    await expect(diagram).toHaveAccessibleDescription(
      "App calls Payments; Payments calls Processor and receives ECONNRESET.",
    );
    await expect(canvasElement.querySelector("img")).toBeNull();
    await userEvent.click(canvas.getByRole("button", { name: "Zoom in" }));
    await waitFor(() => expect(canvas.getByRole("status", { name: "Zoom level" })).not.toHaveTextContent("–"));
  },
};

export const FullscreenShell: Story = {
  render: () => <FullscreenDiagramExample />,
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const opener = canvas.getByRole("button", { name: "Full screen: Payments failure sequence" });
    await userEvent.click(opener);
    const body = within(canvasElement.ownerDocument.body);
    const dialog = await body.findByRole("dialog", { name: "Payments failure sequence" });
    await waitFor(() => expect(within(dialog).getByRole("img", { name: "Payments failure sequence" })).toBeVisible());
    await expect(dialog.querySelector("img")).toBeNull();
    await userEvent.click(within(dialog).getByRole("button", { name: "Close" }));
    await waitFor(() => expect(body.queryByRole("dialog")).not.toBeInTheDocument());
  },
};
