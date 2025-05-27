import type { Route } from "./+types/route";

import { redirect, useFetcher } from "react-router";
import {
  getImages,
  getItemTypes,
  getTagsWithRawItems,
} from "~/actions/select.server";
import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";
import { Checkbox } from "~/components/ui/checkbox";
import { Button } from "~/components/ui/button";
import { TagField } from "~/components/form/tag-field";
import { ImageField } from "~/components/form/image-field";
import { Main } from "~/components/main";
import { Form } from "~/components/form/form";
import { PositionFieldset } from "~/components/form/position-fieldset";
import { ItemTypeField } from "~/components/form/item-type-field";

export const meta = ({}: Route.MetaArgs) => {
  return [
    { title: "Create Item - ShelfAware" },
    // { name: "description", content: "ShelfAware" },
  ];
};

export const loader = async ({}: Route.LoaderArgs) => {
  const tags = await getTagsWithRawItems();
  const images = await getImages();
  const itemTypes = await getItemTypes();

  return { tags, images, itemTypes };
};

export const action = async ({ request }: Route.ActionArgs) => {
  const itemEndpoint = "/api/item";
  const itemApiUrl = new URL(itemEndpoint, request.url).toString();

  if (request.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  const formData = await request.formData();

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

  return redirect(`/item/${newItem.id}`);
};

const NewItemPage = ({ loaderData }: Route.ComponentProps) => {
  const fetcher = useFetcher({ key: "new-item" });

  return (
    <Main>
      <Form fetcherKey="new-item" method="POST" encType="multipart/form-data">
        <div className="flex items-center justify-between">
          <h2 className="mt-0 mb-0">Create Item</h2>
        </div>
        <div className="flex flex-col w-full space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            type="text"
            id="name"
            name="name"
            autoComplete="off"
            required
            className="w-full"
          />
        </div>
        <ItemTypeField
          itemTypeIdFieldName="itemTypeId"
          itemTypeNameFieldName="itemTypeName"
          label="Type"
          itemTypes={loaderData.itemTypes ?? undefined}
        />
        <div className="flex flex-col w-full space-y-2">
          <Label htmlFor="description">Description</Label>
          <Input
            type="text"
            id="description"
            name="description"
            autoComplete="off"
            className="w-full"
          />
        </div>
        <div className="flex flex-col w-full space-y-2">
          <Label htmlFor="expireAt">Expiration date</Label>
          <Input
            type="date"
            id="expireAt"
            name="expireAt"
            // min={DateTime.now().toISODate()}
            className="w-full"
          />
        </div>
        <div className="flex flex-col w-full space-y-2">
          <Label htmlFor="originalWeight">Original weight (in grams)</Label>
          <Input
            type="number"
            id="originalWeight"
            name="originalWeight"
            className="w-full"
          />
        </div>
        <div className="flex flex-col w-full space-y-2">
          <Label htmlFor="currentWeight">Current weight (in grams)</Label>
          <Input
            type="number"
            id="currentWeight"
            name="currentWeight"
            placeholder="Same as original weight"
            className="w-full"
          />
        </div>
        <div className="my-0.5 flex w-full items-center space-x-2">
          <Checkbox id="isPresent" name="isPresent" defaultChecked />
          <Label htmlFor="isPresent">
            Mark item as currently in the fridge
          </Label>
        </div>
        <PositionFieldset />
        <TagField name="tagId" tags={loaderData.tags} />
        <ImageField
          imageFileFieldName="image"
          imageIdFieldName="imageId"
          label="Image"
          images={loaderData.images}
        />
        <div className="flex flex-col w-full space-y-2">
          <Button type="submit" className="w-fit">
            Create
          </Button>
        </div>
      </Form>
    </Main>
  );
};
export default NewItemPage;
