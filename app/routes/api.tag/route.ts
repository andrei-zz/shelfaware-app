import type { Route } from "./+types/route";

import { z } from "zod/v4";

import { createTag, createTagSchema } from "~/actions/insert.server";
import { getTag, getTagByItemId, getTagByUid } from "~/actions/select.server";
import { updateTag, updateTagSchema } from "~/actions/update.server";
import { coerceFormData } from "~/actions/zod-utils";

const PATHNAME = "/api/tag";

const patchSchema = updateTagSchema.check((ctx) => {
  if (ctx.value.id == null && ctx.value.uid == null) {
    ctx.issues.push({
      input: ctx.value.id,
      code: "custom",
      message: "Either id or uid must be provided",
    });
    ctx.issues.push({
      input: ctx.value.uid,
      code: "custom",
      message: "Either uid or id must be provided",
    });
  }
});

export const loader = async ({ request }: Route.LoaderArgs) => {
  let relativeUrl: string = PATHNAME;
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
    return new Response("Internal Server Error", {
      status: 500,
    });
  }

  if (!id && !itemId && !uid) {
    return new Response("Must provide id, tagId, or uid", { status: 400 });
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
      return new Response("Item not found", { status: 404 });
    }

    return Response.json(item, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (err: unknown) {
    console.error(`${relativeUrl}:action\n`, err, "\n");
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
      const formData = Object.fromEntries(reqFormData);
      payload =
        request.method === "POST"
          ? coerceFormData(createTagSchema, {
              ...formData,
              uid:
                typeof formData.uid === "string"
                  ? formData.uid.replace(/\s+/g, "").toLowerCase()
                  : formData.uid,
            })
          : coerceFormData(patchSchema, {
              ...formData,
              uid:
                typeof formData.uid === "string"
                  ? formData.uid.replace(/\s+/g, "").toLowerCase()
                  : formData.uid,
            });
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
        const parsed = createTagSchema.parse(payload);
        const newTag = await createTag(parsed);
        return Response.json(newTag, {
          status: 201,
          headers: {
            "Content-Type": "application/json",
          },
        });
      }
      case "PATCH": {
        const parsed = patchSchema.parse(payload);
        const updatedTag = await updateTag(parsed);
        return Response.json(updatedTag, {
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
        { message: "Bad Request", errors: z.flattenError(err).fieldErrors },
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
