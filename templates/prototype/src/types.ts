import type { ComponentType } from "react";

export type Scenario = "populated" | "empty" | "loading" | "error";
export type PrototypeProps = { scenario: Scenario };
export type PrototypeDefinition = {
  title: string;
  description: string;
  component: ComponentType<PrototypeProps>;
};
