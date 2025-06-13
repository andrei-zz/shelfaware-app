import { Link } from "react-router";
import { DateTime } from "luxon";

import type { getApiKeysByUserId } from "~/actions/select.server";

import { CtxMenu } from "~/components/ctx-menu";

export const ApiKeyItem = ({
  apiKey,
}: {
  apiKey: Awaited<ReturnType<typeof getApiKeysByUserId>>[number];
}) => {
  if (apiKey == null) {
    return null;
  }

  return (
    <CtxMenu
      asChild
      features={["right-click", "long-press", "shift-enter"]}
      dropdownItems={[]}
      dropdownMenuCheckboxItemProps={{ className: "w-40 px-2" }}
      className="p-2 no-underline"
    >
      <Link
        to={`/api-keys/${apiKey.id}`}
        className="p-2 flex items-center gap-x-2 rounded hover:bg-accent border no-underline"
        // className={({ isPending }) =>
        //   cn(
        //     "p-2 flex items-center gap-x-2 rounded hover:bg-accent border no-underline",
        //     isPending ? "opacity-60  pointer-events-none" : undefined
        //   )
        // }
      >
        <div className="w-full flex flex-col sm:flex-row items-start sm:items-center gap-x-0 gap-y-2 sm:gap-x-2 sm:gap-y-0">
          <div className="flex flex-col space-y-2 w-full grow">
            <div className="inline align-middle leading-6">
              <span>{apiKey.name}</span>
            </div>
            <div className="flex flex-col w-full">
              <span className="text-sm font-light">
                {`Creation date: ${DateTime.fromMillis(
                  apiKey.createdAt
                ).toLocaleString()}`}
              </span>
              {apiKey.updatedAt === apiKey.createdAt ? null : (
                <span className="text-sm font-light">
                  {`Last update: ${DateTime.fromMillis(
                    apiKey.updatedAt
                  ).toLocaleString()}`}
                </span>
              )}
              {apiKey.expireAt == null ? null : (
                <span className="text-sm font-light">
                  {`Expiration date: ${DateTime.fromMillis(
                    apiKey.updatedAt
                  ).toLocaleString()}`}
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </CtxMenu>
  );
};
