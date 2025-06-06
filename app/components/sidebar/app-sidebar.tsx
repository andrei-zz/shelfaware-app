import * as React from "react";
import { useLocation, useNavigate } from "react-router";
import {
  Apple,
  ChevronRight,
  FlagTriangleRight,
  Image,
  Menu,
  Moon,
  ScrollText,
  Sun,
  Tag,
  type LucideProps,
} from "lucide-react";

import { cn, getInitials } from "~/lib/utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "~/components/ui/collapsible";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  useSidebar,
} from "~/components/ui/sidebar";
import { SidebarLink } from "./sidebar-link";
import { CtxMenu } from "../ctx-menu";
import { ThemeToggle } from "../theme-toggle";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { DropdownMenuItem } from "../ui/dropdown-menu";
import type { getUser } from "~/actions/select.server";

const sidebarItems: {
  title: string;
  icon: React.ForwardRefExoticComponent<
    Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>
  >;
  url?: string;
  isActive?: boolean;
  items?: { title: string; url: string }[];
}[] = [
  {
    title: "Items",
    icon: Apple,
    url: "/item",
    isActive: true,
    items: [
      // {
      //   title: "Your Fridge",
      //   url: "/",
      // },
      {
        title: "Your Fridge",
        url: "/item",
      },
      {
        title: "Create item",
        url: "/item/new",
      },
    ],
  },
  {
    title: "Item types",
    icon: FlagTriangleRight,
    url: "/item-type",
    isActive: true,
    items: [
      {
        title: "Item types list",
        url: "/item-type",
      },
      {
        title: "Create item type",
        url: "/item-type/new",
      },
    ],
  },
  {
    title: "Item events",
    icon: ScrollText,
    url: "/item-event",
    isActive: true,
    items: [
      {
        title: "Item events list",
        url: "/item-event",
      },
      {
        title: "Create item event",
        url: "/item-event/new",
      },
    ],
  },
  {
    title: "Tags",
    icon: Tag,
    url: "/tag",
    isActive: true,
    items: [
      {
        title: "Tags list",
        url: "/tag",
      },
      {
        title: "Create tag",
        url: "/tag/new",
      },
    ],
  },
  {
    title: "Images",
    icon: Image,
    url: "/image",
    isActive: true,
    items: [
      {
        title: "Images list",
        url: "/image",
      },
      {
        title: "Create image",
        url: "/image/new",
      },
    ],
  },
];

export function AppSidebar({
  user,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  user?: Awaited<ReturnType<typeof getUser>>;
}) {
  const location = useLocation();
  const navigate = useNavigate();

  const { isMobile, state, openMobile, setOpenMobile } = useSidebar();

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenuButton
          onClick={() => navigate("/")}
          size="lg"
          className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
        >
          <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
            SA
          </div>
          <div className="flex flex-col gap-0.5 leading-none">
            <span className="font-medium">ShelfAware</span>
          </div>
        </SidebarMenuButton>
      </SidebarHeader>
      <SidebarContent className="gap-0">
        {/* We create a collapsible SidebarGroup for each parent. */}
        <SidebarGroup>
          {/* <SidebarGroupLabel>Pages</SidebarGroupLabel> */}
          <SidebarMenu>
            {sidebarItems.map((item) => (
              <Collapsible
                key={item.title}
                asChild
                defaultOpen={item.isActive}
                className="group/collapsible"
              >
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton
                      tooltip={item.title}
                      onClick={() => {
                        if (!isMobile && state === "collapsed" && item.url) {
                          navigate(item.url);
                        }
                      }}
                      className={cn(
                        "transition-colors",
                        !isMobile &&
                          state === "collapsed" &&
                          item.url &&
                          item.url === location.pathname
                          ? "bg-border"
                          : undefined
                      )}
                    >
                      {item.icon && <item.icon />}
                      <span>{item.title}</span>
                      <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.items?.map((subItem) => (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton
                            asChild
                            onClick={() => {
                              if (isMobile && openMobile) {
                                setOpenMobile(false);
                              }
                            }}
                            className={cn(
                              "transition-colors",
                              subItem.url && subItem.url === location.pathname
                                ? "bg-border"
                                : undefined
                            )}
                          >
                            <SidebarLink navLinkProps={{ to: subItem.url }}>
                              {subItem.title}
                            </SidebarLink>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <CtxMenu
          features={["click", "tooltip"]}
          dropdownMenuContentProps={{
            asChild: true,
            side: isMobile ? "top" : "right",
            collisionPadding: 8,
            sideOffset: 16,
          }}
          ctxMenuContent={
            <Card className="min-w-3xs py-2 gap-2 ">
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
                    }}
                    className="bg-transparent"
                  />
                </CardAction>
              </CardHeader>
              <CardContent className="px-1">
                <DropdownMenuItem onSelect={() => {}} className="w-full">
                  Accounts
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => {}} className="w-full">
                  Accounts
                </DropdownMenuItem>
              </CardContent>
              <CardFooter className="px-1">
                <DropdownMenuItem onSelect={() => navigate("/logout")} className="w-full">
                  Logout
                </DropdownMenuItem>
              </CardFooter>
            </Card>
          }
          tooltipContentProps={{
            side: "right",
            children: "Open menu",
          }}
        >
          <SidebarMenuButton
            size="lg"
            className="justify-between data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
          >
            <div className="flex w-full items-center gap-2">
              <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                {getInitials(user?.name ?? user?.email.split("@")[0])}
              </div>
              <div className="flex flex-col gap-0.5 leading-none">
                <span className="font-medium">{user?.name ?? user?.email}</span>
              </div>
            </div>
            <Menu />
          </SidebarMenuButton>
        </CtxMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
