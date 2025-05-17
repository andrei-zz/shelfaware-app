import { Tag } from "lucide-react";
import { DateTime } from "luxon";
import { NavLink, useNavigate } from "react-router";
import type { getItem } from "~/actions/select.server";
import { cn } from "~/lib/utils";
import { CtxMenu } from "~/components/ctx-menu";
import { Image } from "./image";

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
      <NavLink
        to={`/item/${item.id}`}
        className={({ isPending }) =>
          cn(
            "p-2 flex items-center space-x-2 rounded hover:bg-accent border no-underline",
            isPending ? "opacity-60  pointer-events-none" : undefined
          )
        }
      >
        <Image
          src={
            item.image == null ? undefined : `/api/image?id=${item.image.id}`
          }
          size="24"
        />
        <div className="flex flex-col w-full grow">
          <span>{item.name}</span>
          <span className="text-sm font-light">{item.description}</span>
          {item.itemTypeId == null ? null : (
            <span className="text-sm font-light">Type: {item.itemTypeId}</span>
          )}
          {item.expireAt == null ? null : (
            <span className="text-sm font-light">
              Expiration date:{" "}
              {DateTime.fromMillis(item.expireAt).toLocaleString()}
            </span>
          )}
          {item.currentWeight == null ? null : (
            <span className="text-sm font-light">
              Weight: {item.currentWeight} g
            </span>
          )}
        </div>
        {item.tag == null ? null : (
          <div className="flex flex-col shrink-0 items-end">
            <span className="text-sm font-light">
              <Tag className="size-4 inline-block" /> {item.tag.name}
            </span>
            <span className="text-sm font-light">UID: {item.tag.uid}</span>
          </div>
        )}
      </NavLink>
    </CtxMenu>
  );
};
