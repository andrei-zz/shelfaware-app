import type { Route } from "./+types/route";

import { Outlet } from "react-router";

export default ({}: Route.ComponentProps) => {
  return <Outlet />;
};
