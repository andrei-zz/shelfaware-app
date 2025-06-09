import { Link, useNavigate } from "react-router";
import { DateTime } from "luxon";
import { Paperclip } from "lucide-react";

import type { getTags } from "~/actions/select.server";

import { CtxMenu } from "~/components/ctx-menu";

export const TagItem = ({
  tag,
}: {
  tag: Awaited<ReturnType<typeof getTags>>[number];
}) => {
  const navigate = useNavigate();

  if (tag == null) {
    return null;
  }

  return (
    <CtxMenu
      asChild
      features={["right-click", "long-press", "shift-enter"]}
      dropdownItems={[
        ...(tag.item == null
          ? []
          : [
              {
                label: "Edit item",
                onSelect: () => navigate(`/item/${tag.item?.id}`),
              },
            ]),
      ]}
      dropdownMenuCheckboxItemProps={{ className: "w-40 px-2" }}
      className="p-2 no-underline"
    >
      <Link
        to={`/tag/${tag.id}`}
        className="p-2 flex items-center space-x-2 rounded hover:bg-accent border no-underline"
        // className={({ isPending }) =>
        //   cn(
        //     "p-2 flex items-center space-x-2 rounded hover:bg-accent border no-underline",
        //     isPending ? "opacity-60  pointer-events-none" : undefined
        //   )
        // }
      >
        <div className="flex flex-col w-full grow">
          <span>{tag.name}</span>
          <span className="text-sm font-light">UID: {tag.uid}</span>
          {tag.createdAt == null ? null : (
            <span className="text-sm font-light">
              Created at: {DateTime.fromMillis(tag.createdAt).toLocaleString()}
            </span>
          )}
        </div>
        {tag.item == null ? null : (
          <div className="flex flex-col shrink-0 items-end">
            <span className="text-sm font-light">
              <Paperclip className="size-4 inline-block" /> {tag.item.name}
            </span>
            {tag.item.currentWeight == null ? null : (
              <span className="text-sm font-light">
                Weight: {tag.item.currentWeight} g
              </span>
            )}
            {tag.attachedAt == null ? null : (
              <span className="text-sm font-light">
                Attached at:{" "}
                {DateTime.fromMillis(tag.attachedAt).toLocaleString()}
              </span>
            )}
          </div>
        )}
      </Link>
    </CtxMenu>
  );
};
