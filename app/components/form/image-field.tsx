import { useEffect, useState } from "react";
import { Database, FileUp } from "lucide-react";

import type { getImage, getImages } from "~/actions/select.server";

import { Image } from "~/components/image";
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
import { cn } from "~/lib/utils";

interface ImageFieldProps {
  imageFileFieldName?: string;
  imageIdFieldName?: string;
  label?: string;
  image?: Awaited<ReturnType<typeof getImage>>;
  images?: Awaited<ReturnType<typeof getImages>>;
}

export const ImageField = ({
  imageFileFieldName,
  imageIdFieldName,
  label,
  image,
  images,
}: ImageFieldProps) => {
  const [mode, setMode] = useState<"file" | "existing">("file");
  const [imageIdValue, setImageIdValue] = useState<string>(
    image?.id.toString() ?? ""
  );
  const [inputImageUrl, setInputImageUrl] = useState<string | null>(null);

  useEffect(() => {
    setImageIdValue(image?.id?.toString() ?? "");
    setMode("file");
  }, [image?.id]);

  return (
    <div className="flex flex-col w-full gap-y-2">
      <div className="flex items-center space-x-4">
        {label == null ? null : (
          <Label
            htmlFor={mode === "file" ? imageFileFieldName : imageIdFieldName}
          >
            {label}
          </Label>
        )}
        <ToggleGroup
          type="single"
          value={mode}
          onValueChange={(value) => {
            if (value === "file" || value === "existing") setMode(value);
          }}
          variant="outline"
          size="sm"
        >
          <ToggleGroupItem value="file" className="text-xs gap-x-1">
            <FileUp /> Image upload
          </ToggleGroupItem>
          <ToggleGroupItem value="existing" className="text-xs gap-x-1">
            <Database /> Existing image
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
      <Input
        type="file"
        accept="image/*"
        id={imageFileFieldName}
        name={mode === "file" ? imageFileFieldName : undefined}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            const url = URL.createObjectURL(file);
            setInputImageUrl(url);
          } else {
            setInputImageUrl(null);
          }
        }}
        hidden={mode === "file" ? undefined : true}
        className={cn("text-sm", mode === "file" ? undefined : "hidden")}
      />
      {mode === "existing" ? (
        <Select
          key={image?.id} // workaround to re-render when action completes
          name={imageIdFieldName}
          value={imageIdValue}
          onValueChange={setImageIdValue}
        >
          <SelectTrigger
            aria-labelledby={imageIdFieldName}
            className="w-full mb-0"
          >
            <SelectValue placeholder="No image" />
          </SelectTrigger>
          <SelectContent>
            {images != null && images.length > 0 ? (
              images?.map((image) => (
                <SelectItem
                  key={image.id.toString()}
                  value={image.id.toString()}
                >
                  {`#${image.id}: ${
                    image.title == null
                      ? "No title"
                      : ` ${image.title}${
                          image.description == null
                            ? " (no description)"
                            : ` (${image.description})`
                        }`
                  }`}
                </SelectItem>
              ))
            ) : (
              <div className="focus:bg-accent focus:text-accent-foreground [&_svg:not([class*='text-'])]:text-muted-foreground relative flex w-full cursor-default items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2 font-light text-center justify-center">
                No images
              </div>
            )}
          </SelectContent>
        </Select>
      ) : null}
      {image || (mode === "existing" && imageIdValue) ? (
        <div className="flex space-x-8">
          {image ? (
            <div className="flex flex-col">
              <span className="text-sm font-light">Current</span>
              <Image
                src={`/api/image?id=${image.id}`}
                size="lg"
                containerProps={{
                  className: "hover:bg-accent",
                }}
                className="hover:opacity-80"
              />
            </div>
          ) : null}
          {(mode === "existing" && imageIdValue) || inputImageUrl != null ? (
            <div className="flex flex-col">
              <span className="text-sm font-light">Preview</span>
              <Image
                src={
                  mode === "existing" && imageIdValue
                    ? `/api/image?id=${imageIdValue}`
                    : inputImageUrl ?? ""
                }
                size="lg"
                containerProps={{
                  className: "hover:bg-accent",
                }}
                className="hover:opacity-80"
              />
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
};
