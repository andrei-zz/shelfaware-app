import { getTag, getTagByItemId, getTagByUid } from "~/actions/select.server";
import type { Route } from "./+types/route";
import { createTag, createTagSchema } from "~/actions/insert.server";
import { z } from "zod";
import { updateTag, updateTagSchema } from "~/actions/update.server";

export const loader = async ({ request }: Route.LoaderArgs) => {
  let relativeUrl: string = "/api/tag";
  let id: string | null;
  let itemId: string | null;
  let uid: string | null;
  try {
    const url = new URL(request.url);
    relativeUrl = url.pathname + url.search;
    id = url.searchParams.get("id");
    itemId = url.searchParams.get("itemId");
    uid = url.searchParams.get("uid");
  } catch (err: unknown) {
    console.error(`${relativeUrl}:GET\n`, err, "\n");
    return Response.json(
      { error: "Internal Server Error" },
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  if (!id && !itemId && !uid) {
    return Response.json(
      { error: "Must provide id, tagId, or uid" },
      { status: 400 }
    );
  }

  try {
    let item = null;
    if (id) {
      item = await getTag(Number(id));
    } else if (itemId) {
      item = await getTagByItemId(Number(itemId));
    } else if (uid) {
      item = await getTagByUid(uid);
    }

    if (!item) {
      return Response.json({ error: "Item not found" }, { status: 404 });
    }

    return Response.json(item, {
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
  let relativeUrl: string = "/api/tag";
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
        const parsed = createTagSchema.parse(payload);
        const newItem = await createTag(parsed);
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
    case "PATCH": {
      try {
        const parsed = updateTagSchema.parse(payload);
        const updatedItem = await updateTag(parsed);
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
