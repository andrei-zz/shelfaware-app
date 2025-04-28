import type { Route } from "./+types/route";

import { z } from "zod";
import { createInsertSchema } from "drizzle-zod";
import { items } from "~/database/schema";
import { createItem } from "~/actions/create.server";
import {
  getItemFromId,
  getItemFromTagId,
  getItemFromUid,
} from "~/actions/read.server";

const insertItemSchema = createInsertSchema(items)
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
    deletedAt: true,
  })
  .extend({
    expirationDate: z
      .union([z.date(), z.number()])
      .optional()
      .transform((val) => (typeof val === "number" ? new Date(val) : val)),
  });

export const loader = async ({ request }: Route.LoaderArgs) => {
  let relativeUrl: string;
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
    console.error("/api/test\nInvalid URL:", err, "\n");
    return Response.json(
      { error: "Internal Server Error" },
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  if (!id && !tagId && !uid) {
    return Response.json(
      { error: "Must provide id, tagId, or uid" },
      { status: 400 }
    );
  }

  let item = null;
  if (id) {
    item = await getItemFromId(Number(id));
  } else if (tagId) {
    item = await getItemFromTagId(Number(tagId));
  } else if (uid) {
    item = await getItemFromUid(uid);
  }

  if (!item) {
    return Response.json({ error: "Item not found" }, { status: 404 });
  }

  return Response.json(item);
};

export const action = async ({ request }: Route.ActionArgs) => {
  let relativeUrl: string;
  try {
    const url = new URL(request.url);
    relativeUrl = url.pathname + url.search;
  } catch (err: unknown) {
    console.error("/api/test\nInvalid URL:", err, "\n");
    return Response.json(
      { error: "Internal Server Error" },
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204 });
  }

  if (request.method !== "POST") {
    console.log(
      `${relativeUrl}\nBlocked non-POST request: ${request.method}\n`
    );
    return new Response("Method Not Allowed", { status: 405 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
    console.log(`${relativeUrl}\nReceived payload:`, payload, "\n");
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

  try {
    const parsed = insertItemSchema.parse(payload);
    const [newItem] = await createItem(parsed);
    return Response.json(newItem, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (err: unknown) {
    console.error(`${relativeUrl}\n`, err, "\n");

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
};
