import type { JSX, ComponentProps } from "react";
import { ChevronRightIcon, PlugIcon } from "lucide-react";
import { Badge } from "../../Badge.js";
import { Button } from "../../Button.js";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../Card.js";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "../../Collapsible.js";

export type McpServerStatus = "connected" | "connecting" | "needs-auth" | "failed";
export interface IMcpServer {
  id: string;
  name: string;
  transport: string;
  status: McpServerStatus;
  tools: readonly string[];
}
const LABEL: Record<McpServerStatus, string> = {
  connected: "connected",
  connecting: "connecting",
  "needs-auth": "needs auth",
  failed: "failed",
};

export function McpServerPanel({
  servers,
  expandedId,
  onToggle,
  onAuthorize,
  ...props
}: IMcpServerPanelProps): JSX.Element {
  const connected = servers.filter((server) => server.status === "connected").length;
  return (
    <Card data-testid="McpServerPanel" className="w-full max-w-sm" {...props}>
      <CardHeader>
        <CardTitle>Servers</CardTitle>
        <CardDescription>
          {connected} of {servers.length} connected
        </CardDescription>
      </CardHeader>
      <CardContent>
        {servers.map((server) => (
          <Collapsible key={server.id} open={expandedId === server.id} onOpenChange={() => onToggle?.(server.id)}>
            {onToggle ? (
              <CollapsibleTrigger render={<Button variant="ghost" fullWidth align="start" size="content" />}>
                <ChevronRightIcon aria-hidden="true" className={expandedId === server.id ? "rotate-90" : undefined} />
                <PlugIcon aria-hidden="true" />
                <span className="flex-1 truncate">{server.name}</span>
                <span>{server.tools.length} tools</span>
                <span className="sr-only">{LABEL[server.status]}</span>
              </CollapsibleTrigger>
            ) : (
              <div className="flex items-center gap-control-gap py-control-y">
                <PlugIcon aria-hidden="true" className="size-4" />
                {server.name}
                <span>
                  {server.tools.length} tools · {LABEL[server.status]}
                </span>
              </div>
            )}
            <CollapsibleContent>
              <div className="flex flex-col gap-control-gap py-control-y">
                <div className="flex items-center gap-control-gap text-sm text-muted-foreground">
                  <span>
                    {server.transport} · {LABEL[server.status]}
                  </span>
                  {server.status === "needs-auth" && onAuthorize && (
                    <Button variant="warning" size="sm" onClick={() => onAuthorize(server.id)}>
                      Authorize
                    </Button>
                  )}
                </div>
                <div className="flex flex-wrap gap-control-gap">
                  {server.tools.map((tool) => (
                    <Badge key={tool} variant="secondary">
                      {tool}
                    </Badge>
                  ))}
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        ))}
      </CardContent>
    </Card>
  );
}

interface IMcpServerPanelProps extends Omit<ComponentProps<"div">, "children" | "className" | "style" | "onToggle"> {
  servers: readonly IMcpServer[];
  expandedId?: string;
  onToggle?: (id: string) => void;
  onAuthorize?: (id: string) => void;
}
