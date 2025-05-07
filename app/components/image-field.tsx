import type { getImage, getItem } from "~/actions/select.server";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { useState } from "react";
import { ToggleGroup, ToggleGroupItem } from "./ui/toggle-group";
import { Database, FileUp } from "lucide-react";

interface ImageFieldProps {
  imageFileFieldName?: string;
  imageIdFieldName?: string;
  label?: string;
  image?: Awaited<ReturnType<typeof getImage>>;
}

export const ImageField = ({
  imageFileFieldName,
  imageIdFieldName,
  label,
  image,
}: ImageFieldProps) => {
  const [mode, setMode] = useState<"file" | "existing">("file");
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
          <ToggleGroupItem value="file" className="py-0">
            Image upload
          </ToggleGroupItem>
          <ToggleGroupItem value="existing" className="py-0">
            Existing image
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
      {mode === "file" ? (
        <Input
          type="file"
          accept="image/*"
          id={imageFileFieldName}
          name={imageFileFieldName}
        />
      ) : (
        <></>
      )}
      {image ? (
        <div className="flex space-x-8">
          {image ? (
            <div className="flex flex-col">
              <span className="text-sm font-light">Current</span>
              <div className="w-48 h-48 flex justify-center items-center hover:bg-accent">
                <img
                  className="max-w-full max-h-full contain-layout"
                  src={image.data}
                />
              </div>
            </div>
          ) : null}
          <div className="flex flex-col">
            <span className="text-sm font-light">Preview</span>
            <div className="w-48 h-48 flex justify-center items-center hover:bg-accent">
              <img
                className="max-w-full max-h-full contain-layout"
              />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
