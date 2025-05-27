import type { Route } from "./+types/route";

import { redirect, useFetcher } from "react-router";

import { eventTypeEnum } from "~/database/schema";
import { getImages, getItems } from "~/actions/select.server";

import { Main } from "~/components/main";
import { Form } from "~/components/form/form";
import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { Button } from "~/components/ui/button";
import { ImageField } from "~/components/form/image-field";
import { PositionFieldset } from "~/components/form/position-fieldset";
import { ItemField } from "~/components/form/item-field";
import { ItemEventType } from "~/components/item-event-type";

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
      <Form
        fetcherKey="new-item-event"
        method="POST"
        encType="multipart/form-data"
      >
        <div className="flex items-center justify-between">
          <h2 className="mt-0 mb-0">Create Item Event</h2>
        </div>
        <ItemField items={loaderData.items} required />
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
        </div>
        <div className="flex flex-col w-full space-y-2">
          <Label htmlFor="weight">Current item weight (in grams)</Label>
          <Input type="number" id="weight" name="weight" className="w-full" />
        </div>
        <PositionFieldset />
        <ImageField
          imageFileFieldName="image"
          imageIdFieldName="imageId"
          label="Image"
          images={loaderData.images}
        />
        <div className="flex flex-col w-full space-y-2">
          <Button className="w-fit">Create</Button>
        </div>
      </Form>
    </Main>
  );
};
export default NewItemEventPage;
