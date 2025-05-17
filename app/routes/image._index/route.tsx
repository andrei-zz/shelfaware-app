import type { Route } from "./+types/route";

import { getImages } from "~/actions/select.server";
import { Main } from "~/components/main";
import { ImageItem } from "~/components/image-item";

export const loader = async ({}: Route.LoaderArgs) => {
  const images = await getImages();
  return { images };
};

const ImagesPage = ({ loaderData }: Route.ComponentProps) => {
  return (
    <Main>
      <div className="h-full w-full p-4 pb-16 flex flex-col gap-y-4 overflow-y-scroll scrollbar">
        <div className="grid grid-cols-3 gap-2">
          {loaderData.images?.map((image) => (
            <ImageItem key={image.id} image={image} />
          ))}
        </div>
      </div>
    </Main>
  );
};
export default ImagesPage;
