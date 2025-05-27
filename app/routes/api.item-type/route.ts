import type { Route } from "./+types/route";

import { z } from "zod";

import { createItemType, createItemTypeSchema } from "~/actions/insert.server";
import { getItemType, getItemTypeByName } from "~/actions/select.server";
import { updateItemType, updateItemTypeSchema } from "~/actions/update.server";
import { makeApiSchema } from "~/actions/zod-utils";

const PATHNAME = "/api/item-type";

export const loader = async ({ request }: Route.LoaderArgs) => {
  let relativeUrl: string = PATHNAME;
  let id: string | null;
  let name: string | null;
  try {
    const url = new URL(request.url);
    relativeUrl = url.pathname + url.search;
    id = url.searchParams.get("id");
    name = url.searchParams.get("name");
  } catch (err: unknown) {
    console.error(`${relativeUrl}:loader\n`, err, "\n");
    return new Response("Internal Server Error", { status: 500 });
  }

  if (!id && !name) {
    return new Response("Must provide id, tagId, or uid", { status: 400 });
  }

  try {
    let itemType = null;
    if (id) {
      itemType = await getItemType(Number(id));
    } else if (name) {
      itemType = await getItemTypeByName(name);
    }

    if (!itemType) {
      return new Response("Item type not found", { status: 404 });
    }

    return Response.json(itemType, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (err: unknown) {
    console.error(`${relativeUrl}:loader\n`, err, "\n");
    return new Response("Internal Server Error", {
      status: 500,
    });
  }
};

export const action = async ({ request }: Route.ActionArgs) => {
  let relativeUrl: string = PATHNAME;
  try {
    const url = new URL(request.url);
    relativeUrl = url.pathname + url.search;
  } catch (err: unknown) {
    console.error(`${relativeUrl}:action\n`, err, "\n");
    return new Response("Internal Server Error", {
      status: 500,
    });
  }

  if (request.method !== "POST" && request.method !== "PATCH") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  let payload: Record<string, unknown> = {};
  try {
    const reqContentType =
      request.headers.get("Content-Type") ??
      request.headers.get("content-type");
    if (reqContentType?.startsWith("multipart/form-data")) {
      const reqFormData = await request.formData();
      payload = Object.fromEntries(reqFormData);
    } else if (reqContentType?.startsWith("application/json")) {
      payload = await request.json();
    } else {
      return new Response("Invalid Content-Type", { status: 400 });
    }
  } catch (err: unknown) {
    console.error(`${relativeUrl}:action\n`, err, "\n");
    return new Response("Internal Server Error", {
      status: 500,
    });
  }

  try {
    switch (request.method) {
      case "POST": {
        const parsed = makeApiSchema(createItemTypeSchema).parse(payload);
        const newItemType = await createItemType(parsed);

        return Response.json(newItemType, {
          status: 201,
          headers: {
            "Content-Type": "application/json",
          },
        });
      }
      case "PATCH": {
        const parsed = makeApiSchema(updateItemTypeSchema).parse(payload);
        const updatedItemType = await updateItemType(parsed);

        return Response.json(updatedItemType, {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
        });
      }
      default: {
        console.log(
          `${relativeUrl}\nBlocked unallowed methods: ${request.method}\n`
        );
        return new Response("Method Not Allowed", { status: 405 });
      }
    }
  } catch (err: unknown) {
    console.error(`${relativeUrl}:action\n`, err, "\n");

    if (err instanceof z.ZodError) {
      return Response.json(
        { message: "Bad Request", errors: err.flatten().fieldErrors },
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
};
