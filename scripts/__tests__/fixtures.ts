import manifest from "../../package.json";

export const fixture_scrollGuardBrowserSource: string = `
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ScrollGuard, ThemeProvider } from "@alexgorbatchev/shadcn";

const root = createRoot(document.getElementById("root"));
root.render(
  <StrictMode>
    <ThemeProvider forcedTheme="dark" controlledTheme={{ theme: "dark", setTheme: () => {} }}>
      <ScrollGuard />
      <div id="guarded" data-scroll="none" style={{ width: 100, height: 100, overflow: "auto" }}>
        <div style={{ width: 50, height: 300 }}>Overflowing content</div>
      </div>
    </ThemeProvider>
  </StrictMode>,
);
let frames = 0;
function ready() {
  if (++frames < 12) requestAnimationFrame(ready);
  else document.body.dataset.checked = "true";
}
requestAnimationFrame(ready);
`;
export const fixture_coverageConfigSource: string = `
import { defineConfig } from "vitest/config";
export default defineConfig({
  root: import.meta.dirname,
  logLevel: "silent",
  test: {
    include: ["test/*.test.ts"],
    coverage: { provider: "istanbul", include: ["src/**/*.ts"], reporter: ["json"], reportsDirectory: "coverage" },
  },
  plugins: [{
    name: "test:concurrent-uncovered-transform",
    transform: {
      order: "post",
      async handler(code, id) {
        if (id.includes("/src/uncovered.ts") && id.includes("vitest-uncovered-coverage=true")) {
          await this.environment.transformRequest(import.meta.dirname + "/src/other.ts?concurrent-transform");
        }
      },
    },
  }],
});
`;
export const fixture_coverageTestSource: string = `
import { expect, test } from "vitest";
import { covered } from "../src/covered.js";
test("executes the covered module", () => expect(covered(2)).toBe(3));
`;
export const fixture_packageTypeConsumerSource: string = `
import { Button, ContextMenuCheckboxItem, DropdownMenuCheckboxItem, MenubarCheckboxItem,
  PaginationPrevious, PaginationNext, FieldSeparator } from "@alexgorbatchev/shadcn";

const elements = [
  <Button density="compact" onClick={(event) => event.currentTarget.focus()}>Save</Button>,
  <ContextMenuCheckboxItem checked onCheckedChange={(checked) => checked.valueOf()}>Show</ContextMenuCheckboxItem>,
  <DropdownMenuCheckboxItem checked onCheckedChange={(checked) => checked.valueOf()}>Show</DropdownMenuCheckboxItem>,
  <MenubarCheckboxItem checked onCheckedChange={(checked) => checked.valueOf()}>Show</MenubarCheckboxItem>,
  <PaginationPrevious href="?page=1" text="Back" density="compact" />,
  <PaginationNext href="?page=3" text="Forward" density="comfortable" />,
  <FieldSeparator density="compact"><span>Or</span></FieldSeparator>,
];
void elements;
`;

export const fixture_packageRenderSource: string = `
import { renderToStaticMarkup } from "react-dom/server";
import { jsx } from "react/jsx-runtime";
import { Button } from "@alexgorbatchev/shadcn";

const buttons = [];
const markup = renderToStaticMarkup(jsx("main", {
  children: [jsx(Button, { children: "Save" }, "save"), jsx(Button, { disabled: true, children: "Archive" }, "archive")],
}));
const rewriter = new HTMLRewriter().on("button", {
  element(element) {
    buttons.push({ type: element.getAttribute("type"), disabled: element.hasAttribute("disabled"), text: "" });
  },
  text(chunk) {
    buttons[buttons.length - 1].text += chunk.text;
  },
});
await rewriter.transform(new Response(markup)).text();
console.log(JSON.stringify(buttons));
`;

