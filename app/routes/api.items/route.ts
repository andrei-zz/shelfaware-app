import type { Route } from "./+types/route";

import {
  getPresentItems,
  getPresentItemsAtTime,
} from "~/actions/select.server";

export const loader = async ({ request }: Route.LoaderArgs) => {
  let relativeUrl: string = "/api/items";
  const urlSearchParams: Record<string, string | null> = {};
  try {
    const url = new URL(request.url);
    relativeUrl = url.pathname + url.search;
    urlSearchParams.timestamp = url.searchParams.get("timestamp");
  } catch (err: unknown) {
    console.error(relativeUrl, "\n", err, "\n");
    return Response.json(
      { error: "Internal Server Error" },
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  try {
    let items;
    if (urlSearchParams.timestamp == null) {
      items = await getPresentItems();
    } else {
      items = await getPresentItemsAtTime(
        Number(urlSearchParams.timestamp)
      );
    }

    if (!items) {

    }
    
    return Response.json(items, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (err: unknown) {
    console.error(relativeUrl, "\n", err, "\n");
    return Response.json(
      { error: "Internal Server Error" },
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
