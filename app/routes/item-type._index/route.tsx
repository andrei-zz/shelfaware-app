import type { Route } from "./+types/route";

import { getItemTypes } from "~/actions/select.server";
import { ItemTypeItem } from "~/components/item-type-item";

import { Main } from "~/components/main";

export const meta = ({}: Route.MetaArgs) => {
  return [
    { title: "Item Types - ShelfAware" },
    // { name: "description", content: "ShelfAware" },
  ];
};

export const loader = async ({}: Route.LoaderArgs) => {
  const itemTypes = await getItemTypes();

  return { itemTypes };
};

const ItemTypesPage = ({ loaderData }: Route.ComponentProps) => {
  return (
    <Main>
      <div className="h-full w-full p-4 pb-16 relative flex flex-col gap-y-4 overflow-y-scroll scrollbar">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h2 className="mt-0 mb-0">Item Types</h2>
          </div>
        </div>
        {loaderData.itemTypes.length === 0
          ? "No types"
          : loaderData.itemTypes.map((itemType) => (
              <ItemTypeItem key={itemType.id} itemType={itemType} />
            ))}
      </div>
    </Main>
  );
};
export default ItemTypesPage;
