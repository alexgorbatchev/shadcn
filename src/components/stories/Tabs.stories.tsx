import type { Meta, StoryObj } from "@storybook/react-vite";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../Tabs";

const meta: Meta<typeof Tabs> = {
  title: "shadcn-alexgorbatchev/components/Tabs",
  component: Tabs,
  tags: ["autodocs", "!test"],
  args: { defaultValue: "overview" },
  render: (args) => (
    <Tabs {...args}>
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="settings">Settings</TabsTrigger>
        <TabsTrigger value="disabled" disabled>
          Unavailable
        </TabsTrigger>
      </TabsList>
      <TabsContent value="overview">Your project is ready.</TabsContent>
      <TabsContent value="settings">Configure your preferences.</TabsContent>
    </Tabs>
  ),
};
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Settings: Story = { args: { defaultValue: "settings" } };
export const Vertical: Story = { args: { orientation: "vertical" } };
export const Line: Story = {
  render: (args) => (
    <Tabs {...args}>
      <TabsList variant="line">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="settings">Settings</TabsTrigger>
      </TabsList>
      <TabsContent value="overview">Project overview.</TabsContent>
      <TabsContent value="settings">Project settings.</TabsContent>
    </Tabs>
  ),
};
