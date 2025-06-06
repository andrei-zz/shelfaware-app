import type { useFetcher } from "react-router";
import { cn } from "~/lib/utils";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { FieldError } from "./field-error";
import type React from "react";

export const Field = ({
  id,
  name,
  label,
  fieldErrors,
  containerProps,
  labelProps,
  ...props
}: React.ComponentProps<typeof Input> & {
  label?: React.ReactNode;
  labelProps?: Omit<React.ComponentProps<typeof Label>, "children">;
  fieldErrors?: string[];
  containerProps?: React.ComponentProps<"div">;
}) => {
  return (
    <div
      {...containerProps}
      className={cn(
        "flex flex-col w-full space-y-2",
        containerProps?.className
      )}
    >
      <Label htmlFor={id ?? name} {...labelProps}>
        {label}
      </Label>
      <Input
        key={props.value?.toString() ?? props.defaultValue?.toString()}
        type="text"
        autoComplete="off"
        {...props}
        id={id ?? name}
        name={name}
        className={cn("w-full text-sm", props.className)}
      />
      {Array.isArray(fieldErrors) && fieldErrors.length > 0 ? (
        <FieldError>{fieldErrors[0]}</FieldError>
      ) : null}
    </div>
  );
};
