import type { Route } from "./+types/route";

import { useFetcher } from "react-router";
import { DateTime } from "luxon";

import { getImage, getImages } from "~/actions/select.server";

import { Main } from "~/components/main";
import { Form } from "~/components/form/form";
import { Image } from "~/components/image";
import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";

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
  const images = await getImages();
  return { image, images };
};

export const action = async ({ params, request }: Route.ActionArgs) => {
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

const EditImagePage = ({ params, loaderData }: Route.ComponentProps) => {
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
        <Form
          fetcherKey="edit-image"
          method="PATCH"
          encType="multipart/form-data"
        >
          <div className="flex items-center justify-between">
            <h2 className="mt-0 mb-0">{`Edit Image${
              params.imageId ? " #" + params.imageId : ""
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
              value={loaderData.image?.id}
              className="w-full"
            />
          </div>
          <div className="flex flex-col w-full space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              type="text"
              id="title"
              name="title"
              autoComplete="off"
              defaultValue={loaderData.image?.title ?? undefined}
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
              defaultValue={loaderData.image?.description ?? undefined}
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
            <div className="flex flex-col">
              <span className="text-sm font-light">Current</span>
              <Image
                src={
                  loaderData.image == null
                    ? undefined
                    : `/api/image?id=${loaderData.image.id}`
                }
                size="lg"
                containerProps={{
                  className: "hover:bg-accent hover:**:opacity-80",
                }}
              />
            </div>
          </div>
          <div className="flex flex-col w-full space-y-2">
            <Label htmlFor="mimeType">MIME type</Label>
            <Input
              type="text"
              id="mimeType"
              name="mimeType"
              autoComplete="off"
              readOnly
              disabled
              defaultValue={loaderData.image?.mimeType ?? undefined}
              className="w-full"
            />
          </div>
          <div className="flex flex-col w-full space-y-2">
            <Label htmlFor="createdAt">Image creation date</Label>
            <Input
              type="date"
              id="createdAt"
              readOnly
              disabled
              defaultValue={
                loaderData.image?.createdAt != null
                  ? DateTime.fromMillis(
                      loaderData.image?.createdAt
                    ).toISODate() ?? undefined
                  : undefined
              }
              className="w-full"
            />
          </div>
          <div className="flex flex-col w-full space-y-2">
            <Label htmlFor="replacedAt">Replaced date</Label>
            <Input
              type="date"
              id="replacedAt"
              readOnly
              disabled
              defaultValue={
                loaderData.image?.replacedAt != null
                  ? DateTime.fromMillis(
                      loaderData.image?.replacedAt
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
export default EditImagePage;
