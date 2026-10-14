import type { Meta, StoryObj } from "@storybook/react-vite";
import type { CSSProperties } from "react";
import { useId, useState } from "react";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, CardAction } from "../Card";
import { Button } from "../Button";
import { Badge } from "../Badge";
import { Input } from "../Input";
import { Field, FieldGroup, FieldLabel } from "../Field";
import { fixture_avatarImage } from "./fixtures";

const headerRef = fn();
const titleRef = fn();
const descriptionRef = fn();
const actionRef = fn();
const contentRef = fn();
const footerRef = fn();

const meta: Meta<typeof Card> = {
  title: "shadcn-alexgorbatchev/components/Card",
  component: Card,
  tags: ["autodocs", "test"],
  args: { ref: fn(), onClick: fn() },
  argTypes: { size: { control: "select", options: ["default", "sm"] } },
  render: (args) => {
    const titleId = useId();
    const [isOpen, setIsOpen] = useState(false);
    return (
      <Card role="region" aria-labelledby={titleId} {...args}>
        <CardHeader ref={headerRef} aria-label="Project header">
          <CardTitle ref={titleRef} id={titleId}>
            <h2>Project settings</h2>
          </CardTitle>
          <CardDescription ref={descriptionRef}>Configure your workspace.</CardDescription>
          <CardAction ref={actionRef} aria-label="Project state">
            <Badge variant="success">Ready</Badge>
          </CardAction>
        </CardHeader>
        <CardContent ref={contentRef} aria-label="Project content">
          {isOpen ? "Project opened" : "Local tools, one consistent interface."}
        </CardContent>
        <CardFooter ref={footerRef} aria-label="Project actions">
          <Button onClick={() => setIsOpen(true)} disabled={isOpen}>
            Open project
          </Button>
        </CardFooter>
      </Card>
    );
  },
};
export default meta;
type Story = StoryObj<typeof meta>;
type CardSpacingStyle = CSSProperties & { "--card-spacing": string };

export const Default: Story = {
  tags: ["visual"],
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const card = canvas.getByRole("region", { name: "Project settings" });
    const header = canvas.getByLabelText("Project header");
    const title = canvas.getByRole("heading", { name: "Project settings", level: 2 });
    const description = canvas.getByText("Configure your workspace.");
    const action = canvas.getByLabelText("Project state");
    const content = canvas.getByLabelText("Project content");
    const footer = canvas.getByLabelText("Project actions");
    const button = canvas.getByRole("button", { name: "Open project" });
    await expect(args.ref).toHaveBeenCalledWith(card);
    await expect(headerRef).toHaveBeenCalledWith(header);
    await expect(titleRef).toHaveBeenCalledWith(title.parentElement);
    await expect(descriptionRef).toHaveBeenCalledWith(description);
    await expect(actionRef).toHaveBeenCalledWith(action);
    await expect(contentRef).toHaveBeenCalledWith(content);
    await expect(footerRef).toHaveBeenCalledWith(footer);
    await expect(title.getBoundingClientRect().left).toBe(button.getBoundingClientRect().left);
    await expect(title.getBoundingClientRect().left - card.getBoundingClientRect().left).toBeGreaterThan(0);
    await expect(description.getBoundingClientRect().top).toBeGreaterThanOrEqual(title.getBoundingClientRect().bottom);
    await expect(action.getBoundingClientRect().left).toBeGreaterThanOrEqual(title.getBoundingClientRect().right);
    await expect(footer.getBoundingClientRect().top).toBeGreaterThan(content.getBoundingClientRect().bottom);
    await expect(footer.getBoundingClientRect().bottom).toBeLessThan(card.getBoundingClientRect().bottom);
    await userEvent.tab();
    await expect(button).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await expect(content).toHaveTextContent("Project opened");
    await expect(button).toBeDisabled();
    await expect(args.onClick).toHaveBeenCalledTimes(1);
  },
};
export const Small: Story = { tags: ["visual"], ...Default, args: { size: "sm" } };
export const Compact: Story = { ...Default, args: { density: "compact" } };
export const CompactSmall: Story = { ...Default, args: { density: "compact", size: "sm" } };

