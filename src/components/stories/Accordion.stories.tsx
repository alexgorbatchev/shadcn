import type { Meta, StoryObj } from "@storybook/react-vite";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "../Accordion";

const meta: Meta<typeof Accordion> = {
  title: "shadcn-alexgorbatchev/components/Accordion",
  component: Accordion,
  tags: ["autodocs", "!test"],
  render: (args) => (
    <Accordion {...args}>
      <AccordionItem value="install">
        <AccordionTrigger>How do I install the package?</AccordionTrigger>
        <AccordionContent>
          Install the package with Bun, import the theme, and scan the package output with Tailwind.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="density">
        <AccordionTrigger>Which densities are available?</AccordionTrigger>
        <AccordionContent>Compact and comfortable.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="disabled" disabled>
        <AccordionTrigger>Unavailable section</AccordionTrigger>
        <AccordionContent>This section is disabled.</AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
};
export default meta;
type Story = StoryObj<typeof meta>;

export const Closed: Story = {};
export const Expanded: Story = { args: { defaultValue: ["install"] } };
export const Multiple: Story = { args: { multiple: true, defaultValue: ["install", "density"] } };
export const Disabled: Story = { args: { disabled: true } };
