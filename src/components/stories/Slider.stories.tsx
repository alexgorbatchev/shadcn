import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Slider } from "../Slider";
import { DirectionProvider } from "../DirectionProvider";
import { Button } from "../Button";
import { Field, FieldGroup } from "../Field";
import { expect, fn, waitFor, within } from "storybook/test";

const meta: Meta<typeof Slider> = {
  title: "shadcn-alexgorbatchev/components/Slider",
  component: Slider,
  tags: ["autodocs", "test"],
  args: {
    defaultValue: 50,
    min: 0,
    max: 100,
    step: 1,
    getAriaLabel: () => "Volume",
    onValueChange: fn(),
    onValueCommitted: fn(),
  },
};
export default meta;
type Story = StoryObj<typeof meta>;

async function getSliderCanvas(canvasElement: HTMLElement): Promise<ReturnType<typeof within>> {
  const canvas = within(canvasElement);
  await canvas.findAllByRole("slider");
  return canvas;
}

export const Default: Story = {
  play: async ({ canvasElement, userEvent, args }) => {
    const canvas = await getSliderCanvas(canvasElement);
    const input = canvas.getByRole("slider", { name: "Volume" });
    const root = input.closest("[data-slot=slider]") as HTMLElement;
    const track = root.querySelector("[data-slot=slider-track]") as HTMLElement;
    const indicator = root.querySelector("[data-slot=slider-range]") as HTMLElement;
    await expect(track.getBoundingClientRect().height).toBe(4);
    await expect(track.getBoundingClientRect().width).toBeGreaterThan(100);
    await expect(indicator.getBoundingClientRect().height).toBe(4);
    await expect(indicator.getBoundingClientRect().width).toBeGreaterThan(0);
    await userEvent.tab();
    await expect(input).toHaveFocus();
    await userEvent.keyboard("{ArrowRight}");
    await expect(input).toHaveAttribute("aria-valuenow", "51");
    await expect(args.onValueChange).toHaveBeenLastCalledWith(
      51,
      expect.objectContaining({ reason: "keyboard", activeThumbIndex: 0 }),
    );
    await expect(args.onValueCommitted).toHaveBeenLastCalledWith(51, expect.objectContaining({ reason: "keyboard" }));
  },
};
export const Range: Story = {
  args: { defaultValue: [25, 75], getAriaLabel: (index) => (index === 0 ? "Minimum volume" : "Maximum volume") },
  play: async ({ canvasElement, userEvent, args }) => {
    const canvas = await getSliderCanvas(canvasElement);
    await userEvent.tab();
    await expect(canvas.getByRole("slider", { name: "Minimum volume" })).toHaveFocus();
    await userEvent.keyboard("{ArrowRight}");
    await expect(args.onValueChange).toHaveBeenLastCalledWith(
      [26, 75],
      expect.objectContaining({ activeThumbIndex: 0 }),
    );
    await userEvent.tab();
    await expect(canvas.getByRole("slider", { name: "Maximum volume" })).toHaveFocus();
    await userEvent.keyboard("{ArrowLeft}");
    await expect(args.onValueChange).toHaveBeenLastCalledWith(
      [26, 74],
      expect.objectContaining({ activeThumbIndex: 1 }),
    );
  },
};
export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ canvasElement, userEvent, args }) => {
    const input = (await getSliderCanvas(canvasElement)).getByRole("slider", { name: "Volume" });
    await expect(input).toBeDisabled();
    await userEvent.tab();
    await expect(input).not.toHaveFocus();
    await userEvent.keyboard("{ArrowRight}");
    await expect(input).toHaveAttribute("aria-valuenow", "50");
    await expect(args.onValueChange).not.toHaveBeenCalled();
  },
};
export const Stepped: Story = {
  args: { step: 10, largeStep: 20 },
  play: async ({ canvasElement, userEvent }) => {
    const input = (await getSliderCanvas(canvasElement)).getByRole("slider", { name: "Volume" });
    await userEvent.tab();
    await userEvent.keyboard("{ArrowRight}");
    await expect(input).toHaveAttribute("aria-valuenow", "60");
    await userEvent.keyboard("{PageUp}");
    await expect(input).toHaveAttribute("aria-valuenow", "80");
    await userEvent.keyboard("{End}");
    await expect(input).toHaveAttribute("aria-valuenow", "100");
    await userEvent.keyboard("{Home}");
    await expect(input).toHaveAttribute("aria-valuenow", "0");
  },
};
export const Vertical: Story = {
  args: { orientation: "vertical", className: "h-48" },
  play: async ({ canvasElement, userEvent }) => {
    const input = (await getSliderCanvas(canvasElement)).getByRole("slider", { name: "Volume" });
    const root = input.closest("[data-slot=slider]") as HTMLElement;
    const track = root.querySelector("[data-slot=slider-track]") as HTMLElement;
    await expect(track.getBoundingClientRect().width).toBe(4);
    await expect(track.getBoundingClientRect().height).toBe(192);
    await expect(input).toHaveAttribute("aria-orientation", "vertical");
    await userEvent.tab();
    await userEvent.keyboard("{ArrowUp}");
    await expect(input).toHaveAttribute("aria-valuenow", "51");
    await userEvent.keyboard("{ArrowDown}");
    await expect(input).toHaveAttribute("aria-valuenow", "50");
  },
};
export const NativeCallbacks: Story = {
  args: { className: (state) => (state.disabled ? "h-12" : "h-8") },
  render: function Render(args) {
    const [isDisabled, setIsDisabled] = useState(false);
    return (
      <Field>
        <Slider {...args} disabled={isDisabled} />
        <Button onClick={() => setIsDisabled(true)}>Disable slider</Button>
      </Field>
    );
  },
  play: async ({ canvasElement, userEvent }) => {
    const canvas = await getSliderCanvas(canvasElement);
    const root = canvas.getByRole("slider", { name: "Volume" }).closest("[data-slot=slider]") as HTMLElement;
    await expect(root.getBoundingClientRect().height).toBe(32);
    await userEvent.click(canvas.getByRole("button", { name: "Disable slider" }));
    await waitFor(() => {
      expect(root.getBoundingClientRect().height).toBe(48);
      expect(canvas.getByRole("slider", { name: "Volume" })).toBeDisabled();
    });
  },
};
export const Controlled: Story = {
  render: function Render(args) {
    const [value, setValue] = useState(30);
    return (
      <Field>
        <Slider<number> {...args} defaultValue={undefined} value={value} onValueChange={setValue} />
        <output aria-label="Current volume">{value}</output>
      </Field>
    );
  },
  play: async ({ canvasElement, userEvent }) => {
    const canvas = await getSliderCanvas(canvasElement);
    await userEvent.tab();
    await userEvent.keyboard("{ArrowRight}");
    await expect(canvas.getByRole("slider", { name: "Volume" })).toHaveAttribute("aria-valuenow", "31");
    await expect(canvas.getByRole("status", { name: "Current volume" })).toHaveTextContent("31");
  },
};
export const ControlledRange: Story = {
  render: function Render(args) {
    const [value, setValue] = useState<number[]>([20, 80]);
    return (
      <Field>
        <Slider<number[]>
          {...args}
          defaultValue={undefined}
          value={value}
          onValueChange={setValue}
          getAriaLabel={(index) => (index === 0 ? "Low" : "High")}
        />
        <output aria-label="Current range">{value.join(", ")}</output>
      </Field>
    );
  },
  play: async ({ canvasElement, userEvent }) => {
    const canvas = await getSliderCanvas(canvasElement);
    await userEvent.tab();
    await userEvent.keyboard("{ArrowRight}");
    await expect(canvas.getByRole("status", { name: "Current range" })).toHaveTextContent("21, 80");
    await userEvent.tab();
    await userEvent.keyboard("{ArrowLeft}");
    await expect(canvas.getByRole("status", { name: "Current range" })).toHaveTextContent("21, 79");
  },
};
export const CancelledChange: Story = {
  args: { onValueChange: fn((_value, eventDetails) => eventDetails.cancel()) },
  play: async ({ canvasElement, userEvent, args }) => {
    const input = (await getSliderCanvas(canvasElement)).getByRole("slider", { name: "Volume" });
    await userEvent.tab();
    await userEvent.keyboard("{ArrowRight}");
    await expect(args.onValueChange).toHaveBeenCalled();
    await expect(input).toHaveAttribute("aria-valuenow", "50");
    await expect(args.onValueCommitted).not.toHaveBeenCalled();
  },
};
export const MinimumGap: Story = {
  ...Range,
  args: { ...Range.args, minStepsBetweenValues: 5, thumbCollisionBehavior: "none" },
  play: async ({ canvasElement, userEvent }) => {
    const canvas = await getSliderCanvas(canvasElement);
    await userEvent.tab();
    await userEvent.keyboard("{End}");
    await expect(canvas.getByRole("slider", { name: "Minimum volume" })).toHaveAttribute("aria-valuenow", "70");
    await expect(canvas.getByRole("slider", { name: "Maximum volume" })).toHaveAttribute("aria-valuenow", "75");
  },
};
export const DecimalValues: Story = {
  args: { defaultValue: 0.5, min: 0, max: 1, step: 0.1, getAriaValueText: (_formatted, value) => value + " units" },
  play: async ({ canvasElement, userEvent, args }) => {
    const input = (await getSliderCanvas(canvasElement)).getByRole("slider", { name: "Volume" });
    await userEvent.tab();
    await userEvent.keyboard("{ArrowRight}");
    await expect(input).toHaveAttribute("aria-valuenow", "0.6");
    await expect(input).toHaveAttribute("aria-valuetext", "0.6 units");
    await expect(args.onValueChange).toHaveBeenLastCalledWith(0.6, expect.objectContaining({ reason: "keyboard" }));
  },
};
export const MultipleThumbs: Story = {
  args: { defaultValue: [20, 50, 80], getAriaLabel: (index) => ["Low", "Mid", "High"][index] ?? "Volume" },
  play: async ({ canvasElement, userEvent, args }) => {
    const canvas = await getSliderCanvas(canvasElement);
    await expect(canvas.getAllByRole("slider")).toHaveLength(3);
    await userEvent.tab();
    await userEvent.tab();
    await userEvent.keyboard("{ArrowRight}");
    await expect(canvas.getByRole("slider", { name: "Mid" })).toHaveAttribute("aria-valuenow", "51");
    await expect(args.onValueChange).toHaveBeenLastCalledWith(
      [20, 51, 80],
      expect.objectContaining({ activeThumbIndex: 1 }),
    );
  },
};
export const RTL: Story = {
  render: (args) => (
    <DirectionProvider direction="rtl">
      <div dir="rtl">
        <Slider {...args} />
      </div>
    </DirectionProvider>
  ),
  play: async ({ canvasElement, userEvent }) => {
    const input = (await getSliderCanvas(canvasElement)).getByRole("slider", { name: "Volume" });
    await userEvent.tab();
    await userEvent.keyboard("{ArrowLeft}");
    await expect(input).toHaveAttribute("aria-valuenow", "51");
    await userEvent.keyboard("{ArrowRight}");
    await expect(input).toHaveAttribute("aria-valuenow", "50");
  },
};
export const NativeRenderAndRef: Story = {
  args: { render: <section aria-label="Native slider" />, ref: fn() },
  play: async ({ canvasElement, userEvent, args }) => {
    const canvas = await getSliderCanvas(canvasElement);
    const root = canvas.getByRole("group", { name: "Native slider" });
    await expect(args.ref).toHaveBeenCalledWith(root);
    await userEvent.tab();
    await userEvent.keyboard("{ArrowRight}");
    await expect(canvas.getByRole("slider", { name: "Volume" })).toHaveAttribute("aria-valuenow", "51");
  },
};
export const DefaultMinimum: Story = {
  args: { defaultValue: undefined, min: 10, max: 30 },
  play: async ({ canvasElement, userEvent }) => {
    const input = (await getSliderCanvas(canvasElement)).getByRole("slider", { name: "Volume" });
    await expect(input).toHaveAttribute("aria-valuenow", "10");
    await userEvent.tab();
    await userEvent.keyboard("{ArrowRight}");
    await expect(input).toHaveAttribute("aria-valuenow", "11");
  },
};
export const FormSubmissionAndReset: Story = {
  render: function Render() {
    const [volume, setVolume] = useState(30);
    const [range, setRange] = useState<number[]>([20, 80]);
    const [result, setResult] = useState("");
    return (
      <form
        aria-label="Slider form"
        onReset={() => {
          setVolume(30);
          setRange([20, 80]);
        }}
        onSubmit={(event) => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          setResult(
            JSON.stringify({ volume: data.get("volume"), range: data.getAll("range"), omitted: data.get("omitted") }),
          );
        }}
      >
        <FieldGroup>
          <Slider<number> name="volume" value={volume} onValueChange={setVolume} getAriaLabel={() => "Form volume"} />
          <Slider<number[]>
            name="range"
            value={range}
            onValueChange={setRange}
            getAriaLabel={(index) => (index === 0 ? "Form low" : "Form high")}
          />
          <Slider name="omitted" disabled defaultValue={99} getAriaLabel={() => "Disabled volume"} />
          <Button type="submit">Save sliders</Button>
          <Button type="reset">Reset sliders</Button>
          <output aria-label="Saved sliders">{result}</output>
        </FieldGroup>
      </form>
    );
  },
  play: async ({ canvasElement, userEvent }) => {
    const canvas = await getSliderCanvas(canvasElement);
    await userEvent.tab();
    await userEvent.keyboard("{ArrowRight}");
    await userEvent.tab();
    await userEvent.keyboard("{ArrowRight}");
    await userEvent.click(canvas.getByRole("button", { name: "Save sliders" }));
    await expect(canvas.getByRole("status", { name: "Saved sliders" })).toHaveTextContent(
      '{"volume":"31","range":["21","80"],"omitted":null}',
    );
    await userEvent.click(canvas.getByRole("button", { name: "Reset sliders" }));
    await expect(canvas.getByRole("slider", { name: "Form volume" })).toHaveAttribute("aria-valuenow", "30");
    await expect(canvas.getByRole("slider", { name: "Form low" })).toHaveAttribute("aria-valuenow", "20");
  },
};

