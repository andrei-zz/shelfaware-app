import type { Route } from "./+types/route";

import { getPresentItems } from "~/actions/select.server";
import { FridgeItem } from "~/components/fridge-item";
import { CreateButton } from "~/components/create-button";

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
  const items = await getPresentItems();
  return { items };
};

const ItemsPage = ({ loaderData }: Route.ComponentProps) => {
  return (
    <main className="min-w-full max-h-[calc(100dvh-3rem)] p-4 flex flex-col space-y-4 prose prose-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="mt-0 mb-0">Your Fridge</h2>
        </div>
        <CreateButton />
      </div>
      <div className="h-full p-1 flex flex-col space-y-2 overflow-y-scroll scrollbar">
        {loaderData.items.length === 0
          ? "Empty"
          : loaderData.items.map((item) => (
              <FridgeItem key={item.id} item={item} />
            ))}
      </div>
    </main>
  );
};
export default ItemsPage;
