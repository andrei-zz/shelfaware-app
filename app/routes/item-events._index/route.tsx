import { getItemEvents } from "~/actions/select.server";
import type { Route } from "./+types/route";
import { CreateButton } from "~/components/create-button";
import { ItemEventItem } from "~/components/item-event-item";

export const loader = async ({}: Route.LoaderArgs) => {
  const itemEvents = await getItemEvents();
  return { itemEvents };
};

const ItemEventsPage = ({ loaderData }: Route.ComponentProps) => {
  return (
    <main className="min-w-full max-h-[calc(100dvh-3rem)] p-4 flex flex-col space-y-4 prose prose-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="mt-0 mb-0">Item events</h2>
        </div>
        <CreateButton />
      </div>
      <div className="h-full p-1 flex flex-col space-y-2 overflow-y-scroll scrollbar">
        {loaderData.itemEvents.length === 0
          ? "No events"
          : loaderData.itemEvents.map((itemEvent) => (
              <ItemEventItem key={itemEvent.id} itemEvent={itemEvent} />
            ))}
      </div>
    </main>
  );
};
export default ItemEventsPage;
