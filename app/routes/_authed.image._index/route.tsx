import type { Route } from "./+types/route";

import { getImages } from "~/actions/select.server";

import { Main } from "~/components/main";
import { ImageItem } from "~/components/image-item";
import { ne } from "drizzle-orm";
import { images as imagesTable } from "~/database/schema";

export const meta = ({}: Route.MetaArgs) => {
  return [
    { title: "Images - ShelfAware" },
    // { name: "description", content: "ShelfAware" },
  ];
};

export const loader = async ({}: Route.LoaderArgs) => {
  const images = await getImages([ne(imagesTable.type, "avatar")]);
  return { images };
};

export default ({ loaderData }: Route.ComponentProps) => {
  return (
    <Main>
      <div className="h-full w-full p-4 pb-16 relative flex flex-col gap-y-4 overflow-y-scroll scrollbar">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h2 className="mt-0 mb-0">Images</h2>
          </div>
        </div>
        {loaderData.images.length === 0 ? (
          "No images"
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {loaderData.images?.map((image) => (
              <ImageItem key={image.id} image={image} />
            ))}
          </div>
        )}
      </div>
    </Main>
  );
};
