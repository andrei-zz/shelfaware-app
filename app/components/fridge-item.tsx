import { Tag } from "lucide-react";
import { DateTime } from "luxon";
import { NavLink, useNavigate } from "react-router";
import type { getItem } from "~/actions/select.server";
import { cn } from "~/lib/utils";
import { CtxMenu } from "./ctx-menu";

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
      ]}
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
        <div className="w-24 h-24 flex justify-center items-center shrink-0">
          {item.image ? (
            <img
              className="max-w-full max-h-full contain-layout"
              src={item.image.data}
            />
          ) : (
            <div className="h-full w-full bg-transparent" />
          )}
        </div>
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
