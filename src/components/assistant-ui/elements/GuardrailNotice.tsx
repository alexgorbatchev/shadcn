import { Button } from "../../Button.js";
import { Alert, AlertTitle, AlertDescription } from "../../Alert.js";
import type { JSX } from "react";
import type { ComponentProps } from "react";
import { ShieldIcon } from "lucide-react";
import { cn } from "../../../utils/cn.js";
import { mono } from "./constants.js";
export function GuardrailNotice({
  title,
  explanation,
  policy,
  alternatives,
  onPick,
  ...props
}: IGuardrailNoticeProps): JSX.Element {
  return (
    <Alert data-testid="GuardrailNotice" {...props}>
      <div className="flex items-center gap-2.5">
        <ShieldIcon aria-hidden="true" className={cn("size-4", "text-warning", "rounded-sm bg-secondary p-1")} />
        <AlertTitle>{title}</AlertTitle>
        <span className={cn(mono, "text-muted-foreground shrink-0")}>{policy}</span>
      </div>

      <AlertDescription>{explanation}</AlertDescription>

      {alternatives.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <span className={cn(mono, "text-muted-foreground")}>try instead</span>
          {alternatives.map((alternative) =>
            onPick ? (
              <Button
                key={alternative}
                type="button"
                onClick={() => onPick(alternative)}
                variant="ghost"
                align="start"
                size="content"
                fullWidth
              >
                {alternative}
              </Button>
            ) : (
              <span
                key={alternative}
                className="text-muted-foreground -mx-1.5 rounded-lg px-1.5 py-1 text-start text-base"
              >
                {alternative}
              </span>
            ),
          )}
        </div>
      )}
    </Alert>
  );
}
interface IGuardrailNoticeProps extends Omit<
  Omit<ComponentProps<"div">, "children" | "title" | "explanation" | "policy" | "alternatives" | "onPick">,
  "className" | "style"
> {
  title: string;
  explanation: string;
  policy: string;
  alternatives: readonly string[];
  onPick?: (alternative: string) => void;
}
