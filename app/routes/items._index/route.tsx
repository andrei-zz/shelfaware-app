import type { Route } from "./+types/route";

import { NavLink } from "react-router";
import { Plus } from "lucide-react";
import { getPresentItems } from "~/actions/select.server";
import { Button } from "~/components/ui/button";
import { FridgeItem } from "~/components/fridge-item";
import { CtxMenu } from "~/components/ctx-menu";

export const meta = ({}: Route.MetaArgs) => {
  return [
    { title: "Items - ShelfAware" },
    // { name: "description", content: "ShelfAware" },
  ];
};

// export function headers(_: Route.HeadersArgs) {
//   return {
//     "Cache-Control": "s-maxage=1, stale-while-revalidate=59",
//   };
// }

export const loader = async ({ request }: Route.LoaderArgs) => {
  const items = await getPresentItems();
  return { items };
};

const Home = ({ loaderData }: Route.ComponentProps) => {
  return (
    <main className="min-w-full max-h-dvh p-4 flex flex-col space-y-4 prose prose-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="mt-0 mb-0">Your Fridge</h2>
        </div>
        <CtxMenu
          asChild
          features={["click"]}
          dropdownItems={[
            {
              key: "/item",
              props: { children: <NavLink to="/item">Item</NavLink> },
            },
            {
              key: "/tag",
              props: { children: <NavLink to="/tag">Tag</NavLink> },
            },
            {
              key: "/item-event",
              props: {
                disabled: true,
                children: <NavLink to="/item-event">Item event</NavLink>,
              },
            },
            {
              key: "/item-type",
              props: {
                disabled: true,
                children: <NavLink to="/item-type">Item type</NavLink>,
              },
            },
            {
              key: "/image",
              props: {
                disabled: true,
                children: <NavLink to="/image">Image</NavLink>,
              },
            },
          ]}
        >
          <Button>
            <Plus /> Create
          </Button>
        </CtxMenu>
      </div>
      <div className="h-full flex flex-col space-y-2 overflow-y-scroll scrollbar">
        {loaderData.items.map((item) => (
          <FridgeItem key={item.id} item={item} />
        ))}
      </div>
    </main>
  );
};
export default Home;
