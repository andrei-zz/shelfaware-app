import type { Route } from "./+types/route";

import { ZodError } from "zod/v4";

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
  makeApiSchema,
  parseFormPayload,
  parseJsonPayload,
} from "~/actions/zod-utils";
import { uploadImage } from "~/actions/image.server";

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

      if (image instanceof File) {
        imageFile = image;
      }
      if (typeof formTagId === "string") {
        tagId = formTagId;
      }
      if (typeof formItemTypeName === "string") {
        itemTypeName = formItemTypeName;
      }

      const dummy: Record<string, unknown> = {};
      if (
        imageFile?.size != null &&
        imageFile.size > 0 &&
        imageFile.size <= 10 * 1024 * 1024
      ) {
        dummy.imageId = 0;
      }
      if (itemTypeName != null) {
        dummy.itemTypeId = 0;
      }
      payload =
        request.method === "POST"
          ? parseFormPayload(formData, makeApiSchema(createItemSchema), dummy)
          : parseFormPayload(formData, makeApiSchema(updateItemSchema), dummy);
    } else if (reqContentType?.startsWith("application/json")) {
      const {
        tagId: jsonTagId,
        itemTypeName: jsonItemTypeName,
        ...jsonData
      } = await request.json();

      if (typeof jsonTagId === "string" || typeof jsonTagId === "number") {
        tagId = jsonTagId;
      }
      if (typeof jsonItemTypeName === "string") {
        itemTypeName = jsonItemTypeName;
      }

      const dummy: Record<string, unknown> = {};
      if (itemTypeName != null) {
        dummy.itemTypeId = 0;
      }
      payload =
        request.method === "POST"
          ? parseJsonPayload(jsonData, makeApiSchema(createItemSchema), dummy)
          : parseJsonPayload(jsonData, makeApiSchema(updateItemSchema), dummy);
    } else {
      return new Response("Invalid Content-Type", { status: 400 });
    }
  } catch (err: unknown) {
    if (err instanceof ZodError) {
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

  if (itemTypeName != null) {
    const parsed = createItemTypeSchema.parse({ name: itemTypeName });
    const itemType = await createItemType(parsed);
    payload.itemTypeId = itemType.id;
  }

  try {
    switch (request.method) {
      case "POST": {
        const parsed = makeApiSchema(createItemSchema).parse({
          ...payload,
          expireAt: coerceTimestamp(payload.exireAt),
        });
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
        const parsed = makeApiSchema(updateItemSchema).parse({
          ...payload,
          expireAt: coerceTimestamp(payload.exireAt),
        });
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
    if (err instanceof ZodError) {
      console.log("Should have caught this zod error earilier", err);
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
