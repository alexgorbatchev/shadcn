import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, userEvent, within } from "storybook/test";
import { Button } from "../Button";
import { Skeleton } from "../Skeleton";
import { Card, CardContent, CardHeader } from "../Card";

const meta: Meta<typeof Skeleton> = {
  title: "shadcn-alexgorbatchev/components/Skeleton",
  component: Skeleton,
  tags: ["autodocs", "test"],
  render: (args) => (
    <div role="status" aria-label="Loading content" className="flex flex-col gap-3">
      <Skeleton {...args} className="h-5 w-48" />
      <Skeleton className="h-4 w-64" />
      <Skeleton className="h-4 w-40" />
    </div>
  ),
};
export default meta;
type Story = StoryObj<typeof meta>;

export const Text: Story = {
  play: async ({ canvasElement }) => {
    const status = within(canvasElement).getByRole("status", { name: "Loading content" });
    await expect(status).toBeVisible();
    for (const placeholder of status.children) {
      await expect(placeholder.getBoundingClientRect().width).toBeGreaterThan(0);
      await expect(placeholder.getBoundingClientRect().height).toBeGreaterThan(0);
      await expect(getComputedStyle(placeholder).animationName === "none").toBe(
        window.matchMedia("(prefers-reduced-motion: reduce)").matches,
      );
    }
  },
};
export const CardPlaceholder: Story = {
  render: () => (
    <div role="status" aria-label="Loading card" className="flex flex-col gap-4">
      <Skeleton data-testid="Skeleton" className="h-36 w-full" />
      <Skeleton className="h-5 w-48" />
      <Skeleton className="h-4 w-full" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const status = within(canvasElement).getByRole("status", { name: "Loading card" });
    await expect(status).toBeVisible();
    const image = within(status).getByTestId("Skeleton");
    await expect(image.getBoundingClientRect().height).toBeGreaterThan(100);
    await expect(image.getBoundingClientRect().width).toBe(status.getBoundingClientRect().width);
    await expect(getComputedStyle(image).animationName === "none").toBe(
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    );
  },
};

