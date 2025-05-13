import { redirect, useFetcher } from "react-router";
import type { Route } from "./+types/route";
import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";
import { getImage, getImages } from "~/actions/select.server";
import { Button } from "~/components/ui/button";
import { updateImage, updateImageSchema } from "~/actions/update.server";
import { DateTime } from "luxon";

export const meta = ({ params }: Route.MetaArgs) => {
  return [
    {
      title: `Edit Image${
        params.imageId ? " " + params.imageId : ""
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

// export const images = pgTable("images", {
//   id: serial("id").primaryKey(),
//   title: text("title"),
//   description: text("description"),
//   data: bytea("data").notNull(),
//   mimeType: text("mime_type").notNull(),
//   createdAt: unixTimestamp("created_at")
//     .notNull()
//     .default(sql`now()`),
//   updatedAt: unixTimestamp("updated_at")
//     .notNull()
//     .default(sql`now()`),
// });

const CreateImage = ({ loaderData }: Route.ComponentProps) => {
  const fetcher = useFetcher({ key: "create-image" });

  return (
    <main className="min-w-full max-h-dvh p-4 flex flex-col space-y-4 prose prose-lg">
      <div className="flex items-center justify-between">
        <h2 className="mt-0 mb-0">Create Image</h2>
      </div>
      <fetcher.Form
        method="POST"
        encType="multipart/form-data"
        className="h-full w-full p-1 flex flex-col space-y-4 overflow-y-scroll scrollbar"
      >
        <div className="flex flex-col w-full space-y-2">
          <Label htmlFor="name">ID</Label>
          <Input
            type="number"
            id="id"
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
            <div className="w-48 h-48 flex justify-center items-center hover:bg-accent">
              <img
                className="max-w-full max-h-full contain-layout"
                src={`/api/image?id=${loaderData.image?.id}`}
              />
            </div>
          </div>
        </div>
        <div className="flex flex-col w-full space-y-2">
          <Label htmlFor="mimeType">MIME type</Label>
          <Input
            type="text"
            id="mimeType"
            name="mimeType"
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
      </fetcher.Form>
    </main>
  );
};
export default CreateImage;
