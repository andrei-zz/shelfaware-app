import { getApiKeysByUserId } from "~/actions/select.server";
import type { Route } from "./+types/route";

import { Main } from "~/components/main";
import { authenticate } from "~/actions/auth.server";
import { ApiKeyItem } from "~/components/api-key-item";
import { Button } from "~/components/ui/button";
import { Link } from "react-router";
import { Plus } from "lucide-react";

export const meta = ({}: Route.MetaArgs) => {
  return [
    { title: "API Keys - ShelfAware" },
    // { name: "description", content: "ShelfAware" },
  ];
};

// export function headers(_: Route.HeadersArgs) {
//   return {
//     "Cache-Control": "s-maxage=1, stale-while-revalidate=59",
//   };
// }

export const loader = async ({ request }: Route.LoaderArgs) => {
  const authenticatedUser = await authenticate(request, request.url);

  // const url = new URL(request.url);
  // const raw: unknown = Object.fromEntries(url.searchParams);

  const apiKeys = await getApiKeysByUserId(authenticatedUser.id);
  return { apiKeys };
};

export default ({ loaderData }: Route.ComponentProps) => {
  return (
    <Main>
      <div className="h-full w-full p-4 pb-16 relative flex flex-col gap-y-4 overflow-y-scroll scrollbar">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h2 className="mt-0 mb-0">API Keys</h2>
          </div>
          <Button asChild className="no-underline">
            <Link to="/api-keys/new">
              <Plus /> Create
            </Link>
          </Button>
        </div>
        {Array.isArray(loaderData.apiKeys) && loaderData.apiKeys.length > 0
          ? loaderData.apiKeys.map((apiKey, i) => (
              <ApiKeyItem key={i} apiKey={apiKey} />
            ))
          : "Empty"}
      </div>
    </Main>
  );
};
