import { Link } from "react-router";
import { LockKeyhole, Menu, UserPen } from "lucide-react";

import type { getUser } from "~/actions/select.server";

import { getInitials } from "~/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { SidebarMenuButton, useSidebar } from "../ui/sidebar";
import {
  Card,
  CardAction,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import { Image } from "../image";
import { ThemeToggle } from "../theme-toggle";

export const SidebarFooterButton = ({
  user,
}: {
  user?: Awaited<ReturnType<typeof getUser>>;
}) => {
  const { isMobile } = useSidebar();

  return (
    <Popover>
      <Tooltip>
        <PopoverTrigger asChild>
          <TooltipTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="flex w-full items-center gap-2 px-2! py-2! min-h-fit justify-between data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="flex items-center gap-2">
                {user?.avatar?.id ? (
                  <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg overflow-hidden">
                    <Image
                      src={`/api/image?id=${user.avatar.id}`}
                      containerProps={{ className: "size-8" }}
                    />
                  </div>
                ) : (
                  <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                    {getInitials(user?.name ?? user?.email.split("@")[0])}
                  </div>
                )}
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-medium">
                    {user?.name ?? user?.email}
                  </span>
                </div>
              </div>
              <Menu />
            </SidebarMenuButton>
          </TooltipTrigger>
        </PopoverTrigger>
        <TooltipContent side="right">
          <p>Add to library</p>
        </TooltipContent>
      </Tooltip>
      <PopoverContent
        asChild
        side={isMobile ? "top" : "right"}
        collisionPadding={8}
        sideOffset={16}
      >
        <Card className="min-w-3xs gap-2">
          <CardHeader className="px-2 items-center">
            <CardTitle className="text-xl">Menu</CardTitle>
            <CardAction className="row-span-1">
              <ThemeToggle
                ctxMenuProps={{
                  features: [
                    "right-click",
                    "long-press",
                    "tooltip",
                    "checkbox",
                  ],
                  dropdownMenuContentProps: {
                    side: "top",
                    sideOffset: 12,
                  },
                  tooltipContentProps: undefined,
                }}
                className="bg-transparent"
              />
            </CardAction>
          </CardHeader>
          <CardContent className="px-0">
            <Button asChild variant="link" className="w-full justify-start">
              <Link to="/account">
                <UserPen /> Account
              </Link>
            </Button>
          </CardContent>
          <CardFooter className="px-0">
            <Button asChild variant="link" className="w-full justify-start">
              <Link to="/logout">
                <LockKeyhole /> Logout
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </PopoverContent>
    </Popover>
  );
};