export const fixture_otpServerRenderSource: string = `
import { renderToString } from "react-dom/server";
import { jsx } from "react/jsx-runtime";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@alexgorbatchev/shadcn/input-otp";

const inputs = [];
const markup = renderToString(jsx("main", {
  children: [
    { label: "Saved code", defaultValue: "123456" },
    { label: "Empty code", defaultValue: "" },
    { label: "Controlled code", defaultValue: "123456", value: "654321" },
  ].map(({ label, ...props }) => jsx(InputOTP, {
    ...props, maxLength: 6, name: "code", "aria-label": label,
    children: jsx(InputOTPGroup, {
      children: Array.from({ length: 6 }, (_, index) => jsx(InputOTPSlot, { index }, index)),
    }),
  }, label)),
}));
await new HTMLRewriter().on("input", {
  element(element) {
    inputs.push({ label: element.getAttribute("aria-label"), value: element.getAttribute("value"),
      name: element.getAttribute("name"), maxLength: element.getAttribute("maxlength") });
  },
}).transform(new Response(markup)).text();
console.log(JSON.stringify(inputs));
`;

export const fixture_chartServerRenderSource: string = `
import { renderToString } from "react-dom/server";
import { jsx } from "react/jsx-runtime";
import { Bar, BarChart } from "recharts";
import { ChartContainer, ChartStyle } from "@alexgorbatchev/shadcn/chart";

const config = { desktop: { label: "Desktop", theme: { light: "var(--primary)", dark: "var(--success)" } } };
const markup = renderToString(jsx("main", {
  children: [
    jsx(ChartContainer, {
      id: "visitors: daily[α]",
      "aria-label": "Monthly visitors",
      config,
      children: jsx(BarChart, { data: [{ desktop: 186 }], children: jsx(Bar, { dataKey: "desktop" }) }),
    }, "chart"),
    jsx(ChartStyle, { id: "standalone: daily[α]", config }, "style"),
  ],
}));
const charts = [];
let styleCount = 0;
await new HTMLRewriter()
  .on("[data-chart]", { element(element) {
    charts.push({ id: element.getAttribute("data-chart"), label: element.getAttribute("aria-label") });
  } })
  .on("style", { element() { styleCount += 1; } })
  .transform(new Response(markup)).text();
console.log(JSON.stringify({ hasBrowserCSS: typeof CSS !== "undefined", charts, styleCount }));
`;

