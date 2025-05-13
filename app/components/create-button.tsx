import { CtxMenu } from "./ctx-menu";
import { Button } from "./ui/button";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router";

export const CreateButton = () => {
  const navigate = useNavigate();
  return (
    <CtxMenu
      asChild
      features={["click"]}
      dropdownItems={[
        {
          key: "/item",
          label: "Item",
          onSelect: () => navigate("/item"),
        },
        {
          key: "/tag",
          label: "Tag",
          onSelect: () => navigate("/tag"),
        },
        {
          key: "/item-event",
          label: "Item event",
          onSelect: () => navigate("/item-event"),
        },
        {
          key: "/item-type",
          label: "Item type",
          onSelect: () => navigate("/item-type"),
          props: {
            disabled: true,
          },
        },
        {
          key: "/image",
          label: "Image",
          onSelect: () => navigate("/image"),
        },
      ]}
      dropdownMenuCheckboxItemProps={{ className: "px-2" }}
    >
      <Button>
        <Plus /> Create
      </Button>
    </CtxMenu>
  );
};
