import type { JSX } from "react";
type SpeakerIdentityProps = Omit<ComponentProps<"div">, "children" | "turns"> & {
  turns: readonly ISpeakerTurn[];
};
import type { ComponentProps } from "react";
import { BotIcon, UserIcon, WrenchIcon } from "lucide-react";
import { cn } from "../../../utils/cn.js";
import { mono } from "./constants.js";
export type SpeakerKind = "user" | "agent" | "subagent" | "tool";
export interface ISpeakerTurn {
  id: string;
  kind: SpeakerKind;
  name: string;
  detail?: string;
  text: string;
}
const TONE: Record<SpeakerKind, string> = {
  user: "bg-foreground/[0.06] text-muted-foreground",
  agent: "bg-primary/12 text-primary bg-primary/15 text-primary",
  subagent: "bg-foreground/[0.06] text-muted-foreground",
  tool: "bg-foreground/[0.04] text-muted-foreground",
};
export function SpeakerIdentity({ turns, className, ...props }: SpeakerIdentityProps): JSX.Element {
  return (
    <div
      data-testid="SpeakerIdentity"
      data-slot="speaker-identity"
      className={cn(cn("flex w-full max-w-sm flex-col gap-3.5"), className)}
      {...props}
    >
      {turns.map((turn) => (
        <div key={turn.id} className="flex gap-2.5">
          <span
            className={cn(
              "flex size-6 shrink-0 items-center justify-center rounded-lg",
              TONE[turn.kind],
              turn.kind === "subagent" && "rounded-full",
            )}
          >
            {turn.kind === "user" ? (
              <UserIcon aria-hidden="true" className={cn("size-4")} />
            ) : turn.kind === "tool" ? (
              <WrenchIcon aria-hidden="true" className={cn("size-4")} />
            ) : (
              <BotIcon aria-hidden="true" className={cn("size-4")} />
            )}
          </span>

          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <span className="flex items-baseline gap-1.5">
              <span className="text-base font-medium">{turn.name}</span>
              {turn.detail && <span className={cn(mono, "text-muted-foreground")}>{turn.detail}</span>}
            </span>
            <span className="text-muted-foreground text-base leading-relaxed break-words">{turn.text}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