export const fixture_questionnaireServerRenderSource: string = `
import { renderToString } from "react-dom/server";
import { jsx, jsxs } from "react/jsx-runtime";
import { Questionnaire, QuestionnaireProgress, QuestionnaireItem, QuestionnaireTitle, QuestionnaireChoice,
  QuestionnaireActions, QuestionnairePrevious, QuestionnaireNext, QuestionnaireSubmit } from "@alexgorbatchev/shadcn/questionnaire";
const markup = renderToString(jsxs(Questionnaire, {
  defaultItem: "review", shortcuts: "numbers",
  items: [
    { name: "task", required: true, choices: [{ value: "build" }] },
    { name: "disabled", disabled: true, choices: [{ value: "private" }] },
    { name: "review", required: true, choices: [{ value: "unavailable", disabled: true }, { value: "tests" }] },
  ],
  children: [
    jsx(QuestionnaireProgress, {}),
    jsxs(QuestionnaireItem, { name: "task", required: true, children: [jsx(QuestionnaireTitle, { children: "Task" }), jsx(QuestionnaireChoice, { value: "build", children: "Build" })] }),
    jsxs(QuestionnaireItem, { name: "disabled", disabled: true, children: [jsx(QuestionnaireTitle, { children: "Private" }), jsx(QuestionnaireChoice, { value: "private", children: "Private" })] }),
    jsxs(QuestionnaireItem, { name: "review", required: true, children: [jsx(QuestionnaireTitle, { children: "Review" }), jsx(QuestionnaireChoice, { value: "unavailable", disabled: true, children: "Unavailable" }), jsx(QuestionnaireChoice, { value: "tests", children: "Run tests" })] }),
    jsxs(QuestionnaireActions, { children: [jsx(QuestionnairePrevious, {}), jsx(QuestionnaireNext, {}), jsx(QuestionnaireSubmit, {})] }),
  ],
}));
const items = [], choices = [], actions = [];
let progress;
await new HTMLRewriter()
  .on("fieldset", { element(element) { items.push({ active: element.hasAttribute("data-active"), hidden: element.hasAttribute("hidden"), inert: element.hasAttribute("inert"), disabled: element.hasAttribute("disabled") }); } })
  .on('[role="progressbar"]', { element(element) { progress = { current: element.getAttribute("aria-valuenow"), total: element.getAttribute("aria-valuemax"), text: "" }; }, text(chunk) { progress.text += chunk.text; } })
  .on("input", { element(element) { choices.push({ value: element.getAttribute("value"), disabled: element.hasAttribute("disabled"), shortcut: element.getAttribute("aria-keyshortcuts") }); } })
  .on("button", { element(element) { actions.push({ type: element.getAttribute("type"), hidden: element.hasAttribute("hidden"), inert: element.hasAttribute("inert"), text: "" }); }, text(chunk) { actions[actions.length - 1].text += chunk.text; } })
  .transform(new Response(markup)).text();
console.log(JSON.stringify({ hasWindow: typeof window !== "undefined", items, choices, actions, progress }));
`;
export const fixture_scrollerServerRenderSource: string = `
import { renderToString } from "react-dom/server";
import { jsx, jsxs } from "react/jsx-runtime";
import { MessageScrollerProvider, MessageScroller, MessageScrollerViewport, MessageScrollerContent,
  MessageScrollerItem, MessageScrollerButton } from "@alexgorbatchev/shadcn/message-scroller";
const transcripts = [];
for (const position of ["start", "end", "last-anchor"]) {
  const markup = renderToString(jsx(MessageScrollerProvider, {
    defaultScrollPosition: position,
    children: jsxs(MessageScroller, {
      children: [jsx(MessageScrollerViewport, {
        children: jsx(MessageScrollerContent, {
          "aria-busy": true,
          children: [
            jsx(MessageScrollerItem, { messageId: "question", scrollAnchor: true, children: "Saved question" }, "question"),
            jsx(MessageScrollerItem, { messageId: "answer", children: "Saved answer" }, "answer"),
          ],
        }),
      }), jsx(MessageScrollerButton, {})],
    }),
  }));
  const transcript = { position, rootPending: false, viewport: null, content: null, items: [], controls: [] };
  await new HTMLRewriter()
    .on('[data-slot="message-scroller"]', { element(element) { transcript.rootPending = element.hasAttribute("data-pending-scroll"); } })
    .on('[role="region"]', { element(element) { transcript.viewport = { label: element.getAttribute("aria-label"), tabIndex: element.getAttribute("tabindex"), pending: element.hasAttribute("data-pending-scroll") }; } })
    .on('[role="log"]', { element(element) { transcript.content = { relevant: element.getAttribute("aria-relevant"), busy: element.getAttribute("aria-busy") }; } })
    .on('[data-message-id]', { element(element) { transcript.items.push({ id: element.getAttribute("data-message-id"), anchor: element.getAttribute("data-scroll-anchor") }); } })
    .on('button', { element(element) { transcript.controls.push({ type: element.getAttribute("type"), inert: element.hasAttribute("inert"), tabIndex: element.getAttribute("tabindex"), active: element.getAttribute("data-active") }); } })
    .transform(new Response(markup)).text();
  transcripts.push(transcript);
}
console.log(JSON.stringify({ hasWindow: typeof window !== "undefined", transcripts }));
`;

export const fixture_optionalPeerNames: readonly string[] = Object.entries(manifest.peerDependenciesMeta)
  .filter(([, metadata]) => metadata.optional)
  .map(([name]) => name);

export const fixture_featureTypeExports: Record<string, string> = {
  core: "Button",
  "assistant-ui": "ApprovalCard, type IApprovalCardProps",
  chart: "ChartContainer, ChartStyle, useChart, type ChartConfig",
  calendar: "Calendar, CalendarDayButton",
  "persian-calendar": "PersianCalendar",
  carousel: "Carousel, useCarousel, type CarouselApi",
  command: "Command, CommandDialog",
  resizable: "Resizable, SplitView",
  sonner: "Sonner, toast, useSonner",
  "input-otp": "InputOTP, InputOTPSlot",
  "message-scroller": "MessageScroller, useMessageScroller, type MessageScrollerScrollOptions",
  "virtual-table": "VirtualTable, type IVirtualTableRowProps",
  questionnaire: "Questionnaire, type QuestionnaireItemDefinition",
  fonts: "Button",
};

