import { AuiConfig } from "@assistant-ui/react";
import { McpManagerResource, McpMemoryStorage } from "@assistant-ui/react-mcp";
export const fixture_mcpConfig = AuiConfig({
  mcp: McpManagerResource({ storage: McpMemoryStorage(), autoConnect: false }),
});
