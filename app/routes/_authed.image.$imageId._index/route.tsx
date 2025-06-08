import type { Route } from "./+types/route";

import { useFetcher } from "react-router";
import { ne } from "drizzle-orm";
import { DateTime } from "luxon";

import { images as imagesTable } from "~/database/schema";
import { authenticate } from "~/actions/auth.server";
import { getImage, getImages } from "~/actions/select.server";

import { Main } from "~/components/main";
import { Form } from "~/components/form/form";
import { Field } from "~/components/form/field";
import { ImageField } from "~/components/form/image-field";
import { SubmitButton } from "~/components/form/submit-button";

export const meta = ({ params }: Route.MetaArgs) => {
  return [
    {
      title: `Edit Image${
        params.imageId ? " #" + params.imageId : ""
      } - ShelfAware`,
    },
    // { name: "description", content: "ShelfAware" },
  ];
};

export const loader = async ({ params }: Route.LoaderArgs) => {
  const image = await getImage(Number(params.imageId));
  const images = await getImages([ne(imagesTable.type, "avatar")]);
  return { image, images };
};

export const action = async ({ params, request }: Route.ActionArgs) => {
  await authenticate(request, request.url);

  const imageEndpoint = "/api/image";
  const imageApiUrl = new URL(imageEndpoint, request.url).toString();

  if (request.method !== "PATCH") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  const formData = await request.formData();
  formData.append("id", params.imageId);

  const res = await fetch(imageApiUrl, {
    method: request.method,
    body: formData,
  });

  if (!res.ok) {
    if (
      (
        res.headers.get("Content-Type") ?? res.headers.get("content-type")
      )?.startsWith("application/json")
    ) {
      const resError = await res.json();
      return Response.json(resError, { status: res.status });
    } else {
      return new Response(res.body, { status: res.status });
    }
  }

  const newImage = await res.json();

  if (!newImage || !newImage.id) {
    return new Response(`${imageEndpoint} returns corrupted data`, {
      status: 500,
    });
  }

  return null;
};

export default ({ params, loaderData }: Route.ComponentProps) => {
  const fetcher = useFetcher({ key: "edit-image" });

  return (
    <Main>
      {loaderData.image == null ? (
        <div className="h-full w-full p-4 pb-16 flex flex-col gap-y-4 overflow-y-scroll scrollbar">
          <div className="flex items-center justify-between">
            <h2 className="mt-0 mb-0">{`Edit Image${
              params.imageId ? " #" + params.imageId : ""
            }`}</h2>
          </div>
          Image not found
        </div>
      ) : (
        <Form fetcher={fetcher} method="PATCH" encType="multipart/form-data">
          <div className="flex items-center justify-between">
            <h2 className="mt-0 mb-0">{`Edit Image${
              params.imageId ? " #" + params.imageId : ""
            }`}</h2>
          </div>
          <Field
            type="number"
            id="id"
            readOnly
            disabled
            label="ID"
            value={loaderData.image?.id}
            fieldErrors={fetcher.data?.errors?.id}
          />
          <Field
            name="title"
            label="Title"
            defaultValue={loaderData.image?.title ?? undefined}
            fieldErrors={fetcher.data?.errors?.title}
          />
          <Field
            name="description"
            defaultValue={loaderData.image?.description ?? undefined}
            label="Description"
            fieldErrors={fetcher.data?.errors?.description}
          />
          <ImageField
            imageFileFieldName="image"
            label="Image"
            image={loaderData.image ?? undefined}
            imageFileFieldErrors={fetcher.data?.errors?.image}
          />
          <Field
            name="mimeType"
            readOnly
            disabled
            defaultValue={loaderData.image?.mimeType ?? undefined}
            label="MIME type"
            fieldErrors={fetcher.data?.errors?.mimeType}
          />
          <Field
            type="datetime-local"
            id="createdAt"
            readOnly
            disabled
            defaultValue={
              loaderData.image?.createdAt != null
                ? DateTime.fromMillis(
                    Math.round(loaderData.image.createdAt / 1000) * 1000
                  ).toISO({
                    includeOffset: false,
                    suppressMilliseconds: true,
                  }) ?? undefined
                : undefined
            }
            label="Image creation date"
            fieldErrors={fetcher.data?.errors?.createdAt}
          />
          <Field
            type="datetime-local"
            id="replacedAt"
            readOnly
            disabled
            defaultValue={
              loaderData.image?.replacedAt != null
                ? DateTime.fromMillis(
                    Math.round(loaderData.image.replacedAt / 1000) * 1000
                  ).toISO({
                    includeOffset: false,
                    suppressMilliseconds: true,
                  }) ?? undefined
                : undefined
            }
            label="Replaced date"
            fieldErrors={fetcher.data?.errors?.replacedAt}
          />
          <SubmitButton fetcher={fetcher}>Edit</SubmitButton>
        </Form>
      )}
    </Main>
  );
};
