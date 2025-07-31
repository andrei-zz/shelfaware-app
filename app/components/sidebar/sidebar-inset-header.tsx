import { cn } from "~/lib/utils";
import { Separator } from "~/components/ui/separator";
import { SidebarTrigger, useSidebar } from "~/components/ui/sidebar";
import { RouteBreadcrumb } from "./route-breadcrumb";

export const SidebarInsetHeader = () => {
  const { isMobile, state } = useSidebar();

  return (
    <header
      className={cn(
        "flex sticky top-0 h-12 bg-background shrink-0 items-center border-b px-4 gap-2 transition-[height]",
        !isMobile && state === "expanded" ? "h-16" : "h-12"
      )}
    >
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 h-4" />
      <RouteBreadcrumb />
    </header>
  );
};
