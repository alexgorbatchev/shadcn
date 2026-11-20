import { useState, type ReactNode } from "react";
import { useBoundProp } from "@json-render/react";
import { type BaseComponentProps } from "@json-render/react";
import { Tabs as TabsPrimitive } from "../../index.js";
import { TabsContent } from "../../index.js";
import { TabsList } from "../../index.js";
import { TabsTrigger } from "../../index.js";
import { type JsonProps } from "./catalog.js";
import { JsonRevealScope } from "./JsonForm.js";

function toChildList(children: ReactNode): ReactNode[] {
  if (Array.isArray(children)) return children;
  return children === undefined || children === null ? [] : [children];
}

export const JsonTabs = ({ props, children, bindings, emit }: BaseComponentProps<JsonProps<"Tabs">>) => {
  const tabs = props.tabs ?? [];
  const [boundValue, setBoundValue] = useBoundProp<string>(props.value ?? undefined, bindings?.value);
  const [localValue, setLocalValue] = useState(props.value ?? props.defaultValue ?? tabs[0]?.value ?? "");
  const isBound = !!bindings?.value;
  const value = isBound ? (boundValue ?? tabs[0]?.value ?? "") : localValue;
  const setValue = isBound ? setBoundValue : setLocalValue;
  const childList = toChildList(children);
  const hasPanels = childList.length > 0;
  const extraChildren = childList.slice(tabs.length);

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
      {hasPanels &&
        tabs.map((tab, index) => (
          <TabsContent key={tab.value} value={tab.value} keepMounted>
            <JsonRevealScope onReveal={() => setValue(tab.value)}>{childList[index]}</JsonRevealScope>
          </TabsContent>
        ))}
      {extraChildren}
    </TabsPrimitive>
  );
};
