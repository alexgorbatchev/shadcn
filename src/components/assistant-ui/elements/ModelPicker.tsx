import { useId, type ComponentProps, type JSX } from "react";
import { Badge } from "../../Badge.js";
import { Card, CardContent } from "../../Card.js";
import { Field, FieldContent, FieldLabel, FieldDescription, FieldLegend, FieldSet } from "../../Field.js";
import { RadioGroup, RadioGroupItem } from "../../RadioGroup.js";

export interface IPickableModel {
  id: string;
  name: string;
  family: string;
  context: string;
  price: string;
  capabilities: readonly string[];
}

export function ModelPicker({ models, selectedId, onSelect, ...props }: IModelPickerProps): JSX.Element {
  const id = useId();
  const families = [...new Set(models.map((model) => model.family))];
  return (
    <Card data-testid="ModelPicker" className="w-full max-w-sm" {...props}>
      <CardContent>
        <RadioGroup
          aria-label="Models"
          value={selectedId}
          disabled={!onSelect}
          onValueChange={(value) => {
            if (typeof value === "string") onSelect?.(value);
          }}
        >
          {families.map((family) => (
            <FieldSet key={family}>
              <FieldLegend variant="label">{family}</FieldLegend>
              {models
                .filter((model) => model.family === family)
                .map((model) => (
                  <Field key={model.id} orientation="horizontal">
                    <RadioGroupItem id={`${id}-${model.id}`} value={model.id} aria-label={model.name} />
                    <FieldContent>
                      <FieldLabel htmlFor={`${id}-${model.id}`}>{model.name}</FieldLabel>
                      <div className="flex flex-wrap gap-control-gap">
                        {model.capabilities.map((capability) => (
                          <Badge key={capability} variant="secondary">
                            {capability}
                          </Badge>
                        ))}
                      </div>
                      <FieldDescription>
                        {model.context} · {model.price}
                      </FieldDescription>
                    </FieldContent>
                  </Field>
                ))}
            </FieldSet>
          ))}
        </RadioGroup>
      </CardContent>
    </Card>
  );
}

interface IModelPickerProps extends Omit<ComponentProps<"div">, "children" | "className" | "style" | "onSelect"> {
  models: readonly IPickableModel[];
  selectedId: string;
  onSelect?: (id: string) => void;
}
