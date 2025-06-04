import type { z } from "zod/v4";

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
    variant="outline"
    {...props}
    className={cn(
      "w-9 text-white border-border",
      type === "in"
        ? "bg-green-600 dark:bg-green-800"
        : type === "out"
        ? "bg-red-600 dark:bg-red-800"
        : type === "moved"
        ? "bg-yellow-600 dark:bg-yellow-800"
        : undefined,
      props.className
    )}
  >
    {props.children ?? type === "moved" ? "mov" : type}
  </Badge>
);
