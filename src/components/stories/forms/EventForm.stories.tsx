import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, within, waitFor } from "storybook/test";
import { EventForm } from "../../event-calendar";
const initialValue = {
  title: "Design review",
  start: new Date(2026, 9, 22, 10),
  end: new Date(2026, 9, 22, 11),
  allDay: false,
};
const meta: Meta<typeof EventForm> = {
  title: "@alexgorbatchev/shadcn/components/forms/EventForm",
  component: EventForm,
  tags: ["autodocs", "test"],
  args: { label: "Edit event", initialValue, onSave: fn(), onCancel: fn() },
};
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  play: async ({ canvasElement, userEvent, args }) => {
    const c = within(canvasElement);
    await userEvent.clear(c.getByRole("textbox", { name: "Title" }));
    await userEvent.type(c.getByRole("textbox", { name: "Title" }), "Planning");
    await userEvent.click(c.getByRole("checkbox", { name: "All day" }));
    await userEvent.click(c.getByRole("button", { name: "Save event" }));
    await expect(args.onSave).toHaveBeenCalledWith({ ...initialValue, title: "Planning", allDay: true });
    await userEvent.click(c.getByRole("button", { name: "Cancel" }));
    await expect(args.onCancel).toHaveBeenCalled();
  },
};
export const InvalidRange: Story = {
  args: { initialValue: { ...initialValue, end: new Date(2026, 9, 22, 9) } },
  play: async ({ canvasElement, userEvent, args }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole("button", { name: "Save event" }));
    await expect(args.onSave).not.toHaveBeenCalled();
    await expect(c.getByLabelText("End")).toBeInvalid();
  },
};
export const ServerError: Story = {
  args: { onSave: fn(() => Promise.reject(new Error("Could not save."))) },
  play: async ({ canvasElement, userEvent }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole("button", { name: "Save event" }));
    await waitFor(() => expect(c.getByRole("alert")).toHaveTextContent("Could not save."));
    await expect(c.getByRole("button", { name: "Save event" })).toBeEnabled();
  },
};
export const UnknownError: Story = {
  args: { onSave: fn(() => Promise.reject("offline")), onCancel: undefined },
  play: async ({ canvasElement, userEvent }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole("button", { name: "Save event" }));
    await waitFor(() => expect(c.getByRole("alert")).toHaveTextContent("Unable to save the event."));
  },
};
export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole("textbox", { name: "Title" })).toBeDisabled();
  },
};
