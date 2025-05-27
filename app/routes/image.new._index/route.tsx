import type { Route } from "./+types/route";

import { redirect, useFetcher } from "react-router";

import { Main } from "~/components/main";
import { Form } from "~/components/form/form";
import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";

export const meta = ({}: Route.MetaArgs) => {
  return [
    { title: "Create Image - ShelfAware" },
    // { name: "description", content: "ShelfAware" },
  ];
};

export const action = async ({ request }: Route.ActionArgs) => {
  const imageEndpoint = "/api/image";
  const imageApiUrl = new URL(imageEndpoint, request.url).toString();

  if (request.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  const formData = await request.formData();

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

  return redirect(`/image/${newImage.id}`);
};

const NewImagePage = ({}: Route.ComponentProps) => {
  const fetcher = useFetcher({ key: "new-image" });

  return (
    <Main>
      <Form fetcherKey="new-image" method="POST" encType="multipart/form-data">
        <div className="flex items-center justify-between">
          <h2 className="mt-0 mb-0">Create Image</h2>
        </div>
        <div className="flex flex-col w-full space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            type="text"
            id="title"
            name="title"
            autoComplete="off"
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
          <Label htmlFor="image">Image</Label>
          <Input
            type="file"
            accept="image/*"
            id="image"
            name="image"
            className="text-sm"
          />
        </div>
        <div className="flex flex-col w-full space-y-2">
          <Button className="w-fit">Create</Button>
        </div>
      </Form>
    </Main>
  );
};
export default NewImagePage;
