import type { Route } from "./+types/route";

import { z } from "zod/v4";

import { uidSchema } from "~/database/schema";
import {
  createImage,
  createImageSchema,
  createItemAndTagByUid,
  createItemEvent,
  createItemEventSchema,
} from "~/actions/insert.server";
import { getItemByUid, getItemEvent } from "~/actions/select.server";
import { putS3Object } from "~/actions/s3.server";
import {
  makeApiSchema,
  parseFormPayload,
  parseJsonPayload,
} from "~/actions/zod-utils";
import { uploadImage } from "~/actions/image.server";

const PATHNAME = "/api/item-event";

const postSchema = makeApiSchema(
  createItemEventSchema
    .partial({ itemId: true })
    .extend({ uid: uidSchema.optional() })
).superRefine((data, ctx) => {
  if (data.itemId == null && data.uid == null) {
    ctx.addIssue({
      path: ["itemId"],
      message: "Either itemId or uid must be provided",
      code: z.ZodIssueCode.custom,
    });
    ctx.addIssue({
      path: ["uid"],
      message: "Either uid or itemId must be provided",
      code: z.ZodIssueCode.custom,
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
      if (image instanceof File) {
        imageFile = image;
      }

      const dummy: Record<string, unknown> = {};
      if (
        imageFile?.size != null &&
        imageFile.size > 0 &&
        imageFile.size <= 10 * 1024 * 1024
      ) {
        dummy.imageId = 0;
      }
      payload = parseFormPayload(formData, postSchema, dummy);
    } else if (reqContentType?.startsWith("application/json")) {
      const jsonData = await request.json();
      payload = parseJsonPayload(jsonData, postSchema);
    } else {
      return new Response("Invalid Content-Type", { status: 400 });
    }
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return Response.json(
        { message: "Bad Request", errors: err.flatten().fieldErrors },
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

  const image = await uploadImage(imageFile);
  payload.imageId = image?.id;

  if (imageFile != null && !payload.imageId) {
    return new Response("Invalid image file", { status: 400 });
  }

  try {
    switch (request.method) {
      case "POST": {
        const itemEventPayload = postSchema.parse(payload);

        let itemId: number;
        if (itemEventPayload.itemId != null) {
          itemId = itemEventPayload.itemId;
        } else {
          const item = await getItemByUid(itemEventPayload.uid!);
          if (item != null) {
            itemId = item.id;
          } else {
            const { item: newItem } = await createItemAndTagByUid({
              ...itemEventPayload,
              uid: itemEventPayload.uid!,
            });
            itemId = newItem.id;
          }
        }

        const parsed = createItemEventSchema.parse({
          ...itemEventPayload,
          itemId,
        });
        const newItemEvent = await createItemEvent(parsed);
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
        { message: "Bad Request", errors: err.flatten().fieldErrors },
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
