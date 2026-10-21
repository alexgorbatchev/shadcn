import type { FC, JSX } from "react";
import { Badge } from "../../Badge.js";
type IconComponent = FC;
export type DirectiveTextSegment =
  | {
      readonly kind: "text";
      readonly text: string;
    }
  | {
      readonly kind: "mention";
      readonly type: string;
      readonly label: string;
      readonly id: string;
    };
export interface IDirectiveTextFormatter {
  parse(text: string): readonly DirectiveTextSegment[];
}
export interface ICreateDirectiveTextOptions {
  iconMap?: Record<string, IconComponent>;
  fallbackIcon?: IconComponent;
}
interface IDirectiveTextProps {
  text: string;
  formatter: IDirectiveTextFormatter;
  options?: ICreateDirectiveTextOptions;
}
export function DirectiveText({ text, formatter, options }: IDirectiveTextProps): JSX.Element {
  const iconMap = options?.iconMap;
  const fallbackIcon = options?.fallbackIcon;
  const segments = formatter.parse(text);
  return (
    <span data-testid="DirectiveText" className="whitespace-pre-wrap">
      {segments.map((seg, i) => {
        if (seg.kind === "text") {
          return (
            <span key={i} className="whitespace-pre-wrap">
              {seg.text}
            </span>
          );
        }
        const Icon = iconMap?.[seg.type] ?? fallbackIcon;
        return (
          <Badge
            key={i}
            variant="default"
            data-slot="directive-text-chip"
            data-directive-type={seg.type}
            data-directive-id={seg.id}
            aria-label={`${seg.type}: ${seg.label}`}
          >
            {Icon && <Icon />}
            {seg.label}
          </Badge>
        );
      })}
    </span>
  );
}
