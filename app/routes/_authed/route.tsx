import type { Route } from "./+types/route";
import { Outlet } from "react-router";

import { authenticate } from "~/actions/auth.server";

import { SidebarInset, SidebarWrapper } from "~/components/ui/sidebar";
import { AppSidebar } from "~/components/sidebar/app-sidebar";
import { SidebarInsetHeader } from "~/components/sidebar/sidebar-inset-header";
import { getUser } from "~/actions/select.server";

export const loader = async ({ request }: Route.LoaderArgs) => {
  const authenticatedUser = await authenticate(request, request.url);

  const user = await getUser(authenticatedUser.id);
  return { user };
};

export default ({ loaderData }: Route.ComponentProps) => {
  return (
    <SidebarWrapper>
      <AppSidebar user={loaderData.user} />
      <SidebarInset>
        <SidebarInsetHeader />
        <Outlet />
      </SidebarInset>
    </SidebarWrapper>
  );
};
