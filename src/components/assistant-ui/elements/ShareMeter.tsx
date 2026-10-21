import type { JSX } from "react";
import { announced, clamp } from "../utils/range.js";
interface IShareMeterProps {
  label: string;
  percentage: number;
  valueText?: string;
  tone?: "primary" | "success" | "warning" | "destructive" | "muted";
  size?: "default" | "compact";
}
export function ShareMeter({
  label,
  percentage,
  valueText,
  tone = "primary",
  size = "default",
}: IShareMeterProps): JSX.Element {
  const value = announced(clamp(percentage, 0, 100));
  return (
    <meter
      data-testid="ShareMeter"
      data-slot="assistant-share-meter"
      data-tone={tone}
      data-size={size}
      aria-label={label}
      aria-valuetext={valueText}
      min={0}
      max={100}
      value={value}
    >
      {value}%
    </meter>
  );
}
