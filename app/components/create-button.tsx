import { useLocation } from "react-router";
import { Plus } from "lucide-react";

import { CtxMenu } from "~/components/ctx-menu";
import { Button } from "~/components/ui/button";

export const CreateButton = () => {
  const location = useLocation();

  return (
    <CtxMenu
      asChild
      features={["click", "checkbox"]}
      dropdownMenuValue={location.pathname}
      dropdownItems={[
        {
          key: "/item/new",
          label: "Item",
          props: { linkProps: { to: "/item/new" } },
        },
        {
          key: "/tag/new",
          label: "Tag",
          props: { linkProps: { to: "/tag/new" } },
        },
        {
          key: "/item-event/new",
          label: "Item event",
          props: { linkProps: { to: "/item-event/new" } },
        },
        // {
        //   key: "/item-type/new",
        //   label: "Item type",
        //   props: { linkProps: { to: "/item-type/new" }, disabled: true },
        // },
        {
          key: "/image/new",
          label: "Image",
          props: { linkProps: { to: "/image/new" } },
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
