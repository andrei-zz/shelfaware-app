import { useState } from "react";
import { Database, FileUp } from "lucide-react";
import type { getImage, getImages } from "~/actions/select.server";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { ToggleGroup, ToggleGroupItem } from "./ui/toggle-group";

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
  const [imageIdValue, setImageIdValue] = useState<string | undefined>(
    image?.id.toString()
  );
  return (
    <div className="flex flex-col w-full space-y-2">
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
      {mode === "file" ? (
        <Input
          type="file"
          accept="image/*"
          id={imageFileFieldName}
          name={imageFileFieldName}
          className="text-sm"
        />
      ) : (
        <Select
          name={imageIdFieldName}
          value={imageIdValue}
          onValueChange={setImageIdValue}
        >
          <SelectTrigger aria-labelledby={imageIdFieldName} className="w-full mb-0">
            <SelectValue placeholder="No image" />
          </SelectTrigger>
          <SelectContent>
            {images?.map((image) => (
              <SelectItem key={image.id.toString()} value={image.id.toString()}>
                {`${image.id}${
                  image.title == null
                    ? ""
                    : ` ${image.title}${
                        image.description == null
                          ? ""
                          : ` (${image.description})`
                      }`
                }`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
      {image || (mode === "existing" && imageIdValue != null) ? (
        <div className="flex space-x-8">
          {image ? (
            <div className="flex flex-col">
              <span className="text-sm font-light">Current</span>
              <div className="w-48 h-48 flex justify-center items-center hover:bg-accent">
                <img
                  className="max-w-full max-h-full contain-layout"
                  src={`/api/image?id=${image.id}`}
                />
              </div>
            </div>
          ) : null}
          {mode === "existing" && imageIdValue != null ? (
            <div className="flex flex-col">
              <span className="text-sm font-light">Preview</span>
              <div className="w-48 h-48 flex justify-center items-center hover:bg-accent">
                <img
                  className="max-w-full max-h-full contain-layout"
                  src={`/api/image?id=${imageIdValue}`}
                />
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
};