export const FormattedValues: Story = {
  args: { defaultValue: 0.5, min: 0, max: 1, step: 0.1, locale: "en-US", format: { style: "percent" } },
  play: async ({ canvasElement, userEvent }) => {
    const input = (await getSliderCanvas(canvasElement)).getByRole("slider", { name: "Volume" });
    await expect(input).toHaveAttribute("aria-valuetext", "50%");
    await userEvent.tab();
    await userEvent.keyboard("{ArrowRight}");
    await expect(input).toHaveAttribute("aria-valuetext", "60%");
  },
};
export const ReadonlyArrayValue: Story = {
  render: function Render() {
    const [value, setValue] = useState<readonly number[]>([20, 80]);
    return (
      <Field>
        <Slider<readonly number[]>
          value={value}
          onValueChange={setValue}
          getAriaLabel={(index) => (index === 0 ? "Readonly low" : "Readonly high")}
        />
        <output aria-label="Readonly range">{value.join(", ")}</output>
      </Field>
    );
  },
  play: async ({ canvasElement, userEvent }) => {
    const canvas = await getSliderCanvas(canvasElement);
    await userEvent.tab();
    await userEvent.keyboard("{ArrowRight}");
    await expect(canvas.getByRole("status", { name: "Readonly range" })).toHaveTextContent("21, 80");
  },
};
