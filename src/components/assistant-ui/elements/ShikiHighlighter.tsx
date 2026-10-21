import { useEffect, useMemo, useReducer, useRef, useState, type FC, type JSX } from "react";
import { useShikiHighlighter, type ShikiHighlighterProps as ReactShikiHighlighterProps } from "react-shiki/core";
import {
  createHighlighterCore,
  createCssVariablesTheme,
  guessEmbeddedLanguages,
  type HighlighterCore,
  type LanguageInput,
  type ThemeInput,
} from "shiki/core";
import { createJavaScriptRegexEngine } from "shiki/engine/javascript";
import { bundledLanguages } from "shiki/langs";
import { bundledThemes } from "shiki/themes";
import { cn } from "../../../utils/cn.js";
/**
 * Props for the ShikiHighlighter component
 */
export type ShikiHighlighterProps = Omit<ReactShikiHighlighterProps, "children" | "theme" | "className" | "style"> & {
  theme?: ReactShikiHighlighterProps["theme"];
  code: string;
  highlightLines?: readonly number[] | undefined;
  /** Skips tokenization and renders the plain code while `true`. */
  streaming?: boolean;
};
const containerClassName = "aui-shiki-base";
const codeClassName =
  "overflow-x-auto rounded-b-md border border-t-0 border-border/50 p-2 font-mono text-base leading-relaxed";
