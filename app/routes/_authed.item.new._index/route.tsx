import type { Route } from "./+types/route";

import { redirect, useFetcher } from "react-router";

import { authenticate } from "~/actions/auth.server";
import {
  getImages,
  getItemTypes,
  getTagsWithRawItems,
} from "~/actions/select.server";

import { Main } from "~/components/main";
import { Form } from "~/components/form/form";
import { Field } from "~/components/form/field";
import { TagField } from "~/components/form/tag-field";
import { ImageField } from "~/components/form/image-field";
import { PositionFieldset } from "~/components/form/position-fieldset";
import { ItemTypeField } from "~/components/form/item-type-field";
import { CheckboxField } from "~/components/form/checkbox-field";
import { SubmitButton } from "~/components/form/submit-button";

export const meta = ({}: Route.MetaArgs) => {
  return [
    { title: "Create Item - ShelfAware" },
    // { name: "description", content: "ShelfAware" },
  ];
};

export const loader = async ({ request }: Route.LoaderArgs) => {
  const tags = await getTagsWithRawItems();
  const images = await getImages();
  const itemTypes = await getItemTypes();

  return { tags, images, itemTypes };
};

export const action = async ({ request }: Route.ActionArgs) => {
  await authenticate(request, request.url);

  const itemEndpoint = "/api/item";
  const itemApiUrl = new URL(itemEndpoint, request.url).toString();

  if (request.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  const formData = await request.formData();
  const cookieHeader = request.headers.get("cookie");

  const res = await fetch(itemApiUrl, {
    method: request.method,
    headers: {
      ...(cookieHeader ? { Cookie: cookieHeader } : {}),
    },
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

  const newItem = await res.json();

  if (!newItem || !newItem.id) {
    return new Response(`${itemEndpoint} returns corrupted data`, {
      status: 500,
    });
  }

  return redirect(`/item/${newItem.id}`);
};

export default ({ loaderData }: Route.ComponentProps) => {
  const fetcher = useFetcher({ key: "new-item" });

  return (
    <Main>
      <Form fetcher={fetcher} method="POST" encType="multipart/form-data">
        <div className="flex items-center justify-between">
          <h2 className="mt-0 mb-0">Create Item</h2>
        </div>
        <Field
          name="name"
          required
          label="Name"
          fieldErrors={fetcher.data?.errors?.name}
        />
        <ItemTypeField
          itemTypeIdFieldName="itemTypeId"
          itemTypeNameFieldName="itemTypeName"
          label="Type"
          itemTypes={loaderData.itemTypes ?? undefined}
          itemTypeIdFieldErrors={fetcher.data?.errors?.itemTypeId}
          itemTypeNameFieldErrors={fetcher.data?.errors?.itemTypeName}
        />
        <Field
          name="description"
          label="Description"
          fieldErrors={fetcher.data?.errors?.description}
        />
        <Field
          type="date"
          name="expireAt"
          // min={DateTime.now().toISODate()}
          label="Expiration date"
          fieldErrors={fetcher.data?.errors?.expireAt}
        />
        <Field
          type="number"
          name="originalWeight"
          label="Original weight (in grams)"
          fieldErrors={fetcher.data?.errors?.originalWeight}
        />
        <Field
          type="number"
          name="currentWeight"
          label="Current weight (in grams)"
          fieldErrors={fetcher.data?.errors?.currentWeight}
        />
        <CheckboxField
          name="isPresent"
          defaultChecked
          label="Mark item as currently in the fridge"
          fieldErrors={fetcher.data?.errors?.isPresent}
        />
        <PositionFieldset
          plateFieldErrors={fetcher.data?.errors?.plate}
          rowFieldErrors={fetcher.data?.errors?.row}
          colFieldErrors={fetcher.data?.errors?.col}
        />
        <TagField
          name="tagId"
          tags={loaderData.tags}
          fieldErrors={fetcher.data?.errors?.tagId}
        />
        <ImageField
          imageFileFieldName="image"
          imageIdFieldName="imageId"
          label="Image"
          images={loaderData.images}
          imageFileFieldErrors={fetcher.data?.errors?.image}
          imageIdFieldErrors={fetcher.data?.errors?.imageId}
        />
        <SubmitButton fetcher={fetcher}>Create</SubmitButton>
      </Form>
    </Main>
  );
};
