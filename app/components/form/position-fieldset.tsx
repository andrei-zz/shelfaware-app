import type React from "react";

import { cn } from "~/lib/utils";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";

export const PositionFieldset = ({
  legendProps,
  fieldContainerProps,
  floorInputProps,
  rowInputProps,
  colInputProps,
  ...props
}: React.ComponentProps<"fieldset"> & {
  legendProps?: React.ComponentProps<"legend">;
  fieldContainerProps?: React.ComponentProps<"div">;
  floorInputProps?: React.ComponentProps<typeof Input>;
  rowInputProps?: React.ComponentProps<typeof Input>;
  colInputProps?: React.ComponentProps<typeof Input>;
}) => {
  return (
    <fieldset
      {...props}
      className={cn("flex flex-col w-full space-y-2", props.className)}
    >
      <legend
        {...legendProps}
        className={cn(
          "flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
          legendProps?.className
        )}
      >
        Item position
      </legend>
      <div
        {...fieldContainerProps}
        className={cn(
          "ml-4 grid grid-cols-1 sm:grid-cols-[max-content_1fr] w-[100%-1rem] gap-y-2 gap-x-4",
          fieldContainerProps?.className
        )}
      >
        <Label htmlFor="floor">Floor</Label>
        <Input
          type="number"
          step="1"
          id="floor"
          name="floor"
          {...floorInputProps}
          className={cn("w-full", floorInputProps?.className)}
        />
        <Label htmlFor="row">Row</Label>
        <Input
          type="number"
          step="1"
          id="row"
          name="row"
          {...rowInputProps}
          className={cn("w-full", rowInputProps?.className)}
        />
        <Label htmlFor="col">Column</Label>
        <Input
          type="number"
          step="1"
          id="col"
          name="col"
          {...colInputProps}
          className={cn("w-full", colInputProps?.className)}
        />
      </div>
    </fieldset>
  );
};
