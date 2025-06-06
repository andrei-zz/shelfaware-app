import type { Route } from "./+types/route";

import { useFetcher } from "react-router";
import { DateTime } from "luxon";

import { getItems, getTag } from "~/actions/select.server";

import { Main } from "~/components/main";
import { Form } from "~/components/form/form";
import { Field } from "~/components/form/field";
import { SelectItem } from "~/components/ui/select";
import { ItemField } from "~/components/form/item-field";
import { SubmitButton } from "~/components/form/submit-button";
import { authenticate } from "~/actions/auth.server";

export const meta = ({ params }: Route.MetaArgs) => {
  return [
    {
      title: `Edit Tag${params.tagId ? " #" + params.tagId : ""} - ShelfAware`,
    },
    // { name: "description", content: "ShelfAware" },
  ];
};

export const loader = async ({ request, params }: Route.LoaderArgs) => {
  await authenticate(request, request.url);

  const tag = await getTag(Number(params.tagId));
  const items = await getItems();
  return { tag, items };
};

export const action = async ({ params, request }: Route.ActionArgs) => {
  await authenticate(request, request.url);

  const tagEndpoint = "/api/tag";
  const tagApiUrl = new URL(tagEndpoint, request.url).toString();

  if (request.method !== "PATCH") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  const formData = await request.formData();
  formData.append("id", params.tagId);

  const res = await fetch(tagApiUrl, {
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

  const newTag = await res.json();

  if (!newTag || !newTag.id) {
    return new Response(`${tagEndpoint} returns corrupted data`, {
      status: 500,
    });
  }

  return null;
};

export default ({ params, loaderData }: Route.ComponentProps) => {
  const fetcher = useFetcher({ key: "edit-tag" });

  return (
    <Main>
      {loaderData.tag == null ? (
        <div className="h-full w-full p-4 pb-16 flex flex-col gap-y-4 overflow-y-scroll scrollbar">
          <div className="flex items-center justify-between">
            <h2 className="mt-0 mb-0">{`Edit Tag${
              params.tagId ? " #" + params.tagId : ""
            }`}</h2>
          </div>
          Tag not found
        </div>
      ) : (
        <Form fetcher={fetcher} method="PATCH" encType="multipart/form-data">
          <div className="flex items-center justify-between">
            <h2 className="mt-0 mb-0">{`Edit Tag${
              params.tagId ? " #" + params.tagId : ""
            }`}</h2>
          </div>
          <Field
            type="number"
            id="id"
            readOnly
            disabled
            label="ID"
            defaultValue={loaderData.tag?.id}
            fieldErrors={fetcher.data?.errors?.id}
          />
          <Field
            name="name"
            required
            defaultValue={loaderData.tag?.name}
            label="Name"
            fieldErrors={fetcher.data?.errors?.name}
          />
          <Field
            id="uid"
            readOnly
            disabled
            placeholder="DE AD BE EF"
            defaultValue={loaderData.tag?.uid}
            label="UID (in hex)"
            fieldErrors={fetcher.data?.errors?.uid}
          />
          <ItemField
            items={loaderData.items}
            item={loaderData.tag?.item ?? undefined}
            mapFunction={(item) => (
              <SelectItem key={item.id} value={item.id.toString()}>
                {`#${item.id}: ${item.name}${
                  item.currentWeight == null ? "" : `, ${item.currentWeight} g`
                }${
                  item.tag == null
                    ? ""
                    : item.tag.id === loaderData.tag?.id
                    ? " (attached to this tag)"
                    : ` (attached to ${item.tag.name}, UID: ${item.tag.uid})`
                }`}
              </SelectItem>
            )}
            labelProps={{ children: "Attached item" }}
            selectValueProps={{ placeholder: "Unattached" }}
            fieldErrors={fetcher.data?.errors?.itemId}
          />
          <Field
            type="date"
            id="createdAt"
            readOnly
            disabled
            defaultValue={
              loaderData.tag?.createdAt != null
                ? DateTime.fromMillis(loaderData.tag?.createdAt).toISODate() ??
                  undefined
                : undefined
            }
            label="Tag creation date"
            fieldErrors={fetcher.data?.errors?.createdAt}
          />
          <Field
            type="date"
            id="attachedAt"
            readOnly
            disabled
            defaultValue={
              loaderData.tag?.attachedAt != null
                ? DateTime.fromMillis(loaderData.tag?.attachedAt).toISODate() ??
                  undefined
                : undefined
            }
            label="Attached date"
            fieldErrors={fetcher.data?.errors?.attachedAt}
          />
          <SubmitButton fetcher={fetcher}>Edit</SubmitButton>
        </Form>
      )}
    </Main>
  );
};
