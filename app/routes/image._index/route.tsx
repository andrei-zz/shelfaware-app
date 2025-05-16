import { Link, redirect, useFetcher } from "react-router";
import type { Route } from "./+types/route";
import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { createImage, createImageSchema } from "~/actions/insert.server";

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

const CreateImage = ({}: Route.ComponentProps) => {
  const fetcher = useFetcher({ key: "create-image" });

  return (
    <main className="min-w-full max-h-[calc(100dvh-3rem)] p-4 flex flex-col space-y-4 prose prose-lg">
      <div className="flex items-center justify-between">
        <h2 className="mt-0 mb-0">Create Image</h2>
      </div>
      <fetcher.Form
        method="POST"
        encType="multipart/form-data"
        className="h-full w-full p-1 flex flex-col space-y-4 overflow-y-scroll scrollbar"
      >
        <div className="flex flex-col w-full space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input type="text" id="title" name="title" className="w-full" />
        </div>
        <div className="flex flex-col w-full space-y-2">
          <Label htmlFor="description">Description</Label>
          <Input
            type="text"
            id="description"
            name="description"
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
      </fetcher.Form>
    </main>
  );
};
export default CreateImage;
