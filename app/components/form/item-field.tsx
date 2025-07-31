import type { getItem, getItems } from "~/actions/select.server";

import { cn } from "~/lib/utils";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { useEffect, useState } from "react";
import { FieldError } from "./field-error";

export const ItemField = ({
  items,
  item,
  mapFunction,
  emptyItemsLabel,
  fieldErrors,
  containerProps,
  labelProps,
  selectTriggerProps,
  selectValueProps,
  selectContentProps,
  selectItemProps,
  ...props
}: React.ComponentProps<typeof Select> & {
  items?: Awaited<ReturnType<typeof getItems>>;
  item?: Awaited<ReturnType<typeof getItem>>;
  mapFunction?: (
    value: Awaited<ReturnType<typeof getItems>>[number]
  ) => React.ReactNode;
  emptyItemsLabel?: React.ReactNode;
  fieldErrors?: string[];
  containerProps?: React.ComponentProps<"div">;
  labelProps?: React.ComponentProps<typeof Label>;
  selectTriggerProps?: React.ComponentProps<typeof SelectTrigger>;
  selectValueProps?: React.ComponentProps<typeof SelectValue>;
  selectContentProps?: React.ComponentProps<typeof SelectContent>;
  selectItemProps?: React.ComponentProps<typeof SelectItem>;
}) => {
  const [itemIdValue, setItemIdValue] = useState<string>(
    item?.id?.toString() ?? ""
  );

  useEffect(() => {
    setItemIdValue(item?.id?.toString() ?? "");
  }, [item?.id]);

  return (
    <div
      {...containerProps}
      className={cn(
        "flex flex-col w-full space-y-2",
        containerProps?.className
      )}
    >
      <Label id="itemId-label" {...labelProps}>
        {labelProps?.children ?? "Item"}
      </Label>
      <Select
        name="itemId"
        value={itemIdValue}
        onValueChange={setItemIdValue}
        {...props}
      >
        <SelectTrigger
          aria-labelledby="itemId-label"
          {...selectTriggerProps}
          className={cn("w-full mb-0", selectTriggerProps?.className)}
        >
          <SelectValue placeholder="No item" {...selectValueProps} />
        </SelectTrigger>
        <SelectContent {...selectContentProps}>
          {items != null && items.length > 0 ? (
            mapFunction != null ? (
              items?.map(mapFunction)
            ) : (
              items?.map((item) => (
                <SelectItem
                  key={item.id}
                  value={item.id.toString()}
                  {...selectItemProps}
                >
                  {`#${item.id}: ${item.name}${
                    item.currentWeight == null
                      ? ""
                      : `, ${item.currentWeight} g`
                  }${
                    item.tag == null
                      ? ""
                      : ` (attached to ${item.tag.name}, UID: ${item.tag.uid})`
                  }`}
                </SelectItem>
              ))
            )
          ) : (
            <div className="focus:bg-accent focus:text-accent-foreground [&_svg:not([class*='text-'])]:text-muted-foreground relative flex w-full cursor-default items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2 font-light text-center justify-center">
              {emptyItemsLabel ?? "No items"}
            </div>
          )}
        </SelectContent>
      </Select>
      {Array.isArray(fieldErrors) && fieldErrors.length > 0 ? (
        <FieldError className="col-span-1 sm:col-span-2">
          {fieldErrors[0]}
        </FieldError>
      ) : null}
    </div>
  );
};
