import type { Route } from "./+types/route";

import { Link, redirect } from "react-router";
import { createImage, createImageSchema } from "~/actions/insert.server";
import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Main } from "~/components/main";
import { Form } from "~/components/form";

export const handle = {
  breadcrumb: () => <Link to="/image">Image</Link>,
};

export const meta = ({}: Route.MetaArgs) => {
  return [
    { title: "Create Image - ShelfAware" },
    // { name: "description", content: "ShelfAware" },
  ];
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
  const parsed = createImageSchema.parse(imageData);
  const newImage = await createImage(parsed);
  // console.log("newImage", newImage);

  return redirect("/");
};

const ImagePage = ({}: Route.ComponentProps) => {
  return (
    <Main>
      <Form
        fetcherKey="create-image"
        method="POST"
        encType="multipart/form-data"
      >
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
export default ImagePage;
