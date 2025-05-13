/**
 * /api/item
 * GET: returns the item object along with type and tag objects.
 * - /api/item?id=1
 * - /api/item?tagId=1
 * - /api/item?uid=FFFFFF
 * POST: create new item, type and tag must be created beforehand.
 * - createItem
 * PATCH: update the item, some fields are not editable though.
 * - updateItem
 */

import type { Route } from "./+types/route";

import { z } from "zod";
import { createItem, createItemSchema } from "~/actions/insert.server";
import { getItem, getItemByTagId, getItemByUid } from "~/actions/select.server";
import { updateItem, updateItemSchema } from "~/actions/update.server";

export const loader = async ({ request }: Route.LoaderArgs) => {
  let relativeUrl: string = "/api/item";
  let id: string | null;
  let tagId: string | null;
  let uid: string | null;
  try {
    const url = new URL(request.url);
    relativeUrl = url.pathname + url.search;
    id = url.searchParams.get("id");
    tagId = url.searchParams.get("tagId");
    uid = url.searchParams.get("uid");
  } catch (err: unknown) {
    console.error(`${relativeUrl}:GET\n`, err, "\n");
    return new Response("Internal Server Error", { status: 500 });
  }

  if (!id && !tagId && !uid) {
    return new Response("Must provide id, tagId, or uid", { status: 400 });
  }

  try {
    let item = null;
    if (id) {
      item = await getItem(Number(id));
    } else if (tagId) {
      item = await getItemByTagId(Number(tagId));
    } else if (uid) {
      item = await getItemByUid(uid);
    }

    if (!item) {
      return new Response("Item not found", { status: 404 });
    }

    return Response.json(item, {
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
  let relativeUrl: string = "/api/item";
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
        const parsed = createItemSchema.parse(payload);
        const newItem = await createItem(parsed);
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

        return new Response("Internal Server Error", {
          status: 500,
        });
      }
    }
    case "PATCH": {
      try {
        const parsed = updateItemSchema.parse(payload);
        const updatedItem = await updateItem(parsed);
        return Response.json(updatedItem, {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
        });
      } catch (err: unknown) {
        console.error(`${relativeUrl}:PATCH\n`, err, "\n");

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