export const fixture_featureTypePaths: Record<string, string> = {
  core: "@alexgorbatchev/shadcn",
  "assistant-ui": "@alexgorbatchev/shadcn/assistant-ui/approval-card",
  fonts: "@alexgorbatchev/shadcn",
};

export const fixture_featureConsumers: ReadonlyArray<readonly [string, readonly string[], string, string]> = [
  [
    "virtual-table",
    ["@tanstack/react-virtual"],
    `
    import { renderToString } from "react-dom/server";
    import { VirtualTable } from "@alexgorbatchev/shadcn/virtual-table";
    import { TableHead, TableRow, TableCell } from "@alexgorbatchev/shadcn";
    const markup = renderToString(<VirtualTable items={["One"]} getItemKey={String} label="Items" columnCount={1}
      header={<TableRow><TableHead>Name</TableHead></TableRow>}
      renderRow={(item, props) => <TableRow {...props}><TableCell>{item}</TableCell></TableRow>} />);
    console.log(markup.includes('aria-rowcount="2"') && markup.includes('role="region"'));
    `,
    "true",
  ],
  [
    "assistant-ui",
    [],
    `import { renderToString } from "react-dom/server"; import { jsx } from "react/jsx-runtime"; import { ApprovalCard } from "@alexgorbatchev/shadcn/assistant-ui/approval-card"; const markup = renderToString(jsx(ApprovalCard, { state: "request", title: "Inspect service", subtitle: "Service inspection", description: "Read service status", onAllowOnce() {}, onDeny() {} })); console.log(JSON.stringify(markup.includes("Inspect service") && markup.includes("Allow once")));`,
    "true",
  ],
  [
    "core",
    [],
    fixture_packageRenderSource,
    JSON.stringify([
      { type: "button", disabled: false, text: "Save" },
      { type: "button", disabled: true, text: "Archive" },
    ]),
  ],
  [
    "chart",
    ["recharts", "cssesc", "es-toolkit"],
    fixture_chartServerRenderSource,
    JSON.stringify({
      hasBrowserCSS: false,
      charts: [{ id: "chart-visitors: daily[α]", label: "Monthly visitors" }],
      styleCount: 2,
    }),
  ],
  [
    "calendar",
    ["@daypicker/react"],
    `
    import { renderToString } from "react-dom/server";
    import { jsx } from "react/jsx-runtime";
    import { Calendar } from "@alexgorbatchev/shadcn/calendar";
    const markup = renderToString(jsx(Calendar, { mode: "single", defaultMonth: new Date(2026, 0, 1) }));
    console.log(JSON.stringify(markup.includes('data-slot="calendar"') && markup.includes("January 2026")));
  `,
    "true",
  ],
  [
    "persian-calendar",
    ["@daypicker/persian", "@daypicker/react"],
    `
    import { renderToString } from "react-dom/server";
    import { jsx } from "react/jsx-runtime";
    import { PersianCalendar } from "@alexgorbatchev/shadcn/persian-calendar";
    const markup = renderToString(jsx(PersianCalendar, { mode: "single", defaultMonth: new Date(2026, 0, 1) }));
    console.log(JSON.stringify(markup.includes('data-slot="calendar"') && markup.includes("۱۴۰۴")));
  `,
    "true",
  ],
  [
    "carousel",
    ["embla-carousel-react"],
    `
    import { renderToString } from "react-dom/server";
    import { jsx, jsxs } from "react/jsx-runtime";
    import { DirectionProvider } from "@alexgorbatchev/shadcn";
    import { Carousel, CarouselContent, CarouselItem, useCarousel } from "@alexgorbatchev/shadcn/carousel";
    function Direction() { return jsx("span", { children: useCarousel().direction }); }
    const markup = renderToString(jsx(DirectionProvider, { direction: "rtl", children: jsx(Carousel, {
      children: jsx(CarouselContent, { children: jsx(CarouselItem, { children: jsx(Direction, {}) }) }),
    }) }));
    console.log(JSON.stringify(markup.includes('dir="rtl"') && markup.includes(">rtl</span>")));
  `,
    "true",
  ],
  [
    "command",
    ["cmdk"],
    `
    import { renderToString } from "react-dom/server";
    import { jsx, jsxs } from "react/jsx-runtime";
    import { Command, CommandInput, CommandList, CommandGroup, CommandItem } from "@alexgorbatchev/shadcn/command";
    const markup = renderToString(jsxs(Command, { label: "Actions", children: [
      jsx(CommandInput, {}), jsx(CommandList, { children: jsx(CommandGroup, { children: jsx(CommandItem, { children: "Save" }) }) }),
    ] }));
    console.log(JSON.stringify(markup.includes('role="combobox"') && markup.includes("Save")));
  `,
    "true",
  ],
  [
    "resizable",
    ["react-resizable-panels"],
    `
    import { renderToString } from "react-dom/server";
    import { jsx, jsxs } from "react/jsx-runtime";
    import { Resizable, ResizablePanel, ResizableHandle, SplitView } from "@alexgorbatchev/shadcn/resizable";
    const markup = renderToString(jsxs(Resizable, { children: [jsx(ResizablePanel, { children: "Left" }),
      jsx(ResizableHandle, {}), jsx(ResizablePanel, { children: "Right" })] }));
    console.log(JSON.stringify(markup.includes("Left") && markup.includes("Right") && typeof SplitView === "function"));
  `,
    "true",
  ],
  [
    "sonner",
    [],
    `
    import { renderToString } from "react-dom/server";
    import { jsx } from "react/jsx-runtime";
    import { ThemeProvider, DensityProvider } from "@alexgorbatchev/shadcn";
    import { Sonner, toast, useSonner } from "@alexgorbatchev/shadcn/sonner";
    const markup = renderToString(jsx(ThemeProvider, { forcedTheme: "dark", children: jsx(DensityProvider, {
      density: "compact", children: jsx(Sonner, {}),
    }) }));
    const densities = [];
    await new HTMLRewriter().on('[data-slot="sonner"]', { element(element) {
      densities.push(element.getAttribute("data-density"));
    } }).transform(new Response(markup)).text();
    console.log(JSON.stringify(densities));
  `,
    '["compact"]',
  ],
  [
    "input-otp",
    [],
    fixture_otpServerRenderSource,
    JSON.stringify([
      { label: "Saved code", value: "123456", name: "code", maxLength: "6" },
      { label: "Empty code", value: "", name: "code", maxLength: "6" },
      { label: "Controlled code", value: "654321", name: "code", maxLength: "6" },
    ]),
  ],
  [
    "message-scroller",
    [],
    fixture_scrollerServerRenderSource,
    JSON.stringify({
      hasWindow: false,
      transcripts: ["start", "end", "last-anchor"].map((position) => ({
        position,
        rootPending: position !== "start",
        viewport: { label: "Messages", tabIndex: "0", pending: position !== "start" },
        content: { relevant: "additions", busy: "true" },
        items: [
          { id: "question", anchor: "true" },
          { id: "answer", anchor: "false" },
        ],
        controls: [{ type: "button", inert: true, tabIndex: "-1", active: "false" }],
      })),
    }),
  ],
  [
    "questionnaire",
    [],
    fixture_questionnaireServerRenderSource,
    JSON.stringify({
      hasWindow: false,
      items: [
        { active: false, hidden: true, inert: true, disabled: false },
        { active: false, hidden: true, inert: true, disabled: true },
        { active: true, hidden: false, inert: false, disabled: false },
      ],
      choices: [
        { value: "build", disabled: false, shortcut: "1" },
        { value: "private", disabled: true, shortcut: "1" },
        { value: "unavailable", disabled: true, shortcut: null },
        { value: "tests", disabled: false, shortcut: "1" },
      ],
      actions: [
        { type: "button", hidden: false, inert: false, text: "Previous" },
        { type: "button", hidden: true, inert: true, text: "Next" },
        { type: "submit", hidden: false, inert: false, text: "Submit" },
      ],
      progress: { current: "2", total: "2", text: "Question 2 of 2" },
    }),
  ],
  [
    "fonts",
    ["@fontsource-variable/jetbrains-mono"],
    `
    import "@alexgorbatchev/shadcn/fonts.css";
    console.log("fonts");
  `,
    "fonts",
  ],
];
