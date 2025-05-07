import { DateTime } from "luxon";
import type { getTagsWithRawItems } from "~/actions/select.server";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

interface TagFieldProps {
  name: string;
  tags: Awaited<ReturnType<typeof getTagsWithRawItems>>;
  label?: string;
  placeholder?: string;
}

export const TagField = ({ name, tags, label, placeholder }: TagFieldProps) => {
  const labelId = `${name}-label`;
  return (
    <div className="flex flex-col w-full space-y-2">
      {label == null ? null : <Label id={labelId}>{label}</Label>}
      <Select name={name}>
        <SelectTrigger aria-labelledby={labelId} className="w-full">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {tags.map((tag) => (
            <SelectItem key={tag.id} value={tag.id.toString()}>
              {tag.id}: {tag.name}, {tag.uid}
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
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
