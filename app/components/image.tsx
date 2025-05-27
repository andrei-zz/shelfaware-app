import { useState } from "react";
import { CircleX, ImageOff } from "lucide-react";

import { cn } from "~/lib/utils";

type ImageSize = "24" | "28" | "xs" | "sm" | "md-" | "md" | "lg";

const getSizeClassName = (size: ImageSize | null | undefined) => {
  switch (size) {
    case "24":
      return "size-24";
    case "28":
      return "size-28";
    case "xs":
      return "size-16 sm:size-24 md:size-32 lg:size-40";
    case "sm":
      return "size-20 sm:size-28 md:size-36 lg:size-44";
    case "md-":
      return "size-22 sm:size-30 md:size-38 lg:size-46";
    case "md":
      return "size-24 sm:size-32 md:size-40 lg:size-48";
    case "lg":
      return "size-32 sm:size-40 md:size-48 lg:size-56";
    default:
      return null;
  }
};

export const Image = ({
  size,
  containerProps,
  ...props
}: React.ComponentProps<"img"> & {
  size?: ImageSize;
  containerProps?: React.ComponentProps<"div">;
}) => {
  const [hasError, setHasError] = useState(false);

  return (
    <div
      {...containerProps}
      className={cn(
        "shrink-0 flex justify-center items-center",
        getSizeClassName(size),
        containerProps?.className
      )}
    >
      {props.src == null ? (
        <div className="min-h-full min-w-full bg-accent flex items-center justify-center">
          <ImageOff className="opacity-50" />
        </div>
      ) : hasError ? (
        <div className="min-h-full min-w-full bg-accent flex items-center justify-center">
          <CircleX className="opacity-50" />
        </div>
      ) : (
        <img
          {...props}
          onError={() => setHasError(true)}
          className={cn(
            "max-w-full max-h-full contain-layout",
            props.className
          )}
        />
      )}
    </div>
  );
};
