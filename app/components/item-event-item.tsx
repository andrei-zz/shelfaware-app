import { Link, useNavigate } from "react-router";
import { DateTime } from "luxon";
import { Tag } from "lucide-react";

import type { getItemEvent } from "~/actions/select.server";

import { CtxMenu } from "~/components/ctx-menu";
import { ItemEventType } from "~/components/item-event-type";
import { Image } from "~/components/image";

export const ItemEventItem = ({
  itemEvent,
}: {
  itemEvent: Awaited<ReturnType<typeof getItemEvent>>;
}) => {
  const navigate = useNavigate();

  if (itemEvent == null) {
    return null;
  }

  return (
    <CtxMenu
      asChild
      features={["right-click", "long-press", "shift-enter"]}
      dropdownItems={[
        ...(itemEvent.item == null
          ? []
          : [
              {
                label: "Edit item",
                onSelect: () => navigate(`/item/${itemEvent.item.id}`),
              },
            ]),
        ...(itemEvent.item?.tag == null
          ? []
          : [
              {
                label: "Edit tag",
                onSelect: () => navigate(`/tag/${itemEvent.item.tag?.id}`),
              },
            ]),
        ...(itemEvent?.image == null
          ? []
          : [
              {
                label: "Edit image",
                onSelect: () => navigate(`/image/${itemEvent.image?.id}`),
              },
            ]),
      ]}
      dropdownMenuCheckboxItemProps={{ className: "w-40 px-2" }}
      className="p-2 no-underline"
    >
      <Link
        to={`/item/${itemEvent.item.id}`}
        className="p-2 flex items-center space-x-2 rounded hover:bg-accent border no-underline"
        // className={({ isPending }) =>
        //   cn(
        //     "p-2 flex items-center space-x-2 rounded hover:bg-accent border no-underline",
        //     isPending ? "opacity-60  pointer-events-none" : undefined
        //   )
        // }
      >
        <Image
          src={
            itemEvent.image != null
              ? `/api/image?id=${itemEvent.image.id}`
              : itemEvent.item.image != null
              ? `/api/image?id=${itemEvent.item.image.id}`
              : undefined
          }
          size="24"
        />
        <div className="flex flex-col w-full grow">
          <span className="flex items-center gap-x-2">
            <ItemEventType type={itemEvent.eventType} />
            {itemEvent.item.name}
          </span>
          <span className="text-sm font-light">Event ID: {itemEvent.id}</span>
          {itemEvent.weight == null ? null : (
            <span className="text-sm font-light">
              Weight: {itemEvent.weight} g
            </span>
          )}
          <span className="text-sm font-light">
            {DateTime.fromMillis(itemEvent.timestamp).toLocaleString({
              ...DateTime.DATETIME_SHORT,
              weekday: "short",
              second: "2-digit",
            })}
          </span>
        </div>
        {itemEvent.item.tag == null ? null : (
          <div className="flex flex-col shrink-0 items-end">
            <span className="text-sm font-light">
              <Tag className="size-4 inline-block" /> {itemEvent.item.tag.name}
            </span>
            <span className="text-sm font-light">
              UID: {itemEvent.item.tag.uid}
            </span>
          </div>
        )}
      </Link>
    </CtxMenu>
  );
};
