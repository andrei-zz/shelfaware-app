import type { Route } from "./+types/route";

import { useFetcher } from "react-router";
import { DateTime } from "luxon";

import {
  getImages,
  getItem,
  getItemTypes,
  getTagsWithRawItems,
} from "~/actions/select.server";

import { Main } from "~/components/main";
import { Form } from "~/components/form/form";
import { PositionFieldset } from "~/components/form/position-fieldset";
import { TagField } from "~/components/form/tag-field";
import { ImageField } from "~/components/form/image-field";
import { ItemTypeField } from "~/components/form/item-type-field";
import { SubmitButton } from "~/components/form/submit-button";
import { Field } from "~/components/form/field";
import { CheckboxField } from "~/components/form/checkbox-field";

export const meta = ({ params }: Route.MetaArgs) => {
  return [
    {
      title: `Edit Item${
        params.itemId ? " #" + params.itemId : ""
      } - ShelfAware`,
    },
    // { name: "description", content: "ShelfAware" },
  ];
};

export const loader = async ({ params }: Route.LoaderArgs) => {
  const item = await getItem(Number(params.itemId));
  const tags = await getTagsWithRawItems();
  const images = await getImages();
  const itemTypes = await getItemTypes();

  return { item, tags, images, itemTypes };
};

export const action = async ({ request, params }: Route.ActionArgs) => {
  const itemEndpoint = "/api/item";
  const itemApiUrl = new URL(itemEndpoint, request.url).toString();

  if (request.method !== "PATCH") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  const formData = await request.formData();
  formData.append("id", params.itemId);

  await new Promise((resolve) => setTimeout(resolve, 5000));

  const res = await fetch(itemApiUrl, {
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

  const newItem = await res.json();

  if (!newItem || !newItem.id) {
    return new Response(`${itemEndpoint} returns corrupted data`, {
      status: 500,
    });
  }

  return null;
};

const EditItemPage = ({ params, loaderData }: Route.ComponentProps) => {
  const fetcher = useFetcher({ key: "edit-item" });

  return (
    <Main>
      {loaderData.item == null ? (
        <div className="h-full w-full p-4 pb-16 flex flex-col gap-y-4 overflow-y-scroll scrollbar">
          <div className="flex items-center justify-between">
            <h2 className="mt-0 mb-0">{`Edit Item${
              params.itemId ? " #" + params.itemId : ""
            }`}</h2>
          </div>
          <span>Item not found</span>
        </div>
      ) : (
        <Form
          fetcher={fetcher}
          method="PATCH"
          encType="multipart/form-data"
          navigate={false}
        >
          <div className="flex items-center justify-between">
            <h2 className="mt-0 mb-0">{`Edit Item${
              params.itemId ? " #" + params.itemId : ""
            }`}</h2>
          </div>
          <Field
            type="number"
            id="id"
            readOnly
            disabled
            label="ID"
            value={loaderData.item?.id}
            fieldErrors={fetcher.data?.errors?.id}
          />
          <Field
            name="name"
            required
            defaultValue={loaderData.item?.name}
            label="Name"
            fieldErrors={fetcher.data?.errors?.name}
          />
          <ItemTypeField
            itemTypeIdFieldName="itemTypeId"
            itemTypeNameFieldName="itemTypeName"
            label="Type"
            itemType={loaderData.item?.type ?? undefined}
            itemTypes={loaderData.itemTypes ?? undefined}
            itemTypeIdFieldErrors={fetcher.data?.errors?.itemTypeId}
            itemTypeNameFieldErrors={fetcher.data?.errors?.itemTypeName}
          />
          <Field
            name="description"
            defaultValue={loaderData.item?.description ?? undefined}
            label="Description"
            fieldErrors={fetcher.data?.errors?.description}
          />
          <Field
            type="date"
            name="expireAt"
            // min={DateTime.now().toISODate()}
            defaultValue={
              loaderData.item?.expireAt != null
                ? DateTime.fromMillis(loaderData.item?.expireAt).toISODate() ??
                  undefined
                : undefined
            }
            label="Expiration date"
            fieldErrors={fetcher.data?.errors?.expireAt}
          />
          <Field
            type="number"
            name="currentWeight"
            placeholder="Same as original weight"
            defaultValue={loaderData.item?.currentWeight ?? undefined}
            label="Current weight (in grams)"
            fieldErrors={fetcher.data?.errors?.currentWeight}
          />
          <CheckboxField
            name="isPresent"
            defaultChecked={loaderData.item?.isPresent ?? true}
            label="Mark item as currently in the fridge"
            fieldErrors={fetcher.data?.errors?.isPresent}
          />
          <PositionFieldset
            plateInputProps={{
              defaultValue: loaderData.item?.plate ?? undefined,
            }}
            rowInputProps={{ defaultValue: loaderData.item?.row ?? undefined }}
            colInputProps={{ defaultValue: loaderData.item?.col ?? undefined }}
            plateFieldErrors={fetcher.data?.errors?.plate}
            rowFieldErrors={fetcher.data?.errors?.row}
            colFieldErrors={fetcher.data?.errors?.col}
          />
          <Field
            type="date"
            id="createdAt"
            readOnly
            disabled
            defaultValue={
              loaderData.item?.createdAt != null
                ? DateTime.fromMillis(loaderData.item?.createdAt).toISODate() ??
                  undefined
                : undefined
            }
            label="Item creation date"
            fieldErrors={fetcher.data?.errors?.createdAt}
          />
          <Field
            type="date"
            id="updatedAt"
            readOnly
            disabled
            defaultValue={
              loaderData.item?.updatedAt != null
                ? DateTime.fromMillis(loaderData.item?.updatedAt).toISODate() ??
                  undefined
                : undefined
            }
            label="Last updated date"
            fieldErrors={fetcher.data?.errors?.updatedAt}
          />
          <TagField
            name="tagId"
            tags={loaderData.tags}
            tag={loaderData.item.tag}
            fieldErrors={fetcher.data?.errors?.tagId}
          />
          <ImageField
            imageFileFieldName="image"
            imageIdFieldName="imageId"
            label="Image"
            image={loaderData.item?.image ?? undefined}
            images={loaderData.images}
            imageFileFieldErrors={fetcher.data?.errors?.image}
            imageIdFieldErrors={fetcher.data?.errors?.imageId}
          />
          <SubmitButton fetcher={fetcher}>Edit</SubmitButton>
        </Form>
      )}
    </Main>
  );
};
export default EditItemPage;