export const SizeComparison: Story = {
  render: () => (
    <div className="flex items-start gap-4">
      <Card aria-label="Default spacing" role="region" density="comfortable">
        <CardHeader>
          <CardTitle>Default spacing</CardTitle>
          <CardDescription>Comfortable default</CardDescription>
        </CardHeader>
        <CardContent>Project ready</CardContent>
        <CardFooter>Default footer</CardFooter>
      </Card>
      <Card aria-label="Small spacing" role="region" size="sm" density="comfortable">
        <CardHeader>
          <CardTitle>Small spacing</CardTitle>
          <CardDescription>Comfortable small</CardDescription>
        </CardHeader>
        <CardContent>Project ready</CardContent>
        <CardFooter>Small footer</CardFooter>
      </Card>
      <Card aria-label="Compact spacing" role="region" density="compact">
        <CardHeader>
          <CardTitle>Compact spacing</CardTitle>
          <CardDescription>Compact default</CardDescription>
        </CardHeader>
        <CardContent>Project ready</CardContent>
        <CardFooter>Compact footer</CardFooter>
      </Card>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const standard = canvas.getByRole("region", { name: "Default spacing" });
    const small = canvas.getByRole("region", { name: "Small spacing" });
    const compact = canvas.getByRole("region", { name: "Compact spacing" });
    const standardInset =
      within(standard).getByText("Default spacing").getBoundingClientRect().left -
      standard.getBoundingClientRect().left;
    const smallInset =
      within(small).getByText("Small spacing").getBoundingClientRect().left - small.getBoundingClientRect().left;
    const compactInset =
      within(compact).getByText("Compact spacing").getBoundingClientRect().left - compact.getBoundingClientRect().left;
    await expect(standardInset).toBeGreaterThan(smallInset);
    await expect(smallInset).toBeGreaterThan(compactInset);
    await expect(compactInset).toBeGreaterThan(0);
  },
};

export const WithImage: Story = {
  render: (args) => (
    <Card role="region" aria-label="Profile" {...args}>
      <img src={fixture_avatarImage} alt="Alex portrait" className="h-36 w-full object-cover" />
      <CardHeader>
        <CardTitle>Alex</CardTitle>
        <CardDescription>Project maintainer</CardDescription>
      </CardHeader>
      <CardContent>Maintaining accessible components.</CardContent>
      <CardFooter>Available for collaboration</CardFooter>
    </Card>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const card = canvas.getByRole("region", { name: "Profile" });
    const image = canvas.getByRole("img", { name: "Alex portrait" });
    await waitFor(() => expect((image as HTMLImageElement).naturalWidth).toBeGreaterThan(0));
    await expect(image).toBeVisible();
    await expect(image.getBoundingClientRect().top - card.getBoundingClientRect().top).toBe(
      Number.parseFloat(getComputedStyle(card).borderTopWidth),
    );
    await expect(image.getBoundingClientRect().width).toBe(
      card.getBoundingClientRect().width -
        Number.parseFloat(getComputedStyle(card).borderLeftWidth) -
        Number.parseFloat(getComputedStyle(card).borderRightWidth),
    );
    await expect(canvas.getByText("Alex").getBoundingClientRect().top).toBeGreaterThan(
      image.getBoundingClientRect().bottom,
    );
  },
};

export const WithoutAction: Story = {
  render: (args) => (
    <Card {...args} role="region" aria-label="Read-only project">
      <CardHeader>
        <CardTitle>Read-only project</CardTitle>
        <CardDescription>No pending actions.</CardDescription>
      </CardHeader>
      <CardContent>Project ready</CardContent>
      <CardFooter>Last updated today</CardFooter>
    </Card>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("region", { name: "Read-only project" })).toBeVisible();
    await expect(canvas.queryByRole("button")).not.toBeInTheDocument();
    await expect(canvas.getByText("No pending actions.").getBoundingClientRect().width).toBe(
      canvas.getByText("Read-only project").getBoundingClientRect().width,
    );
  },
};

export const WithoutFooter: Story = {
  render: (args) => (
    <Card {...args} role="region" aria-label="Project note">
      <CardHeader>
        <CardTitle>Project note</CardTitle>
        <CardDescription>No actions required.</CardDescription>
      </CardHeader>
      <CardContent>All changes saved.</CardContent>
    </Card>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const card = canvas.getByRole("region", { name: "Project note" });
    const content = canvas.getByText("All changes saved.");
    await expect(Number.parseFloat(getComputedStyle(card).paddingBottom)).toBeGreaterThan(0);
    await expect(card.getBoundingClientRect().bottom).toBeGreaterThan(content.getBoundingClientRect().bottom);
    await expect(canvas.queryByRole("button")).not.toBeInTheDocument();
  },
};

