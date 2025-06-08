import type { Route } from "./+types/route";

import { loaderSchema } from "./zod-schema";

import { getItems } from "~/actions/select.server";
import { FridgeItem } from "~/components/fridge-item";
import { Main } from "~/components/main";

export const meta = ({}: Route.MetaArgs) => {
  return [
    { title: "Items - ShelfAware" },
    // { name: "description", content: "ShelfAware" },
  ];
};

// export function headers(_: Route.HeadersArgs) {
//   return {
//     "Cache-Control": "s-maxage=1, stale-while-revalidate=59",
//   };
// }

export const loader = async ({ request }: Route.LoaderArgs) => {
  const url = new URL(request.url);
  const raw: unknown = Object.fromEntries(url.searchParams);

  const items = await getItems();
  return { items };
};

export default ({ loaderData }: Route.ComponentProps) => {
  return (
    <Main>
      <div className="h-full w-full p-4 pb-16 relative flex flex-col gap-y-4 overflow-y-scroll scrollbar">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h2 className="mt-0 mb-0">Items</h2>
          </div>
        </div>
        {Array.isArray(loaderData.items) && loaderData.items.length > 0
          ? loaderData.items.map((item) => (
              <FridgeItem key={item.id} item={item} />
            ))
          : "Empty"}
      </div>
    </Main>
  );
};
