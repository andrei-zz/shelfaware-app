import { cn } from "~/lib/utils";
import { Separator } from "~/components/ui/separator";
import { SidebarTrigger, useSidebar } from "~/components/ui/sidebar";
import { RouteBreadcrumb } from "./route-breadcrumb";

export const SidebarInsetHeader = () => {
  const { isMobile, state, openMobile, setOpenMobile } = useSidebar();

  return (
    <header
      className={cn(
        "flex sticky top-0 bg-background h-12 shrink-0 items-center border-b px-4 gap-2"
      )}
    >
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 h-4" />
      <RouteBreadcrumb />
    </header>
  );
};
