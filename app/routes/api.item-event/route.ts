import type { Route } from "./+types/route";

import { z } from "zod";
import {
  createItemAndTagByUid,
  createItemEvent,
  createItemEventSchema,
} from "~/actions/insert.server";
import { getItemByUid, getItemEvent } from "~/actions/select.server";

export const loader = async ({ request }: Route.LoaderArgs) => {
  let relativeUrl: string = "/api/item-event";
  let id: string | null;
  try {
    const url = new URL(request.url);
    relativeUrl = url.pathname + url.search;
    id = url.searchParams.get("id");
  } catch (err: unknown) {
    console.error(`${relativeUrl}\n`, err, "\n");
    return new Response("Internal Server Error", {
      status: 500,
    });
  }

  if (!id) {
    return new Response("Must provide id", { status: 400 });
  }

  try {
    const itemEvent = getItemEvent(Number(id));

    if (!itemEvent) {
      return new Response("Item not found", { status: 404 });
    }

    return Response.json(itemEvent, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (err: unknown) {
    console.error(`${relativeUrl}\nGET:`, err, "\n");
    return new Response("Internal Server Error", {
      status: 500,
    });
  }
};

export const action = async ({ request }: Route.ActionArgs) => {
  let relativeUrl: string = "/api/item-event";
  try {
    const url = new URL(request.url);
    relativeUrl = url.pathname + url.search;
  } catch (err: unknown) {
    console.error(`${relativeUrl}\nInvalid URL:`, err, "\n");
    return new Response("Internal Server Error", {
      status: 500,
    });
  }

  let payload: unknown;
  try {
    payload = await request.json();
    // console.log(`${relativeUrl}\nReceived payload:`, payload, "\n");
  } catch (err: unknown) {
    console.error(`${relativeUrl}\nJSON parse error:`, err, "\n");
    return new Response("Bad Request", {
      status: 400,
    });
  }

  switch (request.method) {
    case "POST": {
      try {
        const parsed = createItemEventSchema
          .extend({
            itemId: z.number().optional(),
          })
          .parse(payload);

        if (parsed.itemId == null && parsed.uid == null) {
          return new Response("Must provide itemId or uid", { status: 400 });
        }

        if (parsed.weight != null && parsed.weight < 0) {
          parsed.weight = null;
        }

        let itemId: number;
        if (parsed.itemId != null) {
          itemId = parsed.itemId;
        } else {
          const item = await getItemByUid(parsed.uid!);
          if (item != null) {
            itemId = item.id;
          } else {
            const { item: newItem } = await createItemAndTagByUid(parsed);
            itemId = newItem.id;
          }
        }

        const newItemEvent = await createItemEvent({ ...parsed, itemId });
        return Response.json(newItemEvent, {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
        });
      } catch (err: unknown) {
        console.error(`${relativeUrl}:POST\n`, err, "\n");

        if (err instanceof z.ZodError) {
          return Response.json(
            { error: "Bad Request", details: err.issues },
            {
              status: 400,
              headers: { "Content-Type": "application/json" },
            }
          );
        }

        return new Response("Internal Server Error", {
          status: 500,
        });
      }
    }
    default: {
      console.log(
        `${relativeUrl}\nBlocked unallowed methods: ${request.method}\n`
      );
      return new Response("Method Not Allowed", { status: 405 });
    }
  }
};
