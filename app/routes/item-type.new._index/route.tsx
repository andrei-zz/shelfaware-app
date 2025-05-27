import type { Route } from "./+types/route";

import { redirect, useFetcher } from "react-router";

import { Form } from "~/components/form/form";
import { Main } from "~/components/main";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";

export const meta = ({}: Route.MetaArgs) => {
  return [
    { title: "Create Item Type - ShelfAware" },
    // { name: "description", content: "ShelfAware" },
  ];
};

// export const loader = async ({}: Route.LoaderArgs) => {};

export const action = async ({ request }: Route.ActionArgs) => {
  const itemTypeEndpoint = "/api/item-type";
  const itemTypeApiUrl = new URL(itemTypeEndpoint, request.url).toString();

  if (request.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  const formData = await request.formData();

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

  return redirect(`/item-type/${newItemType.id}`);
};

const NewItemTypePage = ({}: Route.ComponentProps) => {
  const fetcher = useFetcher({ key: "new-item-type" });

  return (
    <Main>
      <Form
        fetcherKey="new-item-type"
        method="POST"
        encType="multipart/form-data"
      >
        <div className="flex items-center justify-between">
          <h2 className="mt-0 mb-0">Create Item Type</h2>
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
          <Button className="w-fit">Create</Button>
        </div>
      </Form>
    </Main>
  );
};
export default NewItemTypePage;
