import type { Route } from "./+types/route";

import { NavLink } from "react-router";
import { Plus } from "lucide-react";
import { getTags } from "~/actions/select.server";
import { Button } from "~/components/ui/button";
import { TagItem } from "~/components/tag-item";
import { CtxMenu } from "~/components/ctx-menu";
import { CreateButton } from "~/components/create-button";

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
    <main className="min-w-full max-h-dvh p-4 flex flex-col space-y-4 prose prose-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="mt-0 mb-0">Tags</h2>
        </div>
        <CreateButton />
      </div>
      <div className="h-full p-1 flex flex-col space-y-2 overflow-y-scroll scrollbar">
        {loaderData.tags.length === 0
          ? "Empty"
          : loaderData.tags.map((tag) => <TagItem key={tag.id} tag={tag} />)}
      </div>
    </main>
  );
};
export default TagsPage;
