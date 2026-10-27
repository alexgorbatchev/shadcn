import { useState, type ReactElement } from "react";
import {
  Button,
  DensityProvider,
  Field,
  FieldGroup,
  FieldLabel,
  NativeSelect,
  NativeSelectOption,
  ThemeProvider,
} from "@alexgorbatchev/shadcn";
import type { PrototypeDefinition, Scenario } from "../types";

const prototypes = Object.entries(
  import.meta.glob<PrototypeDefinition>("../prototypes/*/prototype.ts", { eager: true, import: "default" }),
).map(([path, definition]) => ({ ...definition, id: path.split("/").at(-2) ?? "" }));

export function Workbench(): ReactElement {
  const parameters = new URLSearchParams(window.location.search);
  const [selected, setSelected] = useState(parameters.get("prototype") ?? "dashboard");
  const [scenario, setScenario] = useState<Scenario>(() => {
    const value = parameters.get("scenario");
    return value === "empty" || value === "loading" || value === "error" ? value : "populated";
  });
  const [theme, setTheme] = useState<"light" | "dark">(parameters.get("theme") === "light" ? "light" : "dark");
  const [density, setDensity] = useState<"comfortable" | "compact">(
    parameters.get("density") === "compact" ? "compact" : "comfortable",
  );
  const [viewport, setViewport] = useState("responsive");
  const [revision, setRevision] = useState(0);
  const definition = prototypes.find((prototype) => prototype.id === selected);
  const canvasParameters = new URLSearchParams({ canvas: "1", prototype: selected, scenario, theme, density });
  const Component = definition?.component;
  const isCanvas = parameters.get("canvas") === "1";

  return (
    <ThemeProvider forcedTheme={theme}>
      <DensityProvider density={density}>
        {isCanvas ? (
          Component ? (
            <Component scenario={scenario} />
          ) : (
            <p role="alert">Unknown prototype: {selected}</p>
          )
        ) : (
          <div className="flex h-dvh flex-col" data-scroll="none">
            <header className="shrink-0 border-b border-border p-4" data-scroll="none">
              <h1 className="mb-3 text-lg font-semibold">Prototype workbench</h1>
              <FieldGroup>
                <div className="grid grid-cols-2 items-end gap-4 md:grid-cols-4 xl:grid-cols-7">
                  <Field>
                    <FieldLabel htmlFor="prototype">Prototype</FieldLabel>
                    <NativeSelect id="prototype" value={selected} onChange={(event) => setSelected(event.target.value)}>
                      {prototypes.map((prototype) => (
                        <NativeSelectOption key={prototype.id} value={prototype.id}>
                          {prototype.title}
                        </NativeSelectOption>
                      ))}
                    </NativeSelect>
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="scenario">Scenario</FieldLabel>
                    <NativeSelect
                      id="scenario"
                      value={scenario}
                      onChange={(event) => {
                        const value = event.target.value;
                        if (value === "populated" || value === "empty" || value === "loading" || value === "error")
                          setScenario(value);
                      }}
                    >
                      <NativeSelectOption value="populated">Populated</NativeSelectOption>
                      <NativeSelectOption value="empty">Empty</NativeSelectOption>
                      <NativeSelectOption value="loading">Loading</NativeSelectOption>
                      <NativeSelectOption value="error">Error</NativeSelectOption>
                    </NativeSelect>
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="theme">Theme</FieldLabel>
                    <NativeSelect
                      id="theme"
                      value={theme}
                      onChange={(event) => setTheme(event.target.value === "light" ? "light" : "dark")}
                    >
                      <NativeSelectOption value="dark">Dark</NativeSelectOption>
                      <NativeSelectOption value="light">Light</NativeSelectOption>
                    </NativeSelect>
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="density">Density</FieldLabel>
                    <NativeSelect
                      id="density"
                      value={density}
                      onChange={(event) => setDensity(event.target.value === "compact" ? "compact" : "comfortable")}
                    >
                      <NativeSelectOption value="comfortable">Comfortable</NativeSelectOption>
                      <NativeSelectOption value="compact">Compact</NativeSelectOption>
                    </NativeSelect>
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="viewport">Viewport</FieldLabel>
                    <NativeSelect id="viewport" value={viewport} onChange={(event) => setViewport(event.target.value)}>
                      <NativeSelectOption value="responsive">Responsive</NativeSelectOption>
                      <NativeSelectOption value="390">Mobile · 390px</NativeSelectOption>
                      <NativeSelectOption value="1280">Desktop · 1280px</NativeSelectOption>
                    </NativeSelect>
                  </Field>
                  <Button onClick={() => setRevision((value) => value + 1)}>Reset data</Button>
                  <a className="text-sm underline" href={`?${canvasParameters}`} target="_blank" rel="noreferrer">
                    Open screen
                  </a>
                </div>
              </FieldGroup>
              <p className="mt-3 text-sm text-muted-foreground">
                {definition?.description ?? "Choose a prototype"} · Reset or reload restores sample data.
              </p>
            </header>
            <main className="min-h-0 flex-1 overflow-auto p-4" aria-label="Preview viewport">
              <iframe
                key={revision}
                title="Prototype preview"
                src={`?${canvasParameters}`}
                className="mx-auto block h-full min-h-96 outline outline-border"
                style={{ width: viewport === "responsive" ? "100%" : `${viewport}px` }}
              />
            </main>
          </div>
        )}
      </DensityProvider>
    </ThemeProvider>
  );
}
