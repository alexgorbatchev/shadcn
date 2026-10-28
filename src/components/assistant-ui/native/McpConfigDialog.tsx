import { AnalyticsButton } from "../../analytics/AnalyticsButton.js";
import { AnalyticsLink } from "../../analytics/AnalyticsLink.js";
import type { PropsWithChildren, ReactElement } from "react";
import { type ReactNode } from "react";
import { type FC, useId, isValidElement } from "react";
import { useAuiState } from "@assistant-ui/store";
import {
  McpAddFormPrimitive,
  McpManagerPrimitive,
  McpServerPrimitive,
  type MCPConnectionState,
} from "@assistant-ui/react-mcp";
import {
  Loader2Icon,
  PlugIcon,
  PlugZapIcon,
  PlusIcon,
  ServerIcon,
  ShieldAlertIcon,
  Trash2Icon,
  XIcon,
} from "lucide-react";
import { Badge } from "../../Badge.js";
import { Button, buttonVariants } from "../../Button.js";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../../Dialog.js";
import { Input } from "../../Input.js";
import { Label } from "../../Label.js";
import { Separator } from "../../Separator.js";
import { STATUS_LABEL } from "../utils/mcpConfigState.js";
import { useCustomServersSection } from "../hooks/useCustomServersSection.js";
import { useServerActionFocus } from "../hooks/useServerActionFocus.js";
import { useServerAnnouncement } from "../hooks/useServerAnnouncement.js";
import { cn } from "../../../utils/cn.js";

type AddServerFormContract = {
  onClose: () => void;
};

type FormRowContract = {
  label: string;
  htmlFor: string;
  children: ReactNode;
};

export namespace McpConfigDialog {
  export type Props = {
    /** Trigger element. Defaults to a ghost button with a plug icon. */
    children?: ReactNode;
  };
}
/**
 * Drop-in MCP server configuration dialog. Lists app-defined connectors and
 * user-added custom servers, with inline auth controls and an add form.
 *
 * Mount the manager once at the root of your app, on the runtime provider
 * itself:
 * ```tsx
 * const config = AuiConfig({ mcp: McpManagerResource({ connectors }) });
 *
 * <AssistantRuntimeProvider runtime={runtime} config={config}>
 *   {children}
 * </AssistantRuntimeProvider>;
 * ```
 * then render `<McpConfigDialog />` anywhere inside it.
 */