const assistantUiCodeTransformer: NonNullable<ReactShikiHighlighterProps["transformers"]>[number] = {
  name: "assistant-ui:code-surface",
  pre(node) {
    this.addClassToHast(node, codeClassName);
    return node;
  },
};
const semanticCodeTheme = createCssVariablesTheme({
  name: "assistant-ui-semantic",
  variablePrefix: "--assistant-code-",
  variableDefaults: {
    foreground: "var(--foreground)",
    background: "var(--secondary)",
    "token-constant": "var(--warning)",
    "token-string": "var(--success)",
    "token-comment": "var(--muted-foreground)",
    "token-keyword": "var(--primary)",
    "token-parameter": "var(--foreground)",
    "token-function": "var(--primary)",
    "token-string-expression": "var(--success)",
    "token-punctuation": "var(--muted-foreground)",
    "token-link": "var(--primary)",
    "ansi-black": "var(--foreground)",
    "ansi-red": "var(--destructive)",
    "ansi-green": "var(--success)",
    "ansi-yellow": "var(--warning)",
    "ansi-blue": "var(--primary)",
    "ansi-magenta": "var(--primary)",
    "ansi-cyan": "var(--foreground)",
    "ansi-white": "var(--foreground)",
    "ansi-bright-black": "var(--muted-foreground)",
    "ansi-bright-red": "var(--destructive)",
    "ansi-bright-green": "var(--success)",
    "ansi-bright-yellow": "var(--warning)",
    "ansi-bright-blue": "var(--primary)",
    "ansi-bright-magenta": "var(--primary)",
    "ansi-bright-cyan": "var(--foreground)",
    "ansi-bright-white": "var(--foreground)",
  },
});
type PlainCodeProps = {
  code: string;
};
const PlainCode: FC<PlainCodeProps> = ({ code }) => (
  <pre className={cn(codeClassName, "bg-secondary text-foreground")}>
    <code>{code}</code>
  </pre>
);
const createHighlightedLinesTransformer = (
  highlightLines: readonly number[],
): NonNullable<ReactShikiHighlighterProps["transformers"]>[number] => {
  const highlightedLines = new Set(highlightLines);
  return {
    name: "assistant-ui:highlight-lines",
    line(node, line) {
      if (highlightedLines.has(line)) {
        node.tagName = "mark";
        this.addClassToHast(node, "highlighted bg-inherit text-inherit outline outline-1 outline-primary");
      }
      return node;
    },
  };
};
type HighlighterOptions = Omit<ReactShikiHighlighterProps, "children" | "language" | "theme">;
type Engine = NonNullable<ReactShikiHighlighterProps["engine"]>;
type CodeProps = {
  code: string;
  language: ShikiHighlighterProps["language"];
  theme: NonNullable<ShikiHighlighterProps["theme"]>;
  options: HighlighterOptions;
};
const namedEngines = {
  javascript: () => createJavaScriptRegexEngine(),
  oniguruma: () =>
    import("shiki/engine/oniguruma").then(({ createOnigurumaEngine }) => createOnigurumaEngine(import("shiki/wasm"))),
};
const namedEngineKeys = { javascript: {}, oniguruma: {} };
const highlighters = new WeakMap<object, Promise<HighlighterCore>>();
const attemptedLoads = new WeakMap<HighlighterCore, Set<unknown>>();
const getHighlighter = (engine: Engine) => {
  const key = typeof engine === "string" ? namedEngineKeys[engine] : engine;
  const cached = highlighters.get(key);
  if (cached) return cached;
  const highlighter = createHighlighterCore({
    engine: typeof engine === "string" ? namedEngines[engine]() : engine,
  });
  highlighters.set(key, highlighter);
  highlighter.catch(() => highlighters.delete(key));
  return highlighter;
};
const findBundled = <T,>(bundle: Record<string, T>, id: string) => (Object.hasOwn(bundle, id) ? bundle[id] : undefined);
type PendingLoad = {
  key: string;
  inputs: unknown[];
  langs: LanguageInput[];
  themes: ThemeInput[];
};
const findPendingLoad = (highlighter: HighlighterCore, { code, language, theme, options }: CodeProps): PendingLoad => {
  const attempted = attemptedLoads.get(highlighter);
  const loadedLangs = highlighter.getLoadedLanguages();
  const loadedThemes = highlighter.getLoadedThemes();
  const pending: PendingLoad = { key: "", inputs: [], langs: [], themes: [] };
  const isPending = (input: unknown, id: string, loaded: string[]) => !loaded.includes(id) && !attempted?.has(input);
  const track = (input: unknown, id: string) => {
    pending.inputs.push(input);
    pending.key += `${id}|`;
  };
  const addBundledLanguage = (lang: string) => {
    const id = lang.trim();
    const target =
      Object.entries(options.langAlias ?? {}).find(([alias]) => alias.toLowerCase() === id.toLowerCase())?.[1] ?? id;
    const bundled = findBundled(bundledLanguages, target);
    if (!bundled || !isPending(target, target, loadedLangs)) return;
    pending.langs.push(bundled);
    track(target, target);
  };
  for (const lang of [
    language,
    ...[options.preloadLanguages ?? []].flat(),
    ...[options.customLanguages ?? []].flat(),
  ]) {
    if (!lang) continue;
    if (typeof lang === "string") {
      addBundledLanguage(lang);
    } else if ("scopeName" in lang) {
      if (!isPending(lang, lang.name, loadedLangs)) continue;
      pending.langs.push(lang);
      track(lang, lang.name);
    } else if (!attempted?.has(lang)) {
      pending.langs.push(lang);
      track(lang, "*");
    }
  }
  if (typeof language === "string") {
    for (const embedded of guessEmbeddedLanguages(code, language)) {
      addBundledLanguage(embedded);
    }
  }
  const themes =
    typeof theme === "string" || "tokenColors" in theme || "settings" in theme ? [theme] : Object.values(theme);
  for (const name of themes) {
    if (typeof name !== "string") continue;
    const bundled = findBundled(bundledThemes, name);
    if (!bundled || !isPending(name, name, loadedThemes)) continue;
    pending.themes.push(bundled);
    track(name, name);
  }
  return pending;
};
/**
 * Keeps one Shiki highlighter per RegExp engine, unlike react-shiki's page-wide
 * singleton, so an explicit `engine` is honored. The JavaScript engine is the
 * default because the Oniguruma engine compiles WebAssembly, which a Content
 * Security Policy without 'wasm-unsafe-eval' blocks.
 */
