import type { Route } from "./+types/route";

import { getImageWithData } from "~/actions/select.server";

export const loader = async ({ request }: Route.LoaderArgs) => {
  let relativeUrl: string = "/api/item";
  let id: string | null;
  try {
    const url = new URL(request.url);
    relativeUrl = url.pathname + url.search;
    id = url.searchParams.get("id");
  } catch (err: unknown) {
    console.error(`${relativeUrl}:GET\n`, err, "\n");
    return new Response("Internal Server Error", { status: 500 });
  }

  if (!id) {
    return new Response("Must provide id", { status: 400 });
  }

  try {
    const image = await getImageWithData(Number(id));
    if (!image) {
      return new Response("Image not found", { status: 404 });
    }

    return new Response(image.data, {
      status: 200,
      headers: {
        "Content-Type": image.mimeType,
        "Cache-Control": "public, max-age=60",
      },
    });
  } catch (err: unknown) {
    console.error(`${relativeUrl}\nGET:`, err, "\n");
    return new Response("Internal Server Error", { status: 500 });
  }
};
