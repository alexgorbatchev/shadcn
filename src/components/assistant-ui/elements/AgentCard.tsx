import type { JSX } from "react";
import { useId, type ComponentProps } from "react";
import { Button } from "../../Button.js";
import { BotIcon, CheckIcon } from "lucide-react";
import { cn } from "../../../utils/cn.js";
import { field } from "./constants.js";
import { mono } from "./constants.js";
import { paper } from "./constants.js";
export interface IAgentSkill {
  name: string;
  description: string;
}
export function AgentCard({
  name,
  description,
  provider,
  version,
  model,
  endpoint,
  skills,
  connected,
  onConnect,
  ...props
}: IAgentCardProps): JSX.Element {
  const titleId = useId();
  const descriptionId = useId();
  return (
    <div
      data-testid="AgentCard"
      role="group"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      data-slot="agent-card"
      data-scroll="none"
      className={cn(paper, "flex w-full max-w-sm flex-col gap-2 rounded-md p-2")}
      {...props}
    >
      <div className="flex items-start gap-3">
        <BotIcon aria-hidden="true" className={cn("size-4")} />
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="flex items-baseline gap-2">
            <span id={titleId} className="truncate text-base font-medium">
              {name}
            </span>
            <span className={cn(mono, "text-muted-foreground shrink-0")}>v{version}</span>
          </span>
          <span className="text-muted-foreground truncate text-sm">{provider}</span>
        </div>
      </div>

      <p id={descriptionId} className="text-muted-foreground text-sm leading-relaxed">
        {description}
      </p>

      <div className="flex flex-col gap-1.5">
        {skills.map((skill) => (
          <div key={skill.name} className="flex items-baseline gap-2">
            <span className={cn(field, mono, "text-muted-foreground shrink-0 rounded-md px-1.5 py-0.5")}>
              {skill.name}
            </span>
            <span className="text-muted-foreground min-w-0 flex-1 truncate text-sm">{skill.description}</span>
          </div>
        ))}
      </div>

      <div className="border-foreground/[0.07] flex items-center gap-2 border-t pt-3">
        <span className={cn(mono, "text-muted-foreground min-w-0 flex-1 truncate")}>{endpoint}</span>
        <span className={cn(mono, "text-muted-foreground shrink-0")}>{model}</span>
      </div>

      <Button variant={connected ? "outline" : "default"} onClick={onConnect} disabled={connected || !onConnect}>
        {connected ? (
          <CheckIcon aria-hidden="true" data-icon="inline-start" className={cn("text-success")} />
        ) : undefined}
        {connected ? <>Connected</> : "Connect"}
      </Button>
    </div>
  );
}
interface IAgentCardProps extends Omit<
  ComponentProps<"div">,
  | "children"
  | "className"
  | "style"
  | "name"
  | "description"
  | "provider"
  | "version"
  | "model"
  | "endpoint"
  | "skills"
  | "connected"
  | "onConnect"
> {
  name: string;
  description: string;
  provider: string;
  version: string;
  model: string;
  endpoint: string;
  skills: readonly IAgentSkill[];
  connected: boolean;
  onConnect?: () => void;
}
