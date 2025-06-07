import type { Route } from "./+types/route";

import { getItemEvents } from "~/actions/select.server";

import { Main } from "~/components/main";
import { ItemEventItem } from "~/components/item-event-item";

export const meta = ({}: Route.MetaArgs) => {
  return [
    { title: "Item Events - ShelfAware" },
    // { name: "description", content: "ShelfAware" },
  ];
};

export const loader = async ({}: Route.LoaderArgs) => {
  const itemEvents = await getItemEvents();
  return { itemEvents };
};

export default ({ loaderData }: Route.ComponentProps) => {
  return (
    <Main>
      <div className="h-full w-full p-4 pb-16 flex flex-col gap-y-4 overflow-y-scroll scrollbar">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h2 className="mt-0 mb-0">Item Events</h2>
          </div>
        </div>
        {loaderData.itemEvents.length === 0
          ? "No events"
          : loaderData.itemEvents.map((itemEvent) => (
              <ItemEventItem key={itemEvent.id} itemEvent={itemEvent} />
            ))}
      </div>
    </Main>
  );
};
