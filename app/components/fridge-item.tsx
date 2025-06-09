import { Link, useNavigate } from "react-router";
import { DateTime } from "luxon";
import { Tag } from "lucide-react";

import type { getItem } from "~/actions/select.server";

import { CtxMenu } from "~/components/ctx-menu";
import { Image } from "~/components/image";
import { Badge } from "~/components/ui/badge";

export const FridgeItem = ({
  item,
}: {
  item: Awaited<ReturnType<typeof getItem>>;
}) => {
  const navigate = useNavigate();

  if (item == null) {
    return null;
  }

  return (
    <CtxMenu
      asChild
      features={["right-click", "long-press", "shift-enter"]}
      dropdownItems={[
        ...(item.tag == null
          ? []
          : [
              {
                label: "Edit tag",
                onSelect: () => navigate(`/tag/${item.tag?.id}`),
              },
            ]),
        ...(item.image == null
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
      <Link
        to={`/item/${item.id}`}
        className="p-2 flex items-center gap-x-2 rounded hover:bg-accent border no-underline"
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
        <div className="w-full flex flex-col sm:flex-row items-start sm:items-center gap-x-0 gap-y-2 sm:gap-x-2 sm:gap-y-0">
          <div className="flex flex-col w-full grow">
            <div className="flex gap-x-2 items-center">
              <span>{item.name}</span>
              {item.type?.name != null ? (
                <Badge variant="outline">{item.type.name}</Badge>
              ) : null}
            </div>
            <span className="text-sm font-light">{item.description}</span>
            {item.expireAt == null ? null : (
              <span className="text-sm font-light">
                {`Expire at: ${DateTime.fromMillis(
                  item.expireAt
                ).toLocaleString()}`}
              </span>
            )}
            {item.currentWeight == null ? null : (
              <span className="text-sm font-light">
                Weight: {item.currentWeight} g
              </span>
            )}
          </div>
          {item.tag == null ? null : (
            <div className="flex flex-col shrink-0 items-start sm:items-end">
              <span className="text-sm font-light">
                <Tag className="size-4 inline-block" /> {item.tag.name}
              </span>
              <span className="text-sm font-light">UID: {item.tag.uid}</span>
            </div>
          )}
        </div>
      </Link>
    </CtxMenu>
  );
};
