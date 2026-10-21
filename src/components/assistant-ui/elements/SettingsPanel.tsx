import { Switch } from "../../Switch.js";
import { Button } from "../../Button.js";
import { Textarea } from "../../Textarea.js";
import { Slider } from "../../Slider.js";
import type { JSX } from "react";
type SettingsPanelProps = Omit<
  ComponentProps<"div">,
  | "children"
  | "model"
  | "models"
  | "systemPrompt"
  | "temperature"
  | "toggles"
  | "onModelChange"
  | "onSystemPromptChange"
  | "onTemperatureChange"
  | "onToggle"
> & {
  model: string;
  models: readonly string[];
  systemPrompt: string;
  temperature: number;
  toggles: readonly ISettingToggle[];
  onModelChange?: (model: string) => void;
  onSystemPromptChange?: (prompt: string) => void;
  onTemperatureChange?: (temperature: number) => void;
  onToggle?: (key: string) => void;
};
import type { ComponentProps } from "react";
import { cn } from "../../../utils/cn.js";
import { field, mono, paper } from "./constants.js";
import { clamp } from "../utils/range.js";
export interface ISettingToggle {
  key: string;
  label: string;
  detail: string;
  on: boolean;
}
export function SettingsPanel({
  model,
  models,
  systemPrompt,
  temperature,
  toggles,
  onModelChange,
  onSystemPromptChange,
  onTemperatureChange,
  onToggle,
  className,
  ...props
}: SettingsPanelProps): JSX.Element {
  return (
    <div
      data-testid="SettingsPanel"
      data-slot="settings-panel"
      className={cn(cn(paper, "flex w-full max-w-sm flex-col gap-4 rounded-md p-4"), className)}
      {...props}
    >
      <div className="flex flex-col gap-1.5">
        <span className={cn(mono, "text-muted-foreground")}>model</span>
        <div className={cn(field, "flex gap-0.5 rounded-full p-0.5")}>
          {models.map((option) => {
            const className = cn(
              "flex-1 rounded-full py-1 text-sm font-medium transition-colors duration-150",
              option === model
                ? "bg-background text-foreground"
                : onModelChange
                  ? "text-muted-foreground hover:text-muted-foreground"
                  : "text-muted-foreground",
            );
            return onModelChange ? (
              <Button
                key={option}
                type="button"
                aria-pressed={option === model}
                onClick={() => onModelChange(option)}
                variant="ghost"
              >
                {option}
              </Button>
            ) : (
              <span key={option} aria-current={option === model ? "true" : undefined} className={className}>
                {option}
              </span>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <span className={cn(mono, "text-muted-foreground")}>system prompt</span>
        <Textarea
          value={systemPrompt}
          readOnly={!onSystemPromptChange}
          onChange={(event) => onSystemPromptChange?.(event.target.value)}
          rows={3}
          aria-label="System prompt"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="flex items-baseline justify-between">
          <span className={cn(mono, "text-muted-foreground")}>temperature</span>
          <span className={cn(mono, "text-muted-foreground tabular-nums")}>{clamp(temperature, 0, 2).toFixed(1)}</span>
        </span>
        <Slider
          min={0}
          max={2}
          step={0.1}
          value={clamp(temperature, 0, 2)}
          disabled={!onTemperatureChange}
          getAriaLabel={() => "Temperature"}
          onValueChange={(next) => onTemperatureChange?.(next)}
        />
      </div>

      <div className="flex flex-col gap-2.5">
        {toggles.map((toggle) => (
          <div key={toggle.key} className="flex items-center gap-3">
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="truncate text-base">{toggle.label}</span>
              <span className="text-muted-foreground truncate text-sm">{toggle.detail}</span>
            </span>
            <Switch
              checked={toggle.on}
              disabled={!onToggle}
              aria-label={toggle.label}
              onCheckedChange={() => onToggle?.(toggle.key)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
