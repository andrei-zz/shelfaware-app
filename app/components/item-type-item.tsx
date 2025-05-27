import { NavLink, useNavigate } from "react-router";
import { DateTime } from "luxon";

import type { getItemType } from "~/actions/select.server";

import { cn } from "~/lib/utils";
import { CtxMenu } from "~/components/ctx-menu";

export const ItemTypeItem = ({
  itemType,
}: {
  itemType: Awaited<ReturnType<typeof getItemType>>;
}) => {
  const navigate = useNavigate();

  return (
    <CtxMenu
      asChild
      features={["right-click", "long-press", "shift-enter"]}
      // dropdownItems={[]}
      dropdownMenuCheckboxItemProps={{ className: "w-40 px-2" }}
      className="p-2 no-underline"
    >
      <NavLink
        to={`/item-type/${itemType.id}`}
        className={({ isPending }) =>
          cn(
            "p-2 flex items-center gap-x-2 rounded hover:bg-accent border no-underline",
            isPending ? "opacity-60  pointer-events-none" : undefined
          )
        }
      >
        <div className="w-full flex flex-col sm:flex-row items-start sm:items-center gap-x-0 gap-y-2 sm:gap-x-2 sm:gap-y-0">
          <div className="flex flex-col w-full grow">
            <span>{itemType.name}</span>
            <span className="text-sm font-light">
              {itemType.description ?? "No description"}
            </span>
            {itemType.updatedAt == null ? null : (
              <span className="text-sm font-light">
                {`Updated at: ${DateTime.fromMillis(
                  itemType.updatedAt
                ).toLocaleString()}`}
              </span>
            )}
          </div>
        </div>
      </NavLink>
    </CtxMenu>
  );
};