export function McpConfigDialog({ children }: McpConfigDialog.Props): ReactElement {
  return (
    <Dialog>
      <DialogTrigger render={isValidElement(children) ? children : <Button variant="ghost" />}>
        {isValidElement(children)
          ? undefined
          : (children ?? (
              <>
                <PlugIcon aria-hidden="true" className="size-4 shrink-0" />
                MCP servers
              </>
            ))}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>MCP servers</DialogTitle>
          <DialogDescription>
            Connect to Model Context Protocol servers to expose their tools to this assistant.
          </DialogDescription>
        </DialogHeader>
        <McpManagerPrimitive.Root>
          <div className="flex flex-col gap-4">
            <ConnectorsSection />
            <Separator />
            <CustomServersSection />
          </div>
        </McpManagerPrimitive.Root>
      </DialogContent>
    </Dialog>
  );
}
McpConfigDialog.displayName = "McpConfigDialog";
const ConnectorsSection: FC = () => {
  return (
    <section className="aui-mcp-connectors flex flex-col gap-2">
      <SectionTitle>Connectors</SectionTitle>
      <div className="flex flex-col gap-2">
        <McpManagerPrimitive.Connectors>{() => <ServerCard />}</McpManagerPrimitive.Connectors>
      </div>
    </section>
  );
};
const CustomServersSection: FC = () => {
  const { showForm, listRef, addTriggerRef, onListFocus, openForm, closeForm } = useCustomServersSection();
  return (
    <section className="aui-mcp-custom-servers flex flex-col gap-2">
      <SectionTitle>Custom servers</SectionTitle>
      <div ref={listRef} className="flex flex-col gap-2" onFocus={(e) => onListFocus(e.currentTarget, e.target)}>
        <McpManagerPrimitive.CustomServers>{() => <ServerCard />}</McpManagerPrimitive.CustomServers>
      </div>
      {!showForm && (
        <McpManagerPrimitive.AddCustomTrigger ref={addTriggerRef} onClick={openForm} asChild>
          <AnalyticsButton
            component="CustomServersSection"
            className={cn(
              buttonVariants({ variant: "default" }),
              "aui-mcp-add-trigger h-control justify-start gap-2 rounded-md px-3 text-sm",
            )}
          >
            <PlusIcon aria-hidden="true" className="size-4 shrink-0" />
            Add server
          </AnalyticsButton>
        </McpManagerPrimitive.AddCustomTrigger>
      )}
      {showForm && <AddServerForm onClose={closeForm} />}
    </section>
  );
};
const SectionTitle: FC<PropsWithChildren> = ({ children }) => (
  <h3 className="text-muted-foreground text-sm font-medium tracking-wide uppercase">{children}</h3>
);
const ServerCard: FC = () => {
  return (
    <McpServerPrimitive.Root asChild>
      <div
        className={cn(
          "aui-mcp-server-card flex flex-col gap-2 rounded-md border p-3",
          "data-[connection-state=error]:border-destructive/40",
        )}
      >
        <div className="flex items-center gap-3">
          <ServerAvatar />
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="truncate text-sm font-medium">
              <McpServerPrimitive.Name />
            </span>
            <StatusLine />
          </div>
          <div className="flex items-center gap-1">
            <ServerActions />
            <McpServerPrimitive.RemoveButton asChild>
              <Button variant="ghost">
                <Trash2Icon aria-hidden="true" className="size-4 shrink-0" />
                <span className="sr-only">Remove</span>
              </Button>
            </McpServerPrimitive.RemoveButton>
          </div>
        </div>
        <ServerError />
        <ServerAnnouncement />
      </div>
    </McpServerPrimitive.Root>
  );
};
const ServerAvatar: FC = () => {
  const icon = useAuiState((s) => s.mcpServer.icon ?? null);
  const name = useAuiState((s) => s.mcpServer.name);
  return (
    <div className="bg-muted text-muted-foreground flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-md border">
      {icon ? (
        <img src={icon} alt={name} className="size-full object-cover" />
      ) : (
        <ServerIcon aria-hidden="true" className="size-4 shrink-0" />
      )}
    </div>
  );
};
const STATUS_VARIANT: Record<MCPConnectionState, "default" | "default" | "destructive"> = {
  connected: "default",
  connecting: "default",
  authRequired: "default",
  authPending: "default",
  error: "destructive",
  disconnected: "default",
};
const StatusLine: FC = () => {
  const status = useAuiState((s) => s.mcpServer.connectionState);
  const variant = STATUS_VARIANT[status];
  const label = STATUS_LABEL[status];
  return (
    <div className="text-muted-foreground flex items-center gap-1.5 text-sm">
      <Badge variant={variant}>
        {status === "connecting" && (
          <Loader2Icon aria-hidden="true" className="size-3.5 shrink-0 animate-spin motion-reduce:animate-none" />
        )}
        {label}
      </Badge>
    </div>
  );
};
const ServerAnnouncement: FC = () => {
  const announcement = useServerAnnouncement();
  return (
    <div role="status" className="sr-only">
      {announcement}
    </div>
  );
};
const ServerError: FC = () => {
  const message = useAuiState((s) => s.mcpServer.lastError?.message ?? null);
  if (!message) return null;
  return (
    <div className="border-destructive/40 bg-destructive/5 text-destructive flex items-start gap-2 rounded-md border px-2 py-1.5 text-sm">
      <ShieldAlertIcon aria-hidden="true" className="size-3.5 shrink-0" />
      <span className="break-words">{message}</span>
    </div>
  );
};
const ServerActions: FC = () => {
  const { actionRef, onActionFocus } = useServerActionFocus();
  return (
    <div className="flex flex-wrap gap-2" onFocus={(e) => onActionFocus(e.target)}>
      <McpServerPrimitive.ConnectButton ref={actionRef} asChild>
        <AnalyticsButton
          component="ServerActions"
          className={cn(buttonVariants({ variant: "default" }), "aui-mcp-server-connect h-control-sm gap-2 text-sm")}
        >
          <PlugZapIcon aria-hidden="true" className="size-3.5 shrink-0" />
          Connect
        </AnalyticsButton>
      </McpServerPrimitive.ConnectButton>
      <McpServerPrimitive.OAuthLink asChild>
        <AnalyticsLink
          component="ServerActions"
          className={cn(buttonVariants({ variant: "default" }), "aui-mcp-server-authorize h-control-sm gap-2 text-sm")}
        >
          Authorize
        </AnalyticsLink>
      </McpServerPrimitive.OAuthLink>
      <McpServerPrimitive.DisconnectButton ref={actionRef} asChild>
        <AnalyticsButton
          component="ServerActions"
          className={cn(buttonVariants({ variant: "default" }), "aui-mcp-server-disconnect h-control-sm text-sm")}
        >
          Disconnect
        </AnalyticsButton>
      </McpServerPrimitive.DisconnectButton>
    </div>
  );
};
const AddServerForm: FC<AddServerFormContract> = ({ onClose }) => {
  const formId = useId();
  const fieldIds = {
    name: `${formId}-name`,
    url: `${formId}-url`,
    auth: `${formId}-auth`,
    bearerToken: `${formId}-bearer-token`,
    scopes: `${formId}-scopes`,
  };
  return (
    <McpAddFormPrimitive.Root onSubmitted={onClose} onCancel={onClose}>
      <div className="aui-mcp-add-form flex flex-col gap-3 rounded-md border p-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium">New server</h4>
          <McpAddFormPrimitive.Cancel asChild>
            <Button type="button" variant="ghost">
              <XIcon aria-hidden="true" className="size-4 shrink-0" />
              <span className="sr-only">Close form</span>
            </Button>
          </McpAddFormPrimitive.Cancel>
        </div>
        <FormRow label="Name" htmlFor={fieldIds.name}>
          <McpAddFormPrimitive.NameField autoFocus id={fieldIds.name} asChild>
            <Input placeholder="My MCP server" />
          </McpAddFormPrimitive.NameField>
        </FormRow>
        <FormRow label="URL" htmlFor={fieldIds.url}>
          <McpAddFormPrimitive.UrlField id={fieldIds.url} asChild>
            <Input placeholder="https://example.com/mcp" />
          </McpAddFormPrimitive.UrlField>
        </FormRow>
        <FormRow label="Auth" htmlFor={fieldIds.auth}>
          <McpAddFormPrimitive.AuthSelect
            id={fieldIds.auth}
            className="aui-mcp-auth-select bg-background h-control w-full rounded-sm border px-control-x text-control"
          />
        </FormRow>
        <McpAddFormPrimitive.AuthFields>
          {({ authType }) =>
            authType === "bearer" ? (
              <FormRow label="Bearer token" htmlFor={fieldIds.bearerToken}>
                <McpAddFormPrimitive.BearerTokenField id={fieldIds.bearerToken} asChild>
                  <Input />
                </McpAddFormPrimitive.BearerTokenField>
              </FormRow>
            ) : authType === "oauth" ? (
              <FormRow label="OAuth scopes" htmlFor={fieldIds.scopes}>
                <McpAddFormPrimitive.ScopesField id={fieldIds.scopes} asChild>
                  <Input />
                </McpAddFormPrimitive.ScopesField>
              </FormRow>
            ) : null
          }
        </McpAddFormPrimitive.AuthFields>
        <McpAddFormPrimitive.Error className="text-destructive text-sm" />
        <div className="flex justify-end gap-2">
          <McpAddFormPrimitive.Cancel asChild>
            <Button type="button" variant="ghost">
              Cancel
            </Button>
          </McpAddFormPrimitive.Cancel>
          <McpAddFormPrimitive.Submit asChild>
            <Button type="submit">Add server</Button>
          </McpAddFormPrimitive.Submit>
        </div>
      </div>
    </McpAddFormPrimitive.Root>
  );
};
const FormRow: FC<FormRowContract> = ({ label, htmlFor, children }) => (
  <div className="flex flex-col gap-1.5">
    <Label htmlFor={htmlFor}>{label}</Label>
    <div className="flex flex-col gap-2">{children}</div>
  </div>
);
