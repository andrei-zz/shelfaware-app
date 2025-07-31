import { useEffect, useState } from "react";
import { Database, Plus } from "lucide-react";

import type { getItemType, getItemTypes } from "~/actions/select.server";

import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "~/components/ui/toggle-group";
import { FieldError } from "./field-error";

interface ItemTypeFieldProps {
  itemTypeIdFieldName?: string;
  itemTypeNameFieldName?: string;
  label?: string;
  itemType?: Awaited<ReturnType<typeof getItemType>>;
  itemTypes?: Awaited<ReturnType<typeof getItemTypes>>;
  itemTypeIdFieldErrors?: string[];
  itemTypeNameFieldErrors?: string[];
}

export const ItemTypeField = ({
  itemTypeIdFieldName,
  itemTypeNameFieldName,
  label,
  itemType,
  itemTypes,
  itemTypeIdFieldErrors,
  itemTypeNameFieldErrors,
}: ItemTypeFieldProps) => {
  const [mode, setMode] = useState<"existing" | "new">("existing");
  const [itemTypeIdValue, setItemTypeIdValue] = useState<string | undefined>(
    itemType?.id.toString()
  );
  const [itemTypeNameValue, setItemTypeNameValue] = useState<
    string | undefined
  >(undefined);

  useEffect(() => {
    setItemTypeIdValue(itemType?.id?.toString());
    setItemTypeNameValue(undefined);
    setMode("existing");
  }, [itemType?.id]);

  return (
    <div className="flex flex-col w-full gap-y-2">
      <div className="flex items-center space-x-4">
        {label == null ? null : (
          <Label
            htmlFor={
              mode === "existing" ? itemTypeIdFieldName : itemTypeNameFieldName
            }
          >
            {label}
          </Label>
        )}
        <ToggleGroup
          type="single"
          value={mode}
          onValueChange={(value) => {
            if (value === "existing" || value === "new") setMode(value);
          }}
          variant="outline"
          size="sm"
        >
          <ToggleGroupItem value="existing" className="text-xs gap-x-1 px-2">
            <Database /> Existing type
          </ToggleGroupItem>
          <ToggleGroupItem value="new" className="text-xs gap-x-1">
            <Plus /> New type
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
      {mode === "existing" ? (
        <Select
          name={itemTypeIdFieldName}
          value={itemTypeIdValue}
          onValueChange={setItemTypeIdValue}
        >
          <SelectTrigger
            aria-labelledby={itemTypeIdFieldName}
            className="w-full mb-0"
          >
            <SelectValue placeholder="No type" />
          </SelectTrigger>
          <SelectContent>
            {itemTypes != null && itemTypes.length > 0 ? (
              itemTypes?.map((itemType) => (
                <SelectItem
                  key={itemType.id.toString()}
                  value={itemType.id.toString()}
                >
                  {`#${itemType.id}: ${
                    itemType.name == null
                      ? "No name"
                      : ` ${itemType.name}${
                          itemType.description == null
                            ? " (no description)"
                            : ` (${itemType.description})`
                        }`
                  }`}
                </SelectItem>
              ))
            ) : (
              <div className="focus:bg-accent focus:text-accent-foreground [&_svg:not([class*='text-'])]:text-muted-foreground relative flex w-full cursor-default items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2 font-light text-center justify-center">
                No types
              </div>
            )}
          </SelectContent>
        </Select>
      ) : (
        <Input
          type="text"
          id={itemTypeNameFieldName}
          name={itemTypeNameFieldName}
          value={itemTypeNameValue}
          onChange={(e) => setItemTypeNameValue(e.target.value)}
          autoComplete="off"
          className="w-full"
        />
      )}
      {mode === "existing" ? (
        Array.isArray(itemTypeIdFieldErrors) &&
        itemTypeIdFieldErrors.length > 0 ? (
          <FieldError>{itemTypeIdFieldErrors[0]}</FieldError>
        ) : null
      ) : Array.isArray(itemTypeNameFieldErrors) &&
        itemTypeNameFieldErrors.length > 0 ? (
        <FieldError>{itemTypeNameFieldErrors[0]}</FieldError>
      ) : null}
    </div>
  );
};
