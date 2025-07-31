import type { useFetcher } from "react-router";
import { cn } from "~/lib/utils";
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";
import { FieldError } from "./field-error";

export const CheckboxField = ({
  id,
  name,
  label,
  fieldErrors,
  labelProps,
  containerProps,
  rowContainerProps,
  ...props
}: React.ComponentProps<typeof Checkbox> & {
  label?: React.ReactNode;
  fieldErrors?: string[];
  labelProps?: Omit<React.ComponentProps<typeof Label>, "children">;
  containerProps?: React.ComponentProps<"div">;
  rowContainerProps?: React.ComponentProps<"div">;
}) => {
  return (
    <div
      {...containerProps}
      className={cn("my-0.5 flex flex-col w-full", containerProps?.className)}
    >
      <div
        {...rowContainerProps}
        className={cn(
          "flex w-full items-center space-x-2",
          rowContainerProps?.className
        )}
      >
        <Checkbox
          key={props.value?.toString() ?? props.defaultChecked?.toString()}
          {...props}
          id={id ?? name}
          name={name}
        />
        <Label htmlFor={id ?? name} {...labelProps}>
          {label}
        </Label>
      </div>
      {Array.isArray(fieldErrors) && fieldErrors.length > 0 ? (
        <FieldError>{fieldErrors[0]}</FieldError>
      ) : null}
    </div>
  );
};
