import type { Route } from "./+types/route";

import { getTags } from "~/actions/select.server";
import { TagItem } from "~/components/tag-item";
import { Main } from "~/components/main";

export const meta = ({}: Route.MetaArgs) => {
  return [
    { title: "Tags - ShelfAware" },
    // { name: "description", content: "ShelfAware" },
  ];
};

// export function headers(_: Route.HeadersArgs) {
//   return {
//     "Cache-Control": "s-maxage=1, stale-while-revalidate=59",
//   };
// }

export const loader = async ({ request }: Route.LoaderArgs) => {
  const tags = await getTags();
  return { tags };
};

const TagsPage = ({ loaderData }: Route.ComponentProps) => {
  return (
    <Main>
      <div className="h-full w-full p-4 pb-16 relative flex flex-col gap-y-4 overflow-y-scroll scrollbar">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h2 className="mt-0 mb-0">Tags</h2>
          </div>
        </div>
        {loaderData.tags.length === 0
          ? "No tags"
          : loaderData.tags.map((tag) => <TagItem key={tag.id} tag={tag} />)}
      </div>
    </Main>
  );
};
export default TagsPage;
