import { useNavigate } from "react-router";
import { DateTime } from "luxon";
import { BadgeCheck, BadgeX, Tag } from "lucide-react";

import type { getItem } from "~/actions/select.server";

import { CtxMenu } from "~/components/ctx-menu";
import { Image } from "~/components/image";
import { Badge } from "~/components/ui/badge";
import { Button } from "./ui/button";

export const InFridgeItem = ({
  item,
}: {
  item: Awaited<ReturnType<typeof getItem>> | null | undefined;
}) => {
  const navigate = useNavigate();

  if (item == null) {
    return (
      <Button
        variant="outline"
        className="h-full p-2 flex flex-col justify-center items-center gap-x-2 rounded hover:bg-accent border no-underline text-foreground/50"
        // className={({ isPending }) =>
        //   cn(
        //     "p-2 flex items-center gap-x-2 rounded hover:bg-accent border no-underline",
        //     isPending ? "opacity-60  pointer-events-none" : undefined
        //   )
        // }
      >
        No item
      </Button>
    );
  }

  return (
    <CtxMenu
      asChild
      features={["right-click", "long-press", "shift-enter"]}
      dropdownItems={[
        ...(item == null
          ? []
          : [
              {
                label: "Edit item",
                onSelect: () => navigate(`/item/${item.id}`),
              },
            ]),
        ...(item.tag?.id == null
          ? []
          : [
              {
                label: "Edit tag",
                onSelect: () => navigate(`/tag/${item.tag?.id}`),
              },
            ]),
        ...(item.image?.id == null
          ? []
          : [
              {
                label: "Edit image",
                onSelect: () => navigate(`/image/${item.image?.id}`),
              },
            ]),
      ]}
      dropdownMenuCheckboxItemProps={{ className: "w-40 px-2" }}
      className="p-2 no-underline"
    >
      <Button
        variant="outline"
        className="h-full p-2 flex flex-col items-center gap-x-2 rounded hover:bg-accent border no-underline"
        // className={({ isPending }) =>
        //   cn(
        //     "p-2 flex items-center gap-x-2 rounded hover:bg-accent border no-underline",
        //     isPending ? "opacity-60  pointer-events-none" : undefined
        //   )
        // }
      >
        <Image
          src={
            item.image == null ? undefined : `/api/image?id=${item.image.id}`
          }
          size="24"
        />
        <div className="flex flex-col space-y-2 w-full whitespace-pre">
          {item.type?.name != null ? (
            <Badge variant="outline" className="inline self-center">
              {item.type.name}
            </Badge>
          ) : null}
          <span className="whitespace-pre-wrap">{item.name}</span>
          <div className="flex flex-col w-full">
            {item.currentWeight == null ? null : (
              <span className="text-sm font-light">
                Weight: {item.currentWeight} g
              </span>
            )}
          </div>
        </div>
      </Button>
    </CtxMenu>
  );
};
