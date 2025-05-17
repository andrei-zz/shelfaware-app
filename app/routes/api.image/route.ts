import type { Route } from "./+types/route";

// import { getImageWithData } from "~/actions/select.server";

const PATHNAME = "/api/item";

export const loader = async ({ request }: Route.LoaderArgs) => {
  let relativeUrl: string = PATHNAME;
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

  return new Response("Service Unavailable", {
    status: 503,
  });

  // try {
  //   const image = await getImageWithData(Number(id));
  //   if (!image) {
  //     return new Response("Image not found", { status: 404 });
  //   }

  //   return new Response(image.data, {
  //     status: 200,
  //     headers: {
  //       "Content-Type": image.mimeType,
  //       "Cache-Control": `public, max-age=${2 * 60 * 60}`, // seconds
  //     },
  //   });
  // } catch (err: unknown) {
  //   console.error(`${relativeUrl}\nGET:`, err, "\n");
  //   return new Response("Internal Server Error", { status: 500 });
  // }
};
