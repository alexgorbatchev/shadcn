import { useState, type ComponentProps, type ReactElement } from "react";
import {
  Combobox,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxValue,
  ComboboxChip,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxList,
  ComboboxItem,
} from "../Combobox";
import { useComboboxAnchor } from "../../hooks/useComboboxAnchor";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "../AlertDialog";
import { Button } from "../Button";
import { useTheme } from "../../hooks/useTheme";

const technologies: string[] = ["Bun", "React", "TypeScript", "Tailwind CSS"];

export function ThemeControlsExample(): ReactElement {
  const { theme, resolvedTheme, setTheme } = useTheme();
  return (
    <div className="flex flex-col gap-4">
      <p role="status">
        Preference: {theme}. Resolved palette: {resolvedTheme}.
      </p>
      <div className="flex gap-2">
        <Button variant="outline" onClick={() => setTheme("light")}>
          Light
        </Button>
        <Button variant="outline" onClick={() => setTheme("dark")}>
          Dark
        </Button>
        <Button variant="outline" onClick={() => setTheme("system")}>
          System
        </Button>
      </div>
    </div>
  );
}

export function ComboboxMultipleExample(): ReactElement {
  const anchor = useComboboxAnchor();
  return (
    <Combobox items={technologies} multiple defaultValue={["Bun", "React"]}>
      <ComboboxChips ref={anchor}>
        <ComboboxValue>
          {(values: string[]) => (
            <>
              {values.map((value) => (
                <ComboboxChip key={value}>{value}</ComboboxChip>
              ))}
              <ComboboxChipsInput aria-label="Technologies" placeholder="Add technology" />
            </>
          )}
        </ComboboxValue>
      </ComboboxChips>
      <ComboboxContent anchor={anchor}>
        <ComboboxEmpty>No matches.</ComboboxEmpty>
        <ComboboxGroup>
          <ComboboxList>
            {(item: string) => (
              <ComboboxItem key={item} value={item}>
                {item}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxGroup>
      </ComboboxContent>
    </Combobox>
  );
}

export function DeleteConfirmationExample(props: ComponentProps<typeof AlertDialog>): ReactElement {
  const [isDeleted, setIsDeleted] = useState(false);
  const [isOpen, setIsOpen] = useState(props.defaultOpen ?? false);
  return (
    <>
      <AlertDialog {...props} open={isOpen} onOpenChange={setIsOpen}>
        <AlertDialogTrigger render={<Button variant="destructive" />}>Delete project</AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this project?</AlertDialogTitle>
            <AlertDialogDescription>This demonstration only changes local story state.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                setIsDeleted(true);
                setIsOpen(false);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {isDeleted && <p role="status">Project deleted.</p>}
    </>
  );
}
