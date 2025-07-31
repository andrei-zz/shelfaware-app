import type { Route } from "./+types/route";

import { redirect } from "react-router";

import { sessionStorage } from "~/actions/auth.server";

export const loader = async ({ request }: Route.LoaderArgs) => {
  let session = await sessionStorage.getSession(request.headers.get("cookie"));
  return redirect("/login", {
    headers: { "Set-Cookie": await sessionStorage.destroySession(session) },
  });
};
