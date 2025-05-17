import * as React from "react";
import { Apple, ChevronRight, Image, ScrollText, Tag } from "lucide-react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "~/components/ui/collapsible";
import {
  Sidebar,
  SidebarContent,
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
import { useLocation, useNavigate } from "react-router";
import { cn } from "~/lib/utils";

// This is sample data.
const data = {
  navMain: [
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
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const location = useLocation();
  const navigate = useNavigate();

  const { isMobile, state, openMobile, setOpenMobile } = useSidebar();

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
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
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="gap-0">
        {/* We create a collapsible SidebarGroup for each parent. */}
        <SidebarGroup>
          {/* <SidebarGroupLabel>Pages</SidebarGroupLabel> */}
          <SidebarMenu>
            {data.navMain.map((item) => (
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
      <SidebarRail />
    </Sidebar>
  );
}
