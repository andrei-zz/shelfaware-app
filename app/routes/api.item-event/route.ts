import type { Route } from "./+types/route";

import { z } from "zod";
import {
  createItemEvent,
  createItemEventSchema,
} from "~/actions/insert.server";
import { getItemEvent } from "~/actions/select.server";

export const loader = async ({ request }: Route.LoaderArgs) => {
  let relativeUrl: string = "/api/item-event";
  let id: string | null;
  try {
    const url = new URL(request.url);
    relativeUrl = url.pathname + url.search;
    id = url.searchParams.get("id");
  } catch (err: unknown) {
    console.error(`${relativeUrl}\n`, err, "\n");
    return Response.json(
      { error: "Internal Server Error" },
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  if (!id) {
    return Response.json({ error: "Must provide id" }, { status: 400 });
  }

  try {
    const itemEvent = getItemEvent(Number(id));

    if (!itemEvent) {
      return Response.json({ error: "Item not found" }, { status: 404 });
    }

    return Response.json(itemEvent, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (err: unknown) {
    console.error(`${relativeUrl}\nGET:`, err, "\n");
    return Response.json(
      { error: "Internal Server Error" },
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};

export const action = async ({ request }: Route.ActionArgs) => {
  let relativeUrl: string = "/api/item-event";
  try {
    const url = new URL(request.url);
    relativeUrl = url.pathname + url.search;
  } catch (err: unknown) {
    console.error(`${relativeUrl}\nInvalid URL:`, err, "\n");
    return Response.json(
      { error: "Internal Server Error" },
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
    // console.log(`${relativeUrl}\nReceived payload:`, payload, "\n");
  } catch (err: unknown) {
    console.error(`${relativeUrl}\nJSON parse error:`, err, "\n");
    return Response.json(
      { error: "Bad Request" },
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  switch (request.method) {
    case "POST": {
      try {
        const parsed = createItemEventSchema.parse(payload);
        const newItem = await createItemEvent(parsed);
        return Response.json(newItem, {
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

        return Response.json(
          { error: "Internal Server Error" },
          {
            status: 500,
            headers: { "Content-Type": "application/json" },
          }
        );
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
