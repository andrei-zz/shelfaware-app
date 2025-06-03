import type { Route } from "./+types/route";

import { redirect } from "react-router";
import { z } from "zod";

import { createImage, createImageSchema } from "~/actions/insert.server";
import { getImageWithS3Key } from "~/actions/select.server";
import {
  replaceImage,
  replaceImageSchema,
  updateImage,
  updateImageSchema,
} from "~/actions/update.server";
import { getSignedS3Url, putS3Object } from "~/actions/s3.server";
import {
  makeApiSchema,
  parseFormPayload,
  parseJsonPayload,
} from "~/actions/zod-utils";
import { MAX_IMAGE_FILE_SIZE, uploadImage } from "~/actions/image.server";

const PATHNAME = "/api/image";

export const loader = async ({ request }: Route.LoaderArgs) => {
  let relativeUrl: string = PATHNAME;
  let id: string | null;
  try {
    const url = new URL(request.url);
    relativeUrl = url.pathname + url.search;
    id = url.searchParams.get("id");
  } catch (err: unknown) {
    console.error(`${relativeUrl}:loader\n`, err, "\n");
    return new Response("Internal Server Error", { status: 500 });
  }

  if (!id) {
    return new Response("Missing id", { status: 400 });
  }

  try {
    const image = await getImageWithS3Key(Number(id));
    if (!image) {
      return new Response("Image not found", { status: 404 });
    }

    const signedUrl = await getSignedS3Url(image.s3Key);
    return redirect(signedUrl, { status: 302 });
  } catch (err: unknown) {
    console.error(`${relativeUrl}:loader\n`, err, "\n");
    return new Response("Internal Server Error", { status: 500 });
  }
};

export const action = async ({ request }: Route.ActionArgs) => {
  let relativeUrl: string = PATHNAME;
  try {
    const url = new URL(request.url);
    relativeUrl = url.pathname + url.search;
  } catch (err: unknown) {
    console.error(`${relativeUrl}:action\n`, err, "\n");
    return new Response("Internal Server Error", { status: 500 });
  }

  if (request.method !== "POST" && request.method !== "PATCH") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  let payload: Record<string, FormDataEntryValue> = {};
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
        if (request.method === "PATCH") {
          dummy.id = 0;
        }
        dummy.s3Key = crypto.randomUUID();
        dummy.mimeType = "image/gif";
      }
      payload =
        request.method === "POST"
          ? parseFormPayload(formData, makeApiSchema(createImageSchema), dummy)
          : parseFormPayload(
              formData,
              makeApiSchema(replaceImageSchema),
              dummy
            );
    } else if (reqContentType?.startsWith("application/json")) {
      if (request.method === "POST") {
        return new Response("Invalid Content-Type", { status: 400 });
      }

      const jsonData = await request.json();
      payload = parseJsonPayload(jsonData, makeApiSchema(replaceImageSchema));
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

  try {
    switch (request.method) {
      case "POST": {
        const newImage = await uploadImage(imageFile, payload);
        if (newImage == null) {
          return new Response("Invalid or missing image file", { status: 400 });
        }
        const { s3Key: _, ...newImg } = newImage;

        return Response.json(newImg, {
          status: 201,
          headers: {
            "Content-Type": "application/json",
          },
        });
      }
      case "PATCH": {
        if (imageFile == null) {
          const parsed = makeApiSchema(updateImageSchema).parse({
            ...payload,
            s3Key: null,
            mimeType: null,
          });
          const image = await updateImage(parsed);

          return Response.json(image, {
            status: 200,
            headers: {
              "Content-Type": "application/json",
            },
          });
        } else if (
          imageFile.size != null &&
          imageFile.size > 0 &&
          imageFile.size <= MAX_IMAGE_FILE_SIZE
        ) {
          const arrayBuffer = await imageFile.arrayBuffer();
          const imageBuffer = Buffer.from(arrayBuffer);
          const mimeType = imageFile.type;
          const s3Key = crypto.randomUUID();

          const parsed = makeApiSchema(replaceImageSchema).parse({
            ...payload,
            s3Key,
            mimeType,
          });
          const [newImage] = await Promise.all([
            replaceImage(parsed),
            putS3Object(s3Key, imageBuffer),
          ]);
          const { s3Key: _, ...image } = newImage;

          return Response.json(image, {
            status: 200,
            headers: {
              "Content-Type": "application/json",
            },
          });
        } else {
          return new Response("Invalid or missing image file", { status: 400 });
        }
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
