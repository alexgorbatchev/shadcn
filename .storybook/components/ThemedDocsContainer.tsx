import { DocsContainer, type DocsContainerProps } from "@storybook/addon-docs/blocks";
import { useEffect, useState, type PropsWithChildren, type ReactElement } from "react";
import { GLOBALS_UPDATED } from "storybook/internal/core-events";
import type { GlobalsUpdatedPayload } from "storybook/internal/types";
import { themes } from "storybook/theming";
import { useTernaryDarkMode } from "usehooks-ts";

export function ThemedDocsContainer({ context, children }: PropsWithChildren<DocsContainerProps>): ReactElement {
  const [globals, setGlobals] = useState(() => {
    const story = context.componentStories()[0];
    if (story) return context.getStoryContext(story).globals;
    const lastEvent: [GlobalsUpdatedPayload] | undefined = context.channel.last(GLOBALS_UPDATED);
    return lastEvent?.[0].globals ?? context.projectAnnotations.initialGlobals;
  });
  const { isDarkMode } = useTernaryDarkMode({
    defaultValue: "system",
    localStorageKey: "shadcn-alexgorbatchev-preview",
  });

  useEffect(() => {
    const onGlobalsUpdated = ({ globals: updatedGlobals }: GlobalsUpdatedPayload) => setGlobals(updatedGlobals);
    context.channel.on(GLOBALS_UPDATED, onGlobalsUpdated);
    return () => {
      context.channel.off(GLOBALS_UPDATED, onGlobalsUpdated);
    };
  }, [context.channel]);

  const isDarkTheme = globals.theme === "system" ? isDarkMode : globals.theme !== "light";

  return (
    <DocsContainer context={context} theme={isDarkTheme ? themes.dark : themes.light}>
      {children}
    </DocsContainer>
  );
}
