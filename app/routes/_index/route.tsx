import type { Route } from "./+types/route";

import { redirect } from "react-router";

export const loader = async ({}: Route.LoaderArgs) => redirect("/item");
