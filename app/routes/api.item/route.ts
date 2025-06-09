import type { Route } from "./+types/route";

import { z } from "zod/v4";

import {
  createItem,
  createItemSchema,
  createItemType,
  createItemTypeSchema,
} from "~/actions/insert.server";
import { getItem, getItemByTagId, getItemByUid } from "~/actions/select.server";
import {
  updateItem,
  updateItemSchema,
  updateTag,
} from "~/actions/update.server";
import {
  coerceTimestamp,
  coerceFormData,
  parseWithDummy,
} from "~/actions/zod-utils";
import { MAX_IMAGE_FILE_SIZE, uploadImage } from "~/actions/image.server";

const PATHNAME = "/api/item";

export const loader = async ({ request }: Route.LoaderArgs) => {
  let relativeUrl: string = PATHNAME;
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
    console.error(`${relativeUrl}:loader\n`, err, "\n");
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
  let imageFile: File | null = null;
  let itemTypeName: string | null = null;
  let tagId: string | number | null = null;
  try {
    const reqContentType =
      request.headers.get("Content-Type") ??
      request.headers.get("content-type");
    if (reqContentType?.startsWith("multipart/form-data")) {
      const reqFormData = await request.formData();
      const {
        image,
        tagId: formTagId,
        itemTypeName: formItemTypeName,
        ...formData
      } = Object.fromEntries(reqFormData);

      const dummy: Record<string, unknown> = {};
      if (request.method === "PATCH") {
      }
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
      if (typeof formTagId === "string") {
        tagId = formTagId;
      }
      if (typeof formItemTypeName === "string") {
        itemTypeName = formItemTypeName;
        dummy.itemTypeId = 0;
      }

      const coercedFormData =
        request.method === "POST"
          ? coerceFormData(createItemSchema, {
              ...formData,
              expireAt: coerceTimestamp(formData.expireAt),
            })
          : coerceFormData(updateItemSchema, {
              ...formData,
              expireAt: coerceTimestamp(formData.expireAt),
            });
      payload =
        request.method === "POST"
          ? parseWithDummy(
              createItemSchema,
              {
                ...coercedFormData,
                isPresent: coercedFormData.isPresent ? true : false,
              },
              dummy
            )
          : parseWithDummy(
              updateItemSchema,
              {
                ...coercedFormData,
                isPresent: coercedFormData.isPresent ? true : false,
              },
              dummy
            );
    } else if (reqContentType?.startsWith("application/json")) {
      const {
        tagId: jsonTagId,
        itemTypeName: jsonItemTypeName,
        ...jsonData
      } = await request.json();

      const dummy: Record<string, unknown> = {};
      if (typeof jsonTagId === "string" || typeof jsonTagId === "number") {
        tagId = jsonTagId;
      }
      if (typeof jsonItemTypeName === "string") {
        itemTypeName = jsonItemTypeName;
        dummy.itemTypeId = 0;
      }

      payload =
        request.method === "POST"
          ? parseWithDummy(createItemSchema, jsonData, dummy)
          : parseWithDummy(updateItemSchema, jsonData, dummy);
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

  const image = await uploadImage(imageFile, { type: "item" });
  payload.imageId = image?.id ?? payload.imageId;
  if (imageFile != null && !payload.imageId) {
    return new Response("Invalid image file", { status: 400 });
  }

  if (itemTypeName != null) {
    const parsed = createItemTypeSchema.parse({ name: itemTypeName });
    const itemType = await createItemType(parsed);
    payload.itemTypeId = itemType.id;
  }

  try {
    switch (request.method) {
      case "POST": {
        const parsed = createItemSchema.parse(payload);
        const newItem = await createItem(parsed);

        if (tagId != null && tagId !== "" && newItem != null) {
          await updateTag({
            id: Number(tagId),
            itemId: newItem.id,
          });
        }

        return Response.json(newItem, {
          status: 201,
          headers: {
            "Content-Type": "application/json",
          },
        });
      }
      case "PATCH": {
        const parsed = updateItemSchema.parse(payload);
        const updatedItem = await updateItem(parsed);

        if (tagId != null && tagId !== "" && updatedItem != null) {
          await updateTag({
            id: Number(tagId),
            itemId: updatedItem.id,
          });
        }

        return Response.json(updatedItem, {
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
    if (err instanceof z.ZodError) {
      console.log("Should have caught this zod error earilier", err);
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
