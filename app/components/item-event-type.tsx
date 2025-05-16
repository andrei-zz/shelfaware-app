import type { z } from "zod";
import type { createItemEventSchema } from "~/actions/insert.server";
import { cn } from "~/lib/utils";
import { Badge } from "~/components/ui/badge";

export const ItemEventType = ({
  type,
  ...props
}: React.ComponentProps<typeof Badge> & {
  type: z.infer<typeof createItemEventSchema>["eventType"];
}) => (
  <Badge
    {...props}
    className={cn(
      "w-9",
      type === "in"
        ? "bg-green-700"
        : type === "out"
        ? "bg-red-700"
        : type === "moved"
        ? "bg-yellow-700"
        : undefined,
      props.className
    )}
  >
    {props.children ?? type === "moved" ? "mov" : type}
  </Badge>
);
