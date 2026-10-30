import { useState, type ReactElement } from "react";
import {
  Button,
  DensityProvider,
  Field,
  FieldGroup,
  FieldLabel,
  OptionSelect,
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
                    <OptionSelect
                      id="prototype"
                      width="full"
                      value={selected}
                      onValueChange={setSelected}
                      options={prototypes.map((prototype) => ({ value: prototype.id, label: prototype.title }))}
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="scenario">Scenario</FieldLabel>
                    <OptionSelect
                      id="scenario"
                      width="full"
                      value={scenario}
                      onValueChange={(value) => {
                        if (value === "populated" || value === "empty" || value === "loading" || value === "error")
                          setScenario(value);
                      }}
                      options={[
                        { value: "populated", label: "Populated" },
                        { value: "empty", label: "Empty" },
                        { value: "loading", label: "Loading" },
                        { value: "error", label: "Error" },
                      ]}
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="theme">Theme</FieldLabel>
                    <OptionSelect
                      id="theme"
                      width="full"
                      value={theme}
                      onValueChange={(value) => setTheme(value === "light" ? "light" : "dark")}
                      options={[
                        { value: "dark", label: "Dark" },
                        { value: "light", label: "Light" },
                      ]}
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="density">Density</FieldLabel>
                    <OptionSelect
                      id="density"
                      width="full"
                      value={density}
                      onValueChange={(value) => setDensity(value === "compact" ? "compact" : "comfortable")}
                      options={[
                        { value: "comfortable", label: "Comfortable" },
                        { value: "compact", label: "Compact" },
                      ]}
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="viewport">Viewport</FieldLabel>
                    <OptionSelect
                      id="viewport"
                      width="full"
                      value={viewport}
                      onValueChange={setViewport}
                      options={[
                        { value: "responsive", label: "Responsive" },
                        { value: "390", label: "Mobile · 390px" },
                        { value: "1280", label: "Desktop · 1280px" },
                      ]}
                    />
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