type ResolvedHighlighter = {
  engine: Engine;
  highlighter: HighlighterCore;
};
const useEngineHighlighter = (engine: Engine, props: CodeProps) => {
  const [resolved, setResolved] = useState<ResolvedHighlighter>();
  const [, rerender] = useReducer((count: number) => count + 1, 0);
  const [failedKey, setFailedKey] = useState<string>();
  useEffect(() => {
    let active = true;
    getHighlighter(engine).then(
      (highlighter) => {
        if (active) setResolved({ engine, highlighter });
      },
      (error: unknown) => {
        console.error("[shiki-highlighter] highlighter failed", error);
      },
    );
    return () => {
      active = false;
    };
  }, [engine]);
  const highlighter = resolved?.engine === engine ? resolved.highlighter : undefined;
  const pending = highlighter ? findPendingLoad(highlighter, props) : undefined;
  const pendingRef = useRef(pending);
  pendingRef.current = pending;
  useEffect(() => {
    const load = pendingRef.current;
    if (!highlighter || !load?.key) return;
    const attempted = attemptedLoads.get(highlighter) ?? new Set();
    attemptedLoads.set(highlighter, attempted);
    Promise.all([highlighter.loadLanguage(...load.langs), highlighter.loadTheme(...load.themes)]).then(
      () => {
        for (const input of load.inputs) attempted.add(input);
        rerender();
      },
      (error: unknown) => {
        console.error("[shiki-highlighter] loading failed", error);
        setFailedKey(load.key);
      },
    );
  }, [highlighter, pending?.key]);
  return pending?.key === "" || pending?.key === failedKey ? highlighter : undefined;
};
const ShikiCode: FC<CodeProps> = ({ code, language, theme, options }) => {
  const highlighted = useShikiHighlighter(code, language, theme, {
    ...options,
    defaultColor: "light-dark()",
  });
  return <>{highlighted ?? <PlainCode code={code} />}</>;
};
type EngineCodeProps = CodeProps & {
  engine: Engine;
};
const EngineCode: FC<EngineCodeProps> = ({ engine, ...props }) => {
  const highlighter = useEngineHighlighter(engine, props);
  if (!highlighter) return <PlainCode code={props.code} />;
  return <ShikiCode {...props} options={{ ...props.options, highlighter }} />;
};
const HighlightedCode: FC<CodeProps> = (props) => {
  const { engine = "javascript", highlighter, ...options } = props.options;
  if (highlighter) return <ShikiCode {...props} />;
  return <EngineCode {...props} options={options} engine={engine} />;
};
/**
 * ShikiHighlighter component, using react-shiki
 *
 * Skips tokenization while `streaming` and renders the plain code in the
 * same container, so streaming costs no Shiki work and settling is a color
 * change rather than a layout shift.
 */
export function ShikiHighlighter({
  code,
  language,
  theme = semanticCodeTheme,
  // Inert: useShikiHighlighter output has no default styles or language label.
  addDefaultStyles: _addDefaultStyles,
  showLanguage: _showLanguage,
  delay = 150, // the part settles before smooth streaming finishes draining, so code keeps changing for a few frames
  streaming = false,
  highlightLines,
  ...options
}: ShikiHighlighterProps): JSX.Element {
  const trimmed = code.trim();
  const highlightKey = highlightLines?.join(",") ?? "";
  const callerTransformers = options.transformers;
  const transformers = useMemo(
    () =>
      highlightKey
        ? [
            assistantUiCodeTransformer,
            ...(callerTransformers ?? []),
            createHighlightedLinesTransformer(highlightKey.split(",").map(Number)),
          ]
        : [assistantUiCodeTransformer, ...(callerTransformers ?? [])],
    [highlightKey, callerTransformers],
  );
  return (
    <div data-testid="ShikiHighlighter" className={cn(containerClassName, streaming && "aui-shiki-streaming")}>
      {streaming ? (
        <PlainCode code={trimmed} />
      ) : (
        <HighlightedCode
          code={trimmed}
          language={language}
          theme={theme}
          options={transformers ? { ...options, delay, transformers } : { ...options, delay }}
        />
      )}
    </div>
  );
}
ShikiHighlighter.displayName = "ShikiHighlighter";
