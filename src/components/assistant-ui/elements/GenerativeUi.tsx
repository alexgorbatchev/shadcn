import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { ReactNode } from "react";
import type { GenerativeUILibrary, GenerativeUIRenderContext } from "@assistant-ui/generative-ui/react";
import { defaultGenerativeUILibrary, renderGenerativeUI } from "@assistant-ui/generative-ui/react";
import { GeoMap, type IGeoMapPlace } from "./GeoMap.js";
import { MermaidDiagram } from "./MermaidDiagram.js";
const markdownBase = defaultGenerativeUILibrary.Markdown!;
const pinsOf = (places: unknown): IGeoMapPlace[] =>
  (Array.isArray(places) ? places : []).flatMap((place: unknown, index) => {
    if (place === null || typeof place !== "object") return [];
    if (!("label" in place) || !("lat" in place) || !("lng" in place)) return [];
    const { label, lat, lng } = place;
    const detail = "detail" in place ? place.detail : undefined;
    return typeof label === "string" && typeof lat === "number" && typeof lng === "number"
      ? [
          {
            id: String(index),
            label,
            lat,
            lng,
            description: typeof detail === "string" ? detail : undefined,
          },
        ]
      : [];
  });
/** `MarkdownTextPrimitive` cannot be reused here: it reads from message-part context, not a prop string. */
export const styledGenerativeUILibrary: GenerativeUILibrary = {
  ...defaultGenerativeUILibrary,
  Markdown: {
    properties: markdownBase.properties,
    streamProperties: markdownBase.streamProperties,
    description: "A markdown string, rendered with GitHub-flavored markdown.",
    render: ({ value, children }) => (
      <div data-aui="markdown">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{value ?? ""}</ReactMarkdown>
        {children}
      </div>
    ),
  },
  Diagram: {
    ...defaultGenerativeUILibrary.Diagram!,
    render: ({ code, title, $status }) => (
      <figure data-aui="diagram">
        <MermaidDiagram code={typeof code === "string" ? code : ""} streaming={$status === "streaming"} />
        {typeof title === "string" || typeof title === "number" ? (
          <figcaption data-aui="diagram-title">{title}</figcaption>
        ) : null}
      </figure>
    ),
  },
  Map: {
    ...defaultGenerativeUILibrary.Map!,
    render: ({ places, route }) => {
      const pins = pinsOf(places);
      return (
        <GeoMap
          data-aui="map"
          variant="embedded"
          places={pins}
          routes={
            route && pins.length > 1
              ? [
                  {
                    id: "route",
                    points: pins.map(({ lat, lng }) => [lat, lng] as const),
                  },
                ]
              : undefined
          }
        />
      );
    },
  },
};

export interface IGenerativeUiProps {
  node: unknown;
  context?: GenerativeUIRenderContext;
}

export function GenerativeUi({ node, context }: IGenerativeUiProps): ReactNode {
  return renderGenerativeUI(node, styledGenerativeUILibrary, context);
}
