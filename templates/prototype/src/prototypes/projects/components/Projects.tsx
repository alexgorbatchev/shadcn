import { useState, type ReactElement } from "react";
import {
  AppShell,
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Empty,
  EmptyHeader,
  EmptyTitle,
  Field,
  FieldGroup,
  FieldLabel,
  Input,
  PageHeader,
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@alexgorbatchev/shadcn";
import type { PrototypeProps } from "../../../types";
import { ScenarioContent } from "../../../components/ScenarioContent";
import { projects } from "../data";

type Project = (typeof projects)[number];

export function Projects({ scenario }: PrototypeProps): ReactElement {
  const [records, setRecords] = useState(projects);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Project | null>(null);
  const [message, setMessage] = useState("");
  const visible = records.filter((project) =>
    `${project.name} ${project.owner}`.toLowerCase().includes(search.toLowerCase()),
  );
  return (
    <AppShell brand="Northstar" header="Projects" navigation={[]}>
      <PageHeader title="Projects" description="Find a project and update its details." />
      <ScenarioContent scenario={scenario}>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="search">Search projects</FieldLabel>
            <Input id="search" value={search} onChange={(event) => setSearch(event.target.value)} />
          </Field>
        </FieldGroup>
        <Card>
          <CardHeader>
            <CardTitle>Project directory</CardTitle>
            <CardDescription>{visible.length} projects</CardDescription>
          </CardHeader>
          <CardContent>
            {visible.length ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Project</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visible.map((project) => (
                    <TableRow key={project.id}>
                      <TableCell>{project.name}</TableCell>
                      <TableCell>{project.owner}</TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          aria-label={`Edit ${project.name}`}
                          onClick={() => setEditing({ ...project })}
                        >
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <Empty>
                <EmptyHeader>
                  <EmptyTitle>No matching projects</EmptyTitle>
                </EmptyHeader>
              </Empty>
            )}
          </CardContent>
        </Card>
        <p role="status">{message}</p>
        <Dialog
          open={editing !== null}
          onOpenChange={(open) => {
            if (!open) setEditing(null);
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit project</DialogTitle>
              <DialogDescription>Changes stay in this prototype until you reset it.</DialogDescription>
            </DialogHeader>
            {editing && (
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  setRecords((current) => current.map((project) => (project.id === editing.id ? editing : project)));
                  setMessage(`Saved ${editing.name}`);
                  setEditing(null);
                }}
              >
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="project-name">Project name</FieldLabel>
                    <Input
                      id="project-name"
                      required
                      value={editing.name}
                      onChange={(event) => setEditing({ ...editing, name: event.target.value })}
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="project-owner">Owner</FieldLabel>
                    <Input
                      id="project-owner"
                      required
                      value={editing.owner}
                      onChange={(event) => setEditing({ ...editing, owner: event.target.value })}
                    />
                  </Field>
                </FieldGroup>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setEditing(null)}>
                    Cancel
                  </Button>
                  <Button type="submit">Save project</Button>
                </DialogFooter>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </ScenarioContent>
    </AppShell>
  );
}
