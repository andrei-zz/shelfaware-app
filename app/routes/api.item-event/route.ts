import type { Route } from "./+types/route";

import { z } from "zod/v4";

import {
  createItemAndTagByUid,
  createItemEvent,
  createItemEventSchema,
} from "~/actions/insert.server";
import { getItem, getItemByUid, getItemEvent } from "~/actions/select.server";
import { coerceFormData, parseWithDummy, uidSchema } from "~/actions/zod-utils";
import { MAX_IMAGE_FILE_SIZE, uploadImage } from "~/actions/image.server";

const PATHNAME = "/api/item-event";

const postSchema = createItemEventSchema
  .partial({ itemId: true })
  .extend({ uid: uidSchema.optional() })
  .check((ctx) => {
    if (ctx.value.itemId == null && ctx.value.uid == null) {
      ctx.issues.push({
        input: ctx.value.itemId,
        code: "custom",
        message: "Either itemId or uid must be provided",
      });
      ctx.issues.push({
        input: ctx.value.uid,
        code: "custom",
        message: "Either uid or itemId must be provided",
      });
    }
  });

export const loader = async ({ request }: Route.LoaderArgs) => {
  let relativeUrl: string = PATHNAME;
  let id: string | null;
  try {
    const url = new URL(request.url);
    relativeUrl = url.pathname + url.search;
    id = url.searchParams.get("id");
  } catch (err: unknown) {
    console.error(`${relativeUrl}:loader\n`, err, "\n");
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
    console.error(`${relativeUrl}:loader\n`, err, "\n");
    return new Response("Internal Server Error", {
      status: 500,
    });
  }
};

export const action = async ({ request, context }: Route.ActionArgs) => {
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

  if (request.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  let payload: Record<string, unknown> = {};
  let imageFile: File | null = null;
  try {
    const reqContentType =
      request.headers.get("Content-Type") ??
      request.headers.get("content-type");
    if (reqContentType?.startsWith("multipart/form-data")) {
      const reqFormData = await request.formData();
      const { image, ...formData } = Object.fromEntries(reqFormData);

      const dummy: Record<string, unknown> = {};
      if (image instanceof File) {
        imageFile = image;
        if (
          image.size != null &&
          image.size > 0 &&
          image.size <= MAX_IMAGE_FILE_SIZE
        ) {
          dummy.imageId = 0;
        }
      }

      const coercedFormData = coerceFormData(postSchema, formData);
      payload = parseWithDummy(postSchema, coercedFormData, dummy);
    } else if (reqContentType?.startsWith("application/json")) {
      const jsonData = await request.json();
      payload = parseWithDummy(postSchema, jsonData);
    } else {
      return new Response("Invalid Content-Type", { status: 400 });
    }
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return Response.json(
        { message: "Bad Request", errors: z.flattenError(err).fieldErrors },
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    console.error(`${relativeUrl}:action\n`, err, "\n");
    return new Response("Internal Server Error", {
      status: 500,
    });
  }

  const image = await uploadImage(imageFile, { type: "item_event" });
  payload.imageId = image?.id ?? payload.imageId;
  if (imageFile != null && !payload.imageId) {
    return new Response("Invalid image file", { status: 400 });
  }

  try {
    switch (request.method) {
      case "POST": {
        const itemEventPayload = postSchema.parse(payload);

        let itemId: number;
        let newItem: Awaited<ReturnType<typeof getItem>> | null = null;
        if (itemEventPayload.itemId != null) {
          itemId = itemEventPayload.itemId;
        } else {
          const item = await getItemByUid(itemEventPayload.uid!);
          if (item != null) {
            itemId = item.id;
          } else {
            const { item: createdItem } = await createItemAndTagByUid({
              ...itemEventPayload,
              uid: itemEventPayload.uid!,
            });
            itemId = createdItem.id;
            newItem = await getItem(itemId);
          }
        }

        const parsed = createItemEventSchema.parse({
          ...itemEventPayload,
          itemId,
        });
        const newItemEvent = await createItemEvent(parsed);

        const io = context.io;
        if (!io) {
          console.log("serverIO is uninitialized");
        }

        io?.emit("item-event", {
          itemEvent: newItemEvent,
          item: newItem,
        });

        return Response.json(newItemEvent, {
          status: 201,
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
    if (err instanceof z.ZodError) {
      return Response.json(
        { message: "Bad Request", errors: z.flattenError(err).fieldErrors },
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    console.error(`${relativeUrl}:action\n`, err, "\n");
    return new Response("Internal Server Error", {
      status: 500,
    });
  }
};