export const CustomSpacing: Story = {
  render: (args) => {
    const [spacing, setSpacing] = useState(16);
    const style: CardSpacingStyle = { "--card-spacing": `${spacing}px` };
    return (
      <Card {...args} style={style} role="region" aria-label="Adjustable spacing">
        <CardHeader>
          <CardTitle>Adjustable spacing</CardTitle>
          <CardDescription>Change the inset of every section.</CardDescription>
        </CardHeader>
        <CardContent>Project ready</CardContent>
        <CardFooter>
          <Button onClick={() => setSpacing(32)}>Increase spacing</Button>
        </CardFooter>
      </Card>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const card = canvas.getByRole("region", { name: "Adjustable spacing" });
    const title = canvas.getByText("Adjustable spacing");
    const description = canvas.getByText("Change the inset of every section.");
    const content = canvas.getByText("Project ready");
    const button = canvas.getByRole("button", { name: "Increase spacing" });
    const inset = title.getBoundingClientRect().left - card.getBoundingClientRect().left;
    const gap = content.getBoundingClientRect().top - description.getBoundingClientRect().bottom;
    await userEvent.click(button);
    await waitFor(() => {
      expect(title.getBoundingClientRect().left - card.getBoundingClientRect().left).toBeGreaterThan(inset);
      expect(content.getBoundingClientRect().top - description.getBoundingClientRect().bottom).toBeGreaterThan(gap);
      expect(title.getBoundingClientRect().left).toBe(button.getBoundingClientRect().left);
    });
  },
};

export const RightToLeft: Story = {
  decorators: [
    (Story) => (
      <div dir="rtl">
        <Story />
      </div>
    ),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const title = canvas.getByRole("heading", { name: "Project settings" }).getBoundingClientRect();
    const action = canvas.getByLabelText("Project state").getBoundingClientRect();
    const button = canvas.getByRole("button", { name: "Open project" });
    await expect(action.right).toBeLessThanOrEqual(title.left);
    await expect(button.getBoundingClientRect().right).toBe(title.right);
    await userEvent.click(button);
    await expect(canvas.getByLabelText("Project content")).toHaveTextContent("Project opened");
  },
};

export const LoginForm: Story = {
  render: function Render(args) {
    const id = useId();
    const [email, setEmail] = useState("");
    return (
      <Card {...args} role="region" aria-label="Account sign in" className="w-80">
        <CardHeader>
          <CardTitle>
            <h2>Sign in</h2>
          </CardTitle>
          <CardDescription>Enter your account details.</CardDescription>
          <CardAction>
            <Badge variant="secondary">Account</Badge>
          </CardAction>
        </CardHeader>
        <CardContent>
          <form
            id={`${id}-login`}
            aria-label="Sign in details"
            onSubmit={(event) => {
              event.preventDefault();
              setEmail(String(new FormData(event.currentTarget).get("email")));
            }}
          >
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor={`${id}-email`}>Email</FieldLabel>
                <Input id={`${id}-email`} name="email" type="email" autoComplete="email" required />
              </Field>
              <Field>
                <FieldLabel htmlFor={`${id}-password`}>Password</FieldLabel>
                <Input id={`${id}-password`} name="password" type="password" autoComplete="current-password" required />
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
        <CardFooter className="flex-col gap-2">
          <Button type="submit" form={`${id}-login`} className="w-full">
            Submit account details
          </Button>
          <output aria-label="Submitted email">{email}</output>
        </CardFooter>
      </Card>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const email = canvas.getByRole("textbox", { name: "Email" }) as HTMLInputElement;
    const password = canvas.getByLabelText("Password") as HTMLInputElement;
    const submit = canvas.getByRole("button", { name: "Submit account details" }) as HTMLButtonElement;
    await expect(submit.form).toBe(canvas.getByRole("form", { name: "Sign in details" }));
    await userEvent.click(submit);
    await expect(email.checkValidity()).toBe(false);
    await expect(canvas.getByRole("status", { name: "Submitted email" })).toHaveTextContent("");
    await userEvent.type(email, "alex@example.com");
    await userEvent.tab();
    await expect(password).toHaveFocus();
    await userEvent.type(password, "story-password");
    await userEvent.tab();
    await expect(submit).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await expect(canvas.getByRole("status", { name: "Submitted email" })).toHaveTextContent("alex@example.com");
  },
};
export const RightToLeftLoginForm: Story = {
  ...LoginForm,
  decorators: [
    (Story) => (
      <div dir="rtl">
        <Story />
      </div>
    ),
  ],
};
export const EdgeToEdge: Story = {
  render: function Render(args) {
    const [spacing, setSpacing] = useState(16);
    const [choice, setChoice] = useState("");
    const style: CardSpacingStyle = { "--card-spacing": `${spacing}px` };
    return (
      <Card {...args} style={style} role="region" aria-label="Workspace terms" className="w-80">
        <CardHeader>
          <CardTitle>Workspace terms</CardTitle>
          <CardDescription>Review the agreement.</CardDescription>
        </CardHeader>
        <CardContent className="-mb-(--card-spacing)">
          <section
            aria-label="Agreement text"
            tabIndex={0}
            className="-mx-(--card-spacing) flex max-h-32 flex-col gap-4 overflow-y-auto border-t bg-muted/50 px-(--card-spacing) py-4"
          >
            {Array.from({ length: 8 }, (_, index) => (
              <p key={index}>Term {index + 1}: Keep project details available to your team.</p>
            ))}
          </section>
        </CardContent>
        <CardFooter className="flex-col items-start gap-2">
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => setChoice("Declined")}>
              Decline
            </Button>
            <Button onClick={() => setChoice("Accepted")}>Accept</Button>
            <Button variant="ghost" onClick={() => setSpacing(32)}>
              Increase inset
            </Button>
          </div>
          <output aria-label="Agreement choice">{choice}</output>
        </CardFooter>
      </Card>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const card = canvas.getByRole("region", { name: "Workspace terms" });
    const agreement = canvas.getByRole("region", { name: "Agreement text" });
    const footer = canvas.getByRole("button", { name: "Accept" }).closest('[data-slot="card-footer"]') as HTMLElement;
    const title = canvas.getByText("Workspace terms");
    const initialInset = title.getBoundingClientRect().left - card.getBoundingClientRect().left;
    await expect(agreement.getBoundingClientRect().left).toBe(card.getBoundingClientRect().left + 1);
    await expect(agreement.getBoundingClientRect().right).toBe(card.getBoundingClientRect().right - 1);
    await expect(agreement.getBoundingClientRect().bottom).toBe(footer.getBoundingClientRect().top);
    await userEvent.tab();
    await expect(agreement).toHaveFocus();
    agreement.scrollTo({ top: agreement.scrollHeight });
    await waitFor(() => expect(agreement.scrollTop).toBeGreaterThan(0));
    await userEvent.tab();
    await userEvent.keyboard("{Enter}");
    await expect(canvas.getByRole("status", { name: "Agreement choice" })).toHaveTextContent("Declined");
    await userEvent.tab();
    await userEvent.keyboard("{Enter}");
    await expect(canvas.getByRole("status", { name: "Agreement choice" })).toHaveTextContent("Accepted");
    await userEvent.click(canvas.getByRole("button", { name: "Increase inset" }));
    await waitFor(() =>
      expect(title.getBoundingClientRect().left - card.getBoundingClientRect().left).toBeGreaterThan(initialInset),
    );
    await expect(agreement.getBoundingClientRect().left).toBe(card.getBoundingClientRect().left + 1);
    await expect(agreement.getBoundingClientRect().right).toBe(card.getBoundingClientRect().right - 1);
    await expect(agreement.getBoundingClientRect().bottom).toBe(footer.getBoundingClientRect().top);
    for (const button of within(footer).getAllByRole("button")) {
      await expect(button.getBoundingClientRect().left).toBeGreaterThanOrEqual(card.getBoundingClientRect().left);
      await expect(button.getBoundingClientRect().right).toBeLessThanOrEqual(card.getBoundingClientRect().right);
    }
  },
};
export const RightToLeftEdgeToEdge: Story = {
  ...EdgeToEdge,
  decorators: [
    (Story) => (
      <div dir="rtl">
        <Story />
      </div>
    ),
  ],
};
