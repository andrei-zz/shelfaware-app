import type { Route } from "./+types/route";

// import { redirect } from "react-router";

import { useEffect, useState } from "react";

import { type getItem, getItemEvents, getItems } from "~/actions/select.server";

import { Main } from "~/components/main";
import { InFridgeItem } from "~/components/in-fridge-item";
import { useSocket } from "~/sockets/client";
import type { createItemEvent } from "~/actions/insert.server";

function makePlateItems(items: Awaited<ReturnType<typeof getItems>>) {
  return fillGrid(
    items
      .filter((i) => i.plate != null && i.row != null && i.col != null)
      .sort((a, b) => {
        if (a.plate! < b.plate!) return -1;
        if (a.plate! > b.plate!) return 1;
        // plates are equal
        if (a.row! < b.row!) return -1;
        if (a.row! > b.row!) return 1;
        // rows are equal
        if (a.col! < b.col!) return -1;
        if (a.col! > b.col!) return 1;
        return 0;
      }),
    2
  );
}

function fillGrid(
  items: Array<Awaited<ReturnType<typeof getItems>>[number] | null>,
  numCols: number
): Array<Awaited<ReturnType<typeof getItems>>[number] | null> {
  // find the largest row index
  const maxRow = items.reduce((m, i) => Math.max(m, i?.row ?? Number.NaN), 0);

  const lookup = new Map<
    string,
    Awaited<ReturnType<typeof getItems>>[number] | null
  >();
  for (const it of items) {
    lookup.set(`${it?.row},${it?.col}`, it);
  }

  // walk row-by-row, col-by-col, pushing either item or null
  const result: (Awaited<ReturnType<typeof getItems>>[number] | null)[] = [];
  for (let r = 0; r <= maxRow; r++) {
    for (let c = 0; c < numCols; c++) {
      result.push(lookup.get(`${r},${c}`) ?? null);
    }
  }

  return result;
}

export const loader = async ({}: Route.LoaderArgs) => {
  const items = await getItems();
  // [eq(itemsTable.isPresent, true)]
  const itemEvents = await getItemEvents();
  return { items, itemEvents };
};

export default ({ loaderData }: Route.ComponentProps) => {
  const [localItems, setLocalItems] = useState<
    Array<Awaited<ReturnType<typeof getItems>>[number]>
  >(loaderData.items);
  const [plateItems, setPlateItems] = useState<
    Array<Awaited<ReturnType<typeof getItems>>[number] | null>
  >(makePlateItems(localItems));
  const socket = useSocket();

  useEffect(() => {
    setPlateItems(makePlateItems(localItems));
  }, [localItems]);

  useEffect(() => {
    if (!socket) {
      console.log("Socket not connected");
      return;
    }
    console.log("Socket connected?", socket.connected);

    // tell server where we left off
    socket.emit(
      "confirmation",
      loaderData.itemEvents[loaderData.itemEvents.length - 1].id
    );

    socket.on(
      "item-event",
      ({
        itemEvent,
        item,
      }: {
        itemEvent: Awaited<ReturnType<typeof createItemEvent>>;
        item?: Awaited<ReturnType<typeof getItem>> | null;
      }) => {
        console.log("got item-event", itemEvent, item);
        setLocalItems((prev) => {
          // 1) see if we already have this item
          const idx = prev.findIndex((it) => it.id === itemEvent.itemId);

          // 2) if found, replace that one; otherwise append
          if (idx !== -1) {
            return prev.map((it, i) =>
              i === idx
                ? {
                    ...it,
                    isPresent:
                      itemEvent.eventType === "in" ||
                      itemEvent.eventType === "moved",
                    currentWeight:
                      itemEvent.weight != null
                        ? itemEvent.weight
                        : it.currentWeight,
                    plate: itemEvent.plate,
                    row: itemEvent.row,
                    col: itemEvent.col,
                  }
                : it
            );
          } else {
            return [...prev, ...(item == null ? [] : [item])];
          }
        });
      }
    );

    // clean up on unmount
    return () => {
      socket.off("item-event");
    };
  }, [socket, loaderData.itemEvents]);

  return (
    <Main className="h-full w-full p-4 mb-16 relative flex flex-col gap-y-4 overflow-y-scroll scrollbar">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="mt-0 mb-0">Your Fridge</h2>
        </div>
      </div>
      <div className="h-full flex justify-between">
        <div className="w-full h-full grid grid-cols-2 auto-rows-auto items-stretch gap-2 grow">
          {plateItems.map((item, i) => (
            <InFridgeItem key={i} item={item} />
          ))}
        </div>
      </div>
    </Main>
  );
};

// export const loader = async () => redirect("/item");