export const LoadingTransition: Story = {
  render: (args) => {
    const [isLoading, setIsLoading] = useState(true);
    return (
      <div className="flex flex-col gap-4">
        <section aria-label="Project summary" aria-busy={isLoading}>
          {isLoading ? (
            <div role="status" aria-label="Loading project">
              <Skeleton {...args} className="h-5 w-48" aria-hidden="true" />
            </div>
          ) : (
            <p>Project ready</p>
          )}
        </section>
        <Button onClick={() => setIsLoading(false)} disabled={!isLoading}>
          Finish loading
        </Button>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const region = canvas.getByRole("region", { name: "Project summary" });
    await expect(region).toHaveAttribute("aria-busy", "true");
    await expect(canvas.getByRole("status", { name: "Loading project" })).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Finish loading" }));
    await expect(canvas.getByText("Project ready")).toBeVisible();
    await expect(region).toHaveAttribute("aria-busy", "false");
    await expect(canvas.queryByRole("status")).not.toBeInTheDocument();
    await expect(canvas.getByRole("button", { name: "Finish loading" })).toBeDisabled();
  },
};

async function expectPlaceholders(status: HTMLElement): Promise<void> {
  await expect(status).toBeVisible();
  for (const placeholder of status.querySelectorAll('[data-slot="skeleton"]')) {
    await expect(placeholder.getBoundingClientRect().width).toBeGreaterThan(0);
    await expect(placeholder.getBoundingClientRect().height).toBeGreaterThan(0);
    await expect(getComputedStyle(placeholder).animationName === "none").toBe(
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    );
    await expect(placeholder).toHaveAttribute("aria-hidden", "true");
  }
}
export const AvatarPlaceholder: Story = {
  render: (args) => (
    <div role="status" aria-label="Loading profile" className="flex w-fit items-center gap-4">
      <Skeleton {...args} data-testid="Skeleton" aria-hidden="true" className="size-10 shrink-0 rounded-full" />
      <div className="grid gap-2" aria-hidden="true">
        <Skeleton aria-hidden="true" className="h-4 w-40" />
        <Skeleton aria-hidden="true" className="h-4 w-24" />
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const status = within(canvasElement).getByRole("status", { name: "Loading profile" });
    const avatar = within(status).getByTestId("Skeleton");
    await expectPlaceholders(status);
    await expect(avatar.getBoundingClientRect().width).toBe(avatar.getBoundingClientRect().height);
    await expect(Number.parseFloat(getComputedStyle(avatar).borderRadius)).toBeGreaterThanOrEqual(
      avatar.getBoundingClientRect().width / 2,
    );
    const text = status.lastElementChild as HTMLElement;
    await expect(text.firstElementChild?.getBoundingClientRect().height).toBeLessThan(
      avatar.getBoundingClientRect().height,
    );
  },
};
export const RightToLeft: Story = {
  ...AvatarPlaceholder,
  decorators: [
    (Story) => (
      <div dir="rtl">
        <Story />
      </div>
    ),
  ],
  play: async (context) => {
    const status = within(context.canvasElement).getByRole("status", { name: "Loading profile" });
    const avatar = within(status).getByTestId("Skeleton");
    const text = status.lastElementChild as HTMLElement;
    await expect(avatar.getBoundingClientRect().left).toBeGreaterThan(text.getBoundingClientRect().right);
    await AvatarPlaceholder.play?.(context);
  },
};
export const InCard: Story = {
  render: () => (
    <Card role="status" aria-label="Loading card sections" className="w-80">
      <CardHeader>
        <Skeleton aria-hidden="true" className="h-4 w-2/3" />
        <Skeleton aria-hidden="true" className="h-4 w-1/2" />
      </CardHeader>
      <CardContent>
        <Skeleton aria-hidden="true" data-testid="Skeleton" className="aspect-video w-full" />
      </CardContent>
    </Card>
  ),
  play: async ({ canvasElement }) => {
    const card = within(canvasElement).getByRole("status", { name: "Loading card sections" });
    const media = within(card).getByTestId("Skeleton");
    await expectPlaceholders(card);
    await expect(media.getBoundingClientRect().width / media.getBoundingClientRect().height).toBeCloseTo(16 / 9, 1);
    await expect(media.getBoundingClientRect().left).toBeGreaterThan(card.getBoundingClientRect().left);
    await expect(media.getBoundingClientRect().right).toBeLessThan(card.getBoundingClientRect().right);
  },
};
export const FormPlaceholder: Story = {
  render: () => (
    <div role="status" aria-label="Loading form" className="flex w-80 flex-col gap-7">
      <div className="flex flex-col gap-3">
        <Skeleton aria-hidden="true" className="h-4 w-20" />
        <Skeleton aria-hidden="true" className="h-8 w-full" />
      </div>
      <div className="flex flex-col gap-3">
        <Skeleton aria-hidden="true" className="h-4 w-24" />
        <Skeleton aria-hidden="true" className="h-8 w-full" />
      </div>
      <Skeleton aria-hidden="true" className="h-8 w-24" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const status = canvas.getByRole("status", { name: "Loading form" });
    await expectPlaceholders(status);
    for (const field of [...status.children].slice(0, 2)) {
      const label = field.firstElementChild as HTMLElement;
      const control = field.lastElementChild as HTMLElement;
      await expect(control.getBoundingClientRect().width).toBe(status.getBoundingClientRect().width);
      await expect(label.getBoundingClientRect().width).toBeLessThan(control.getBoundingClientRect().width);
      await expect(control.getBoundingClientRect().top).toBeGreaterThan(label.getBoundingClientRect().bottom);
    }
    await expect(canvas.queryByRole("textbox")).not.toBeInTheDocument();
    await expect(canvas.queryByRole("button")).not.toBeInTheDocument();
  },
};
export const TablePlaceholder: Story = {
  render: () => (
    <div role="status" aria-label="Loading table" className="flex w-80 flex-col gap-2">
      {Array.from({ length: 5 }, (_, index) => (
        <div key={index} className="flex gap-4">
          <Skeleton aria-hidden="true" className="h-4 flex-1" />
          <Skeleton aria-hidden="true" className="h-4 w-24" />
          <Skeleton aria-hidden="true" className="h-4 w-20" />
        </div>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const status = within(canvasElement).getByRole("status", { name: "Loading table" });
    await expectPlaceholders(status);
    await expect(status.children).toHaveLength(5);
    for (const row of status.children) {
      const cells = [...row.children];
      await expect(cells).toHaveLength(3);
      await expect(cells[0].getBoundingClientRect().left).toBe(status.getBoundingClientRect().left);
      await expect(cells[2].getBoundingClientRect().right).toBe(status.getBoundingClientRect().right);
      await expect(cells[0].getBoundingClientRect().bottom).toBe(cells[2].getBoundingClientRect().bottom);
    }
  },
};
