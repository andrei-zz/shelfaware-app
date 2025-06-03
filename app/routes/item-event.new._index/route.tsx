import type { Route } from "./+types/route";

import { redirect, useFetcher } from "react-router";

import { eventTypeEnum } from "~/database/schema";
import { getImages, getItems } from "~/actions/select.server";

import { Main } from "~/components/main";
import { Form } from "~/components/form/form";
import { Field } from "~/components/form/field";
import { Label } from "~/components/ui/label";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { ImageField } from "~/components/form/image-field";
import { PositionFieldset } from "~/components/form/position-fieldset";
import { ItemField } from "~/components/form/item-field";
import { ItemEventType } from "~/components/item-event-type";
import { FieldError } from "~/components/form/field-error";
import { SubmitButton } from "~/components/form/submit-button";

export const meta = ({}: Route.MetaArgs) => {
  return [
    { title: "Create Item Event - ShelfAware" },
    // { name: "description", content: "ShelfAware" },
  ];
};

export const loader = async ({}: Route.LoaderArgs) => {
  const items = await getItems();
  const images = await getImages();
  return { items, images };
};

export const action = async ({ request }: Route.ActionArgs) => {
  const itemEventEndpoint = "/api/item-event";
  const itemEventApiUrl = new URL(itemEventEndpoint, request.url).toString();

  if (request.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  const formData = await request.formData();

  const res = await fetch(itemEventApiUrl, {
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

  const newItemEvent = await res.json();

  if (!newItemEvent || !newItemEvent.id) {
    return new Response(`${itemEventEndpoint} returns corrupted data`, {
      status: 500,
    });
  }

  return redirect(`/item-event`);
};

const NewItemEventPage = ({ loaderData }: Route.ComponentProps) => {
  const fetcher = useFetcher({ key: "new-item-event" });

  return (
    <Main>
      <Form fetcher={fetcher} method="POST" encType="multipart/form-data">
        <div className="flex items-center justify-between">
          <h2 className="mt-0 mb-0">Create Item Event</h2>
        </div>
        <ItemField
          items={loaderData.items}
          required
          fieldErrors={fetcher.data?.errors?.itemId}
        />
        <div className="flex flex-col w-full space-y-2">
          <Label>Event type</Label>
          <RadioGroup
            name="eventType"
            required
            className="flex flex-col w-full items-center gap-2"
          >
            {eventTypeEnum.enumValues.map((type) => (
              <div
                key={`eventType-${type}`}
                className="flex w-full items-center space-x-2"
              >
                <RadioGroupItem id={`eventType-${type}`} value={type} />
                <Label htmlFor={`eventType-${type}`}>
                  <ItemEventType type={type} />
                </Label>
              </div>
            ))}
          </RadioGroup>
          {Array.isArray(fetcher.data?.errors?.eventType) &&
          fetcher.data?.errors?.eventType.length > 0 ? (
            <FieldError>{fetcher.data?.errors?.eventType[0]}</FieldError>
          ) : null}
        </div>
        <Field
          type="number"
          name="weight"
          label="Current item weight (in grams)"
          fieldErrors={fetcher.data?.errors?.weight}
        />
        <PositionFieldset
          plateFieldErrors={fetcher.data?.errors?.plate}
          rowFieldErrors={fetcher.data?.errors?.row}
          colFieldErrors={fetcher.data?.errors?.col}
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
export default NewItemEventPage;
