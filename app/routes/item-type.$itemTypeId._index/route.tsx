import type { Route } from "./+types/route";

import { replace, useFetcher } from "react-router";
import { DateTime } from "luxon";

import { getItemType } from "~/actions/select.server";

import { Main } from "~/components/main";
import { Form } from "~/components/form/form";
import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";

export const meta = ({ params }: Route.MetaArgs) => {
  return [
    {
      title: `Edit Item Type${
        params.itemTypeId ? " #" + params.itemTypeId : ""
      } - ShelfAware`,
    },
    // { name: "description", content: "ShelfAware" },
  ];
};

export const loader = async ({ params }: Route.LoaderArgs) => {
  const itemType = await getItemType(Number(params.itemTypeId));

  return { itemType };
};

export const action = async ({ params, request }: Route.ActionArgs) => {
  const itemTypeEndpoint = "/api/item-type";
  const itemTypeApiUrl = new URL(itemTypeEndpoint, request.url).toString();

  if (request.method !== "PATCH") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  const formData = await request.formData();
  formData.append("id", params.itemTypeId);

  const res = await fetch(itemTypeApiUrl, {
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

  const newItemType = await res.json();

  if (!newItemType || !newItemType.id) {
    return new Response(`${itemTypeEndpoint} returns corrupted data`, {
      status: 500,
    });
  }

  return null;
};

const EditItemTypePage = ({ params, loaderData }: Route.ComponentProps) => {
  const fetcher = useFetcher({ key: "edit-item-type" });

  return (
    <Main>
      {loaderData.itemType == null ? (
        <div className="h-full w-full p-4 pb-16 flex flex-col gap-y-4 overflow-y-scroll scrollbar">
          <div className="flex items-center justify-between">
            <h2 className="mt-0 mb-0">{`Edit Item Type${
              params.itemTypeId ? " #" + params.itemTypeId : ""
            }`}</h2>
          </div>
          <span>Item type not found</span>
        </div>
      ) : (
        <Form
          fetcherKey="edit-item-type"
          method="PATCH"
          encType="multipart/form-data"
        >
          <div className="flex items-center justify-between">
            <h2 className="mt-0 mb-0">{`Edit Item Type${
              params.itemTypeId ? " #" + params.itemTypeId : ""
            }`}</h2>
          </div>
          <div className="flex flex-col w-full space-y-2">
            <Label htmlFor="name">ID</Label>
            <Input
              type="number"
              id="id"
              autoComplete="off"
              readOnly
              disabled
              value={loaderData.itemType?.id}
              className="w-full"
            />
          </div>
          <div className="flex flex-col w-full space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              type="text"
              id="name"
              name="name"
              autoComplete="off"
              required
              defaultValue={loaderData.itemType?.name}
              className="w-full"
            />
          </div>
          <div className="flex flex-col w-full space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              type="text"
              id="description"
              name="description"
              autoComplete="off"
              defaultValue={loaderData.itemType?.description ?? undefined}
              className="w-full"
            />
          </div>
          <div className="flex flex-col w-full space-y-2">
            <Label htmlFor="createdAt">Item type creation date</Label>
            <Input
              type="date"
              id="createdAt"
              readOnly
              disabled
              defaultValue={
                loaderData.itemType?.createdAt != null
                  ? DateTime.fromMillis(
                      loaderData.itemType?.createdAt
                    ).toISODate() ?? undefined
                  : undefined
              }
              className="w-full"
            />
          </div>
          <div className="flex flex-col w-full space-y-2">
            <Label htmlFor="updatedAt">Last updated date</Label>
            <Input
              type="date"
              id="updatedAt"
              readOnly
              disabled
              defaultValue={
                loaderData.itemType?.updatedAt != null
                  ? DateTime.fromMillis(
                      loaderData.itemType?.updatedAt
                    ).toISODate() ?? undefined
                  : undefined
              }
              className="w-full"
            />
          </div>
          <div className="flex flex-col w-full space-y-2">
            <Button className="w-fit">Edit</Button>
          </div>
        </Form>
      )}
    </Main>
  );
};
export default EditItemTypePage;
