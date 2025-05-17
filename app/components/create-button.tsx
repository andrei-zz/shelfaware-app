import { useLocation } from "react-router";
import { Plus } from "lucide-react";
import { CtxMenu } from "~/components/ctx-menu";
import { Button } from "~/components/ui/button";

export const CreateButton = () => {
  const location = useLocation();

  return (
    <CtxMenu
      asChild
      features={["click"]}
      dropdownMenuValue={location.pathname}
      dropdownItems={[
        {
          key: "/item",
          label: "Item",
          props: { linkProps: { to: "/item" } },
        },
        {
          key: "/tag",
          label: "Tag",
          props: { linkProps: { to: "/tag" } },
        },
        {
          key: "/item-event",
          label: "Item event",
          props: { linkProps: { to: "/item-event" } },
        },
        // {
        //   key: "/item-type",
        //   label: "Item type",
        //   props: { linkProps: { to: "/item-type" }, disabled: true },
        // },
        {
          key: "/image",
          label: "Image",
          props: { linkProps: { to: "/image" } },
        },
      ]}
      dropdownMenuCheckboxItemProps={{ asLink: true, className: "px-2" }}
    >
      <Button>
        <Plus /> Create
      </Button>
    </CtxMenu>
  );
};
