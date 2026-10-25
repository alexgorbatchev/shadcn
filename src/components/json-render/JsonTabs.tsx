import { useState } from "react";
import { useBoundProp } from "@json-render/react";
import { type BaseComponentProps } from "@json-render/react";
import { Tabs as TabsPrimitive } from "../../index.js";
import { TabsList } from "../../index.js";
import { TabsTrigger } from "../../index.js";
import { type JsonProps } from "./catalog.js";
export const JsonTabs = ({ props, children, bindings, emit }: BaseComponentProps<JsonProps<"Tabs">>) => {
  const tabs = props.tabs ?? [];
  const [boundValue, setBoundValue] = useBoundProp<string>(props.value ?? undefined, bindings?.value);
  const [localValue, setLocalValue] = useState(props.value ?? props.defaultValue ?? tabs[0]?.value ?? "");
  const isBound = !!bindings?.value;
  const value = isBound ? (boundValue ?? tabs[0]?.value ?? "") : localValue;
  const setValue = isBound ? setBoundValue : setLocalValue;

  return (
    <TabsPrimitive
      value={value}
      onValueChange={(v) => {
        setValue(v);
        emit("change");
      }}
    >
      <TabsList>
        {tabs.map((tab) => (
          <TabsTrigger key={tab.value} value={tab.value}>
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {children}
    </TabsPrimitive>
  );
};
