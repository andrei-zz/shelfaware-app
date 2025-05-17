import type { Route } from "./+types/route";

import { redirect } from "react-router";
import { DateTime } from "luxon";
import { getImage, getImages } from "~/actions/select.server";
import { updateImage, updateImageSchema } from "~/actions/update.server";
import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Main } from "~/components/main";
import { Image } from "~/components/image";
import { Form } from "~/components/form";

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

export const action = async ({ request }: Route.ActionArgs) => {
  if (request.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  const formData = await request.formData();

  const imageData: Record<string, unknown> = {};
  imageData.title = formData.get("title");
  imageData.description = formData.get("description");
  const imageFile = formData.get("image");
  // console.log("imageFile", imageFile, typeof imageFile);
  if (imageFile instanceof File && imageFile.size > 0) {
    const arrayBuffer = await imageFile.arrayBuffer();
    imageData.data = Buffer.from(arrayBuffer);
    imageData.mimeType = imageFile.type;
  }

  if (imageData.data == null) {
    return new Response("Invalid image file", { status: 400 });
  }

  // console.log("imageFormData.data", imageFormData.data);
  const parsed = updateImageSchema.parse(imageData);
  const newImage = await updateImage(parsed);
  // console.log("newImage", newImage);

  return redirect("/");
};

const ImageIdPage = ({ params, loaderData }: Route.ComponentProps) => {
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
        fetcherKey="create-image"
        method="POST"
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
              loaderData?.image?.createdAt != null
                ? DateTime.fromMillis(
                    loaderData?.image?.createdAt
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
              loaderData?.image?.updatedAt != null
                ? DateTime.fromMillis(
                    loaderData?.image?.updatedAt
                  ).toISODate() ?? undefined
                : undefined
            }
            className="w-full"
          />
        </div>
        <div className="flex flex-col w-full space-y-2">
          <Button className="w-fit">Create</Button>
        </div>
      </Form>)}
    </Main>
  );
};
export default ImageIdPage;
