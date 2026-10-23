import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, within } from "storybook/test";
import { Stepper, StepperList, StepperTrigger, StepperIndicator, StepperContent } from "../../Stepper";
const meta: Meta<typeof Stepper> = {
  title: "@alexgorbatchev/shadcn/components/forms/Stepper",
  component: Stepper,
  tags: ["autodocs", "test"],
  args: { defaultValue: "profile", onValueChange: fn() },
  render: (args) => (
    <Stepper {...args}>
      <StepperList aria-label="Onboarding steps">
        <StepperTrigger value="profile">
          <StepperIndicator completed>1</StepperIndicator>Profile
        </StepperTrigger>
        <StepperTrigger value="workspace">
          <StepperIndicator>2</StepperIndicator>Workspace
        </StepperTrigger>
        <StepperTrigger value="review" disabled>
          <StepperIndicator>3</StepperIndicator>Review
        </StepperTrigger>
      </StepperList>
      <StepperContent value="profile">Set up your profile.</StepperContent>
      <StepperContent value="workspace">Configure your workspace.</StepperContent>
    </Stepper>
  ),
};
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  play: async ({ canvasElement, userEvent, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("tab", { name: "Profile" }));
    await userEvent.keyboard("{ArrowRight}");
    await expect(canvas.getByRole("tab", { name: "Workspace" })).toHaveFocus();
    await expect(canvas.getByRole("tabpanel")).toHaveTextContent("Set up your profile.");
    await userEvent.keyboard("{Enter}");
    await expect(canvas.getByRole("tabpanel", { name: "Workspace" })).toHaveTextContent("Configure your workspace.");
    await expect(args.onValueChange).toHaveBeenLastCalledWith("workspace", expect.anything());
    await expect(canvas.getByRole("tab", { name: "Review" })).toHaveAttribute("aria-disabled", "true");
    await expect(canvas.getByRole("tab", { name: "Review" })).toHaveStyle({ opacity: "0.5" });
  },
};
export const Vertical: Story = {
  args: { orientation: "vertical" },
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("tab", { name: "Profile" }));
    await userEvent.keyboard("{ArrowDown}{Enter}");
    await expect(canvas.getByRole("tabpanel", { name: "Workspace" })).toHaveTextContent("Configure your workspace.");
  },
};
export const NativeStateCallbacks: Story = {
  render: (args) => (
    <Stepper {...args} className={() => "gap-3"}>
      <StepperList className={() => "gap-2"} aria-label="Steps">
        <StepperTrigger className={() => "font-medium"} value="profile">
          <StepperIndicator className="font-medium">1</StepperIndicator>Profile
        </StepperTrigger>
        <StepperTrigger className={() => "font-medium"} value="workspace">
          Workspace
        </StepperTrigger>
      </StepperList>
      <StepperContent className={() => "p-2"} value="profile">
        Profile details
      </StepperContent>
      <StepperContent className={() => "p-2"} value="workspace">
        Workspace details
      </StepperContent>
    </Stepper>
  ),
  play: async ({ canvasElement, userEvent }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole("tab", { name: "Workspace" }));
    await expect(c.getByRole("tabpanel", { name: "Workspace" })).toHaveTextContent("Workspace details");
  },
};
