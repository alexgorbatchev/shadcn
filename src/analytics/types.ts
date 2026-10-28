import type { ReactNode } from "react";

export type AnalyticsProperties = Readonly<Record<string, string | number | boolean | null>>;

export interface IAnalyticsOptions {
  id?: string;
  properties?: AnalyticsProperties;
}

export interface IAnalyticsProps {
  analytics?: IAnalyticsOptions | false;
}

export type UIAnalyticsDetail =
  | { name: "ui.activate" }
  | { name: "ui.change-request" }
  | { name: "ui.open-request"; open: boolean }
  | { name: "ui.commit" }
  | { name: "ui.navigate" }
  | { name: "ui.drop" }
  | { name: "ui.impression" };

export interface IAnalyticsEnvelope {
  schemaVersion: 1;
  component: string;
  id?: string;
  scope: readonly string[];
  properties: AnalyticsProperties;
}

export type UIAnalyticsEvent = IAnalyticsEnvelope & UIAnalyticsDetail;

export interface IAnalyticsTransport {
  track(event: UIAnalyticsEvent): void | Promise<void>;
}

export interface IAnalyticsProviderProps {
  children: ReactNode;
  transport: IAnalyticsTransport;
  enabled?: boolean;
  filter?: (event: UIAnalyticsEvent) => boolean;
  onError?: (error: unknown) => void;
}

export interface IAnalyticsScopeProps {
  children: ReactNode;
  name: string;
  properties?: AnalyticsProperties;
  enabled?: boolean;
}

export interface IAnalyticsContext {
  enabled: boolean;
  scope: readonly string[];
  properties: AnalyticsProperties;
  send(event: UIAnalyticsEvent, source?: Event): void;
}
