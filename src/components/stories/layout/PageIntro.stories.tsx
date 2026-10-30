import type { Meta, StoryObj } from "@storybook/react-vite";
import { BookmarkIcon, CalendarIcon, HeartIcon, SparklesIcon } from "lucide-react";
import { expect, fn, within } from "storybook/test";
import { PageIntro } from "../../PageIntro";
import { Button } from "../../Button";

const action = fn();
const highlights = [
  { icon: <SparklesIcon />, title: "Start anywhere", description: "A rough idea is enough to begin." },
  { icon: <CalendarIcon />, title: "Pick dates later", description: "Plans can stay open until everyone agrees." },
  { icon: <HeartIcon />, title: "Keep what works", description: "Save the parts you love and change the rest." },
];

const meta: Meta<typeof PageIntro> = {
  title: "@alexgorbatchev/shadcn/components/layout/PageIntro",
  component: PageIntro,
  tags: ["autodocs", "test"],
  args: {
    icon: <BookmarkIcon />,
    title: "Projects",
    description: "Everything your team is working on, in one place you will actually want to open.",
    actions: <Button onClick={action}>New project</Button>,
    highlights,
  },
};

export default meta;

type Story = StoryObj<typeof PageIntro>;

export const Default: Story = {
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("heading", { name: "Projects", level: 1 })).toBeVisible();
    await expect(
      canvas.getByText("Everything your team is working on, in one place you will actually want to open."),
    ).toBeVisible();
    const list = canvas.getByRole("list", { name: "What you can do in Projects" });
    await expect(within(list).getAllByRole("listitem")).toHaveLength(3);
    await userEvent.click(canvas.getByRole("button", { name: "New project" }));
    await expect(action).toHaveBeenCalledOnce();
  },
};

export const WithoutHighlights: Story = {
  args: { highlights: undefined },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("heading", { name: "Projects" })).toBeVisible();
    await expect(canvas.queryByRole("list")).not.toBeInTheDocument();
  },
};

export const EmptyHighlights: Story = {
  args: { highlights: [] },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).queryByRole("list")).not.toBeInTheDocument();
  },
};

export const WithEyebrow: Story = {
  args: { eyebrow: "WEEKEND CREW", actions: undefined },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const eyebrow = canvas.getByText("WEEKEND CREW");
    const title = canvas.getByRole("heading", { name: "Projects", level: 1 });
    await expect(eyebrow.compareDocumentPosition(title) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    await expect(canvas.queryByRole("button")).not.toBeInTheDocument();
  },
};

export const TextOnly: Story = {
  args: { icon: undefined, actions: undefined, highlights: undefined },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector('[data-slot="page-intro-icon"]')).toBeNull();
  },
};

export const Narrow: Story = {
  decorators: [
    (Story) => (
      <div className="w-80 max-w-full">
        <Story />
      </div>
    ),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const intro = canvasElement.querySelector('[data-slot="page-intro"]');
    await expect(intro?.scrollWidth).toBeLessThanOrEqual(intro?.clientWidth ?? 0);
    const [first, second] = within(canvas.getByRole("list")).getAllByRole("listitem");
    await expect(first?.getBoundingClientRect().bottom).toBeLessThanOrEqual(second?.getBoundingClientRect().top ?? 0);
  },
};

export const Wide: Story = {
  decorators: [
    (Story) => (
      <div className="w-5xl max-w-full">
        <Story />
      </div>
    ),
  ],
  play: async ({ canvasElement }) => {
    const [first, second] = within(within(canvasElement).getByRole("list")).getAllByRole("listitem");
    await expect(first?.getBoundingClientRect().top).toEqual(second?.getBoundingClientRect().top);
  },
};
