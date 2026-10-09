export const fixture_packageRenderSource: string = `
import { renderToStaticMarkup } from "react-dom/server";
import { jsx } from "react/jsx-runtime";
import { Button } from "shadcn-alexgorbatchev";

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
import { InputOTP, InputOTPGroup, InputOTPSlot } from "shadcn-alexgorbatchev";

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
import { ChartContainer, ChartStyle } from "shadcn-alexgorbatchev";

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
  QuestionnaireActions, QuestionnairePrevious, QuestionnaireNext, QuestionnaireSubmit } from "shadcn-alexgorbatchev";
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
  MessageScrollerItem, MessageScrollerButton } from "shadcn-alexgorbatchev";
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
