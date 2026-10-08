import type { Meta, StoryObj } from "@storybook/react-vite";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, CardAction } from "../Card";
import { Button } from "../Button";
import { Badge } from "../Badge";

const meta: Meta<typeof Card> = {
  title: "shadcn-alexgorbatchev/components/Card",
  component: Card,
  tags: ["autodocs", "!test"],
  render: (args) => (
    <Card {...args}>
      <CardHeader>
        <CardTitle>Project settings</CardTitle>
        <CardDescription>Configure your workspace.</CardDescription>
        <CardAction>
          <Badge variant="success">Ready</Badge>
        </CardAction>
      </CardHeader>
      <CardContent>Local tools, one consistent interface.</CardContent>
      <CardFooter>
        <Button>Open project</Button>
      </CardFooter>
    </Card>
  ),
};
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Small: Story = { args: { size: "sm" } };
