import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, waitFor, within } from "storybook/test";
import { ScrollGuard } from "../../ScrollGuard";
import { ScrollArea } from "../../ScrollArea";

const meta: Meta<typeof ScrollGuard> = {
  title: "@alexgorbatchev/shadcn/components/providers/ScrollGuard",
  component: ScrollGuard,
  tags: ["autodocs", "test"],
  parameters: {
    docs: {
      description: {
        component:
          'ThemeProvider mounts ScrollGuard automatically in development. Mark any HTML element with data-scroll="none" to reject accidental scrolling on that element. Place intentional scrolling in a nested ScrollArea or native scroll viewport. Errors identify the offending element and axis. Production builds install no observers.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const Default: Story = {
  render: () => (
    <>
      <ScrollGuard />
      <section data-scroll="none" aria-label="Stationary panel" className="flex w-64 flex-col gap-3 border p-4">
        <h2>Stationary panel</h2>
        <ScrollArea className="h-32">
          <div className="flex flex-col gap-3">
            {Array.from({ length: 20 }, (_, index) => (
              <p key={index}>Scrollable item {index + 1}</p>
            ))}
          </div>
        </ScrollArea>
      </section>
    </>
  ),
  play: async ({ canvasElement }) => {
    const panel = within(canvasElement).getByRole("region", { name: "Stationary panel" });
    const viewport = panel.querySelector('[data-slot="scroll-area-viewport"]');
    viewport?.scrollTo({ top: 60, behavior: "instant" });
    await waitFor(() => expect(viewport?.scrollTop).toBe(60));
    await expect(panel.scrollTop).toBe(0);
  },
};

export { Default as ScrollGuardExample };
