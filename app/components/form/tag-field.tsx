import { DateTime } from "luxon";
import { useEffect, useState } from "react";

import type { getItem, getTagsWithRawItems } from "~/actions/select.server";

import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { FieldError } from "./field-error";

export const TagField = ({
  tags,
  tag,
  name,
  label,
  fieldErrors,
  ...props
}: React.ComponentProps<typeof Select> & {
  tags?: Awaited<ReturnType<typeof getTagsWithRawItems>>;
  tag?: Exclude<Awaited<ReturnType<typeof getItem>>, undefined>["tag"];
  label?: string;
  fieldErrors?: string[];
}) => {
  const [tagIdValue, setTagIdValue] = useState<string | undefined>(
    tag?.id?.toString() ?? ""
  );

  useEffect(() => {
    setTagIdValue(tag?.id?.toString());
  }, [tag?.id]);

  const labelId = `${name}-label`;
  return (
    <div className="flex flex-col w-full space-y-2">
      <Label id={labelId}>{label ?? "Attached tag"}</Label>
      <Select
        name={name}
        value={tagIdValue}
        onValueChange={setTagIdValue}
        {...props}
      >
        <SelectTrigger aria-labelledby={labelId} className="w-full mb-0">
          <SelectValue placeholder="Untagged" />
        </SelectTrigger>
        <SelectContent>
          {tags != null && tags.length > 0 ? (
            tags?.map((tag) => (
              <SelectItem key={tag.id.toString()} value={tag.id.toString()}>
                #{tag.id}: {tag.name}, UID: {tag.uid}
                {tag.item != null
                  ? ` (attached to ${tag.item.name}${
                      tag.attachedAt != null
                        ? ` at ${DateTime.fromMillis(
                            tag.attachedAt
                          ).toLocaleString()}`
                        : ""
                    })`
                  : null}
              </SelectItem>
            ))
          ) : (
            <div className="focus:bg-accent focus:text-accent-foreground [&_svg:not([class*='text-'])]:text-muted-foreground relative flex w-full cursor-default items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2 font-light text-center justify-center">
              No tags
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
