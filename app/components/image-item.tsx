import { NavLink, useNavigate } from "react-router";
import { DateTime } from "luxon";

import type { getImages } from "~/actions/select.server";

import { cn } from "~/lib/utils";
import { Image } from "~/components/image";
import { CtxMenu } from "~/components/ctx-menu";
import { useSidebar } from "./ui/sidebar";

export const ImageItem = ({
  image,
}: {
  image: Awaited<ReturnType<typeof getImages>>[0];
}) => {
  const navigate = useNavigate();

  const { isMobile, state } = useSidebar();

  return (
    <CtxMenu
      asChild
      features={["right-click", "long-press", "shift-enter"]}
      dropdownItems={[
        ...(image == null
          ? []
          : [
              {
                label: "Edit image",
                onSelect: () => navigate(`/image/${image.id}`),
              },
            ]),
      ]}
      dropdownMenuCheckboxItemProps={{ className: "w-40 px-2" }}
      className="no-underline w-full h-full flex flex-col items-center space-y-0"
    >
      <NavLink
        to={`/image/${image.id}`}
        className={({ isPending }) =>
          cn(
            "py-2 flex items-center rounded hover:bg-accent border no-underline",
            isPending ? "opacity-60  pointer-events-none" : undefined
          )
        }
      >
        <Image
          src={`/api/image?id=${image.id}`}
          containerProps={{
            className:
              !isMobile && state === "expanded"
                ? "size-32 sm:size-40 md:size-36 lg:size-44"
                : "size-32 sm:size-40 md:size-48 lg:size-56",
          }}
        />
        <div className="flex flex-col items-center px-2 text-center">
          <span>{`#${image.id}: ${image.title ?? "No title"}`}</span>
          <span className="text-sm font-light">
            {image.description ?? "No description"}
          </span>
          {image.updatedAt == null ? null : (
            <span className="text-sm font-light">
              {`Uploaded at: ${DateTime.fromMillis(
                image.updatedAt
              ).toLocaleString()}`}
            </span>
          )}
        </div>
      </NavLink>
    </CtxMenu>
  );
};
