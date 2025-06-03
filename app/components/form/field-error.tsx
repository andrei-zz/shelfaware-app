import { cn } from "~/lib/utils";

export const FieldError = (props: React.ComponentProps<"p">) => (
  <em
    {...props}
    className={cn("my-0! text-destructive text-sm sm:text-xs", props.className)}
  />
);
