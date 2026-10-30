import { useState, type ReactElement } from "react";
import {
  AppShell,
  Badge,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Field,
  FieldGroup,
  FieldLabel,
  Grid,
  NativeSelect,
  NativeSelectOption,
  PageHeader,
  StatCard,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@alexgorbatchev/shadcn";
import type { PrototypeProps } from "../../../types";
import { ScenarioContent } from "../../../components/ScenarioContent";
import { deliveries } from "../data";

export function Dashboard({ scenario }: PrototypeProps): ReactElement {
  const [team, setTeam] = useState("All teams");
  const visible = deliveries.filter((delivery) => team === "All teams" || delivery.team === team);
  return (
    <AppShell brand="Northstar" header="Overview" navigation={[]}>
      <PageHeader title="Delivery overview" description="A shared view of the work moving this week." />
      <ScenarioContent scenario={scenario}>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="team">Team</FieldLabel>
            <NativeSelect id="team" value={team} onChange={(event) => setTeam(event.target.value)}>
              <NativeSelectOption>All teams</NativeSelectOption>
              <NativeSelectOption>Product</NativeSelectOption>
              <NativeSelectOption>Engineering</NativeSelectOption>
            </NativeSelect>
          </Field>
        </FieldGroup>
        <Grid columns={{ base: 1, sm: 2 }} gap="panel">
          <StatCard label="Active projects" value={visible.length} />
          <StatCard label="Ready for review" value={visible.filter((delivery) => delivery.status === "Ready").length} />
        </Grid>
        <Card>
          <CardHeader>
            <CardTitle>Delivery queue</CardTitle>
            <CardDescription>Projects for {team.toLowerCase()}.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project</TableHead>
                  <TableHead>Team</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visible.map((delivery) => (
                  <TableRow key={delivery.name}>
                    <TableCell>{delivery.name}</TableCell>
                    <TableCell>{delivery.team}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{delivery.status}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </ScenarioContent>
    </AppShell>
  );
}
