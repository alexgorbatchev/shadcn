import { useState, type ReactElement } from "react";
import {
  AppShell,
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Field,
  FieldGroup,
  FieldLabel,
  Input,
  PageHeader,
  Switch,
} from "@alexgorbatchev/shadcn";
import type { PrototypeProps } from "../../../types";
import { ScenarioContent } from "../../../components/ScenarioContent";

export function Settings({ scenario }: PrototypeProps): ReactElement {
  const [name, setName] = useState("Northstar");
  const [email, setEmail] = useState("team@example.com");
  const [notifications, setNotifications] = useState(true);
  const [message, setMessage] = useState("");
  return (
    <AppShell brand="Northstar" header="Settings" navigation={[]}>
      <PageHeader title="Workspace settings" description="Manage the profile and preferences for your team." />
      <ScenarioContent scenario={scenario}>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            setMessage(`Saved ${name}. Email updates ${notifications ? "enabled" : "disabled"} for ${email}.`);
          }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Workspace profile</CardTitle>
              <CardDescription>These settings use local sample data.</CardDescription>
            </CardHeader>
            <CardContent>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="workspace-name">Workspace name</FieldLabel>
                  <Input id="workspace-name" required value={name} onChange={(event) => setName(event.target.value)} />
                </Field>
                <Field>
                  <FieldLabel htmlFor="email">Contact email</FieldLabel>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                  />
                </Field>
                <Field orientation="horizontal">
                  <Switch id="notifications" checked={notifications} onCheckedChange={setNotifications} />
                  <FieldLabel htmlFor="notifications">Email updates</FieldLabel>
                </Field>
              </FieldGroup>
            </CardContent>
            <CardFooter>
              <Button type="submit">Save settings</Button>
            </CardFooter>
          </Card>
        </form>
        <p role="status">{message}</p>
      </ScenarioContent>
    </AppShell>
  );
}
